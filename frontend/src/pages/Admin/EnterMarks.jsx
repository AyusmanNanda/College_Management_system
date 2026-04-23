import { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";
import ConfirmSaveModal from "./modals/ConfirmSaveModal.jsx";
import Toast from "./Toast.jsx";

const EnterMarks = () => {
    const token = localStorage.getItem("token");

    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);

    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedSem, setSelectedSem] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");

    const [subjectDetails, setSubjectDetails] = useState(null);
    const [marks, setMarks] = useState({});

    const [error, setError] = useState("");
    const [toast, setToast] = useState(null);
    const [showSaveModal, setShowSaveModal] = useState(false);

    /* ================= UX HELPERS ================= */

    const preventSymbols = (e) => {
        if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 || (e.keyCode >= 35 && e.keyCode <= 39)) {
            return;
        }
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    };

    const handleEnterMove = (e) => {
        const table = e.target.closest("table");
        const inputs = Array.from(table.querySelectorAll("input[type='number']"));
        const index = inputs.indexOf(e.target);

        if (e.key === "Enter") {
            e.preventDefault();
            if (inputs[index + 1]) {
                inputs[index + 1].focus();
                inputs[index + 1].select();
            }
        }
        if (e.key === "ArrowDown") {
            if (inputs[index + 1]) inputs[index + 1].focus();
        }
        if (e.key === "ArrowUp") {
            if (inputs[index - 1]) inputs[index - 1].focus();
        }
    };

    const handleFocus = (e) => e.target.select();

    /* ================= FETCH COURSES ================= */

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await api.get("/api/courses", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCourses(res.data || []);
            } catch {
                setCourses([]);
            }
        };
        fetchCourses();
    }, [token]);

    const selectedCourseObj = useMemo(() => {
        return courses.find(c => c.course_code === selectedCourse);
    }, [courses, selectedCourse]);

    const semLabel = selectedCourseObj?.sem_or_year?.toLowerCase() === "year" ? "Year" : "Semester";

    const semesterOptions = useMemo(() => {
        if (!selectedCourseObj) return [];
        return Array.from({ length: Number(selectedCourseObj.total_semesters) }, (_, i) => i + 1);
    }, [selectedCourseObj]);

    /* ================= LOAD SUBJECTS ================= */

    useEffect(() => {
        if (!selectedCourse || !selectedSem) return;
        const loadSubjects = async () => {
            try {
                const res = await api.get(
                    `/api/subjects?course_code=${selectedCourse}&sem=${selectedSem}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setSubjects(res.data || []);
                setStudents([]);
                setMarks({});
                setSelectedSubject("");
                setSubjectDetails(null);
                setError("");
            } catch {
                setError("Failed to load subjects.");
            }
        };
        loadSubjects();
    }, [selectedCourse, selectedSem, token]);

    /* ================= SUBJECT SELECT ================= */

    const handleSubjectChange = async (code) => {
        setSelectedSubject(code);
        const subject = subjects.find(s => s.subjectcode === code);
        setSubjectDetails(subject);

        try {
            const res = await api.get(
                `/api/marks/students?course=${selectedCourse}&sem=${selectedSem}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStudents(res.data || []);
        } catch {
            setError("Failed to load students.");
        }
    };

    const handleMarkChange = (roll, field, value) => {
        const sanitizedValue = value === "" ? "" : Math.max(0, parseInt(value, 10));
        setMarks(prev => ({
            ...prev,
            [roll]: { ...prev[roll], [field]: sanitizedValue }
        }));
    };

    /* ================= VALIDATION GATEKEEPER ================= */

    const handleOpenModal = () => {
        if (!subjectDetails) return;

        const maxTheory = subjectDetails.theorymarks;
        const maxPractical = subjectDetails.practicalmarks;

        for (const student of students) {
            const roll = student.rollnumber;
            const theory = marks[roll]?.theory;
            const practical = marks[roll]?.practical;

            if (theory === "" || theory === undefined) {
                const msg = `Theory marks missing for ${student.firstname}`;
                setToast({ type: "error", message: msg });
                return;
            }

            if (maxPractical > 0 && (practical === "" || practical === undefined)) {
                const msg = `Practical marks missing for ${student.firstname}`;
                setToast({ type: "error", message: msg });
                return;
            }

            if (Number(theory) > maxTheory) {
                const msg = `${student.firstname}'s Theory exceeds max (${maxTheory})`;
                setToast({ type: "error", message: msg });
                return;
            }

            if (maxPractical > 0 && Number(practical) > maxPractical) {
                const msg = `${student.firstname}'s Practical exceeds max (${maxPractical})`;
                setToast({ type: "error", message: msg });
                return;
            }
        }

        setError("");
        setShowSaveModal(true);
    };

    /* ================= FINAL SAVE ================= */

    const saveMarks = async () => {
        try {
            const records = students.map(student => ({
                rollnumber: student.rollnumber,
                theorymarks: marks[student.rollnumber]?.theory || 0,
                practicalmarks: marks[student.rollnumber]?.practical || 0
            }));

            await api.post("/api/marks/save", {
                course: selectedCourse,
                sem: Number(selectedSem),
                subject: selectedSubject,
                subjectname: subjectDetails?.subjectname,
                marks: records
            }, { headers: { Authorization: `Bearer ${token}` } });

            setToast({ type: "success", message: "Marks saved successfully!" });
            setShowSaveModal(false);
        } catch {
            setToast({ type: "error", message: "Database error: Failed to save marks." });
        }
    };

    const isFormComplete = selectedCourse && selectedSem && selectedSubject && students.length > 0;

    return (
        <div className="space-y-8 sm:space-y-10 pb-10">
            {/* HEADER - Centered for Mobile */}
            <div className="text-center sm:text-left px-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                    Enter Marks
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto sm:mx-0">
                    Input and manage student examination scores with real-time validation.
                </p>
            </div>

            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-md mx-2 text-center">
                    {error}
                </div>
            )}

            {/* FILTER CARD - Professional Grid */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 mx-2">
                <select value={selectedCourse} onChange={(e) => { setSelectedCourse(e.target.value); setSelectedSem(""); }}
                        className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-1 focus:ring-gray-400 transition">
                    <option value="">Select Course</option>
                    {courses.map(course => <option key={course.id} value={course.course_code}>{course.course_name}</option>)}
                </select>

                <select value={selectedSem} onChange={(e) => { setSelectedSem(e.target.value); setSelectedSubject(""); }}
                        disabled={!selectedCourse}
                        className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-1 focus:ring-gray-400 transition disabled:opacity-50">
                    <option value="">Select {semLabel}</option>
                    {semesterOptions.map(num => <option key={num} value={num}>{semLabel} {num}</option>)}
                </select>

                <select value={selectedSubject} onChange={(e) => handleSubjectChange(e.target.value)}
                        disabled={!selectedSem}
                        className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-1 focus:ring-gray-400 transition disabled:opacity-50">
                    <option value="">Select Subject</option>
                    {subjects.map(sub => <option key={sub.subjectcode} value={sub.subjectcode}>{sub.subjectname}</option>)}
                </select>
            </div>

            {selectedSubject && students.length > 0 ? (
                <div className="px-2">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden transition-colors">
                        <div className="w-full overflow-x-auto">
                            <table className="w-full table-auto text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-4 sm:px-6 py-4 text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">Student</th>
                                    <th className="px-2 sm:px-4 py-4 text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 text-center">Theory</th>
                                    {subjectDetails?.practicalmarks > 0 && (
                                        <th className="px-2 sm:px-4 py-4 text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 text-center">Pract.</th>
                                    )}
                                    <th className="px-4 py-4 text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 text-center hidden sm:table-cell">Total</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {students.map(student => {
                                    const theoryVal = marks[student.rollnumber]?.theory;
                                    const practicalVal = marks[student.rollnumber]?.practical;
                                    const total = (Number(theoryVal) || 0) + (Number(practicalVal) || 0);

                                    return (
                                        <tr key={student.rollnumber} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-4 sm:px-6 py-4">
                                                <div className="font-semibold text-gray-900 dark:text-gray-100 text-[13px] sm:text-sm truncate max-w-[120px] sm:max-w-none">
                                                    {student.firstname} {student.lastname}
                                                </div>
                                                <div className="text-[10px] text-gray-500 font-mono mt-0.5">{student.rollnumber}</div>
                                            </td>
                                            <td className="px-2 sm:px-4 py-4 text-center">
                                                <input type="number"
                                                       placeholder="0"
                                                       value={theoryVal ?? ""}
                                                       onChange={(e) => handleMarkChange(student.rollnumber, "theory", e.target.value)}
                                                       onKeyDown={(e) => { preventSymbols(e); handleEnterMove(e); }}
                                                       onFocus={handleFocus}
                                                       className={`w-14 sm:w-20 px-2 py-2 border rounded-lg text-xs sm:text-sm text-center outline-none transition-all font-medium
                                                            ${(theoryVal === "" || Number(theoryVal) > subjectDetails?.theorymarks)
                                                           ? "border-red-500 bg-red-50 text-red-700 shadow-[0_0_0_1px_rgba(239,68,68,0.2)]"
                                                           : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-1 focus:ring-gray-400"}`}
                                                />
                                            </td>
                                            {subjectDetails?.practicalmarks > 0 && (
                                                <td className="px-2 sm:px-4 py-4 text-center">
                                                    <input type="number"
                                                           placeholder="0"
                                                           value={practicalVal ?? ""}
                                                           onChange={(e) => handleMarkChange(student.rollnumber, "practical", e.target.value)}
                                                           onKeyDown={(e) => { preventSymbols(e); handleEnterMove(e); }}
                                                           onFocus={handleFocus}
                                                           className={`w-14 sm:w-20 px-2 py-2 border rounded-lg text-xs sm:text-sm text-center outline-none transition-all font-medium
                                                                ${(practicalVal === "" || Number(practicalVal) > subjectDetails?.practicalmarks)
                                                               ? "border-red-500 bg-red-50 text-red-700 shadow-[0_0_0_1px_rgba(239,68,68,0.2)]"
                                                               : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-1 focus:ring-gray-400"}`}
                                                    />
                                                </td>
                                            )}
                                            <td className="hidden sm:table-cell px-4 py-4 text-center font-black text-gray-900 dark:text-gray-100 text-sm">{total}</td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-700 p-4 flex justify-center md:justify-end bg-gray-50/30 dark:bg-transparent">
                            <button onClick={handleOpenModal} disabled={!isFormComplete}
                                    className={`w-full md:w-auto px-10 py-2.5 text-sm rounded-lg transition font-bold shadow-sm
                                    ${isFormComplete ? "bg-gray-900 text-white hover:bg-black" : "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700"}
                                `}>
                                Save Marks
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                /* PROFESSIONAL EMPTY STATE - Matching Attendance/Marks Reports */
                <div className="mx-2 flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/20">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-sm mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </div>
                    <h3 className="text-gray-900 dark:text-gray-100 font-semibold text-sm">Ready to Enter Marks</h3>
                    <p className="text-gray-400 text-xs mt-1 text-center max-w-[250px]">Select a course and subject to populate the student score entry sheet.</p>
                </div>
            )}

            <ConfirmSaveModal
                show={showSaveModal}
                title="Confirm Marks Entry"
                message={`Are you sure you want to save marks for ${subjectDetails?.subjectname}?`}
                onCancel={() => setShowSaveModal(false)}
                onConfirm={saveMarks}
            />

            {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
};

export default EnterMarks;