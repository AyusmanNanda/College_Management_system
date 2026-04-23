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

            // 1. CHECK FOR EMPTY FIELDS
            if (theory === "" || theory === undefined) {
                const msg = `Theory marks missing for ${student.firstname}`;
                setToast({ type: "error", message: msg });
                return; // EXIT: Toast shows on clear screen, no modal opens
            }

            if (maxPractical > 0 && (practical === "" || practical === undefined)) {
                const msg = `Practical marks missing for ${student.firstname}`;
                setToast({ type: "error", message: msg });
                return; // EXIT
            }

            // 2. CHECK FOR MAX MARKS
            if (Number(theory) > maxTheory) {
                const msg = `${student.firstname}'s Theory exceeds max (${maxTheory})`;
                setToast({ type: "error", message: msg });
                return; // EXIT
            }

            if (maxPractical > 0 && Number(practical) > maxPractical) {
                const msg = `${student.firstname}'s Practical exceeds max (${maxPractical})`;
                setToast({ type: "error", message: msg });
                return; // EXIT
            }
        }

        // All clear! Now we show the modal (and the blur)
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
        <div className="space-y-10">
            <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Enter Marks</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Manage student examination scores.</p>
            </div>

            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-md">
                    {error}
                </div>
            )}

            {/* FILTER CARD */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
                <select value={selectedCourse} onChange={(e) => { setSelectedCourse(e.target.value); setSelectedSem(""); }}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm focus:ring-1 focus:ring-gray-400 outline-none transition">
                    <option value="">Select Course</option>
                    {courses.map(course => <option key={course.id} value={course.course_code}>{course.course_name}</option>)}
                </select>

                <select value={selectedSem} onChange={(e) => { setSelectedSem(e.target.value); setSelectedSubject(""); }}
                        disabled={!selectedCourse}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm focus:ring-1 focus:ring-gray-400 outline-none transition disabled:opacity-60">
                    <option value="">Select {semLabel}</option>
                    {semesterOptions.map(num => <option key={num} value={num}>{semLabel} {num}</option>)}
                </select>

                <select value={selectedSubject} onChange={(e) => handleSubjectChange(e.target.value)}
                        disabled={!selectedSem}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm focus:ring-1 focus:ring-gray-400 outline-none transition disabled:opacity-60">
                    <option value="">Select Subject</option>
                    {subjects.map(sub => <option key={sub.subjectcode} value={sub.subjectcode}>{sub.subjectname}</option>)}
                </select>
            </div>

            {selectedSubject && students.length > 0 && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden transition-colors">
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-xs sm:text-sm text-left table-fixed md:table-auto">
                            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-[10px] sm:text-xs tracking-wide">
                            <tr>
                                <th className="w-1/3 px-2 sm:px-4 py-3">Student</th>
                                <th className="px-2 sm:px-4 py-3 text-center">Theory</th>
                                {subjectDetails?.practicalmarks > 0 && (
                                    <th className="px-2 sm:px-4 py-3 text-center">Pract.</th>
                                )}
                                <th className="hidden md:table-cell px-4 py-3 text-center font-bold">Total</th>
                            </tr>
                            </thead>
                            <tbody>
                            {students.map(student => {
                                const theoryVal = marks[student.rollnumber]?.theory;
                                const practicalVal = marks[student.rollnumber]?.practical;
                                const total = (Number(theoryVal) || 0) + (Number(practicalVal) || 0);

                                return (
                                    <tr key={student.rollnumber} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                        <td className="px-2 sm:px-4 py-3 dark:text-gray-200">
                                            <div className="flex flex-col leading-tight truncate">
                                                <span className="font-medium truncate">{student.firstname} {student.lastname}</span>
                                                <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{student.rollnumber}</span>
                                            </div>
                                        </td>
                                        <td className="px-1 sm:px-4 py-3 text-center">
                                            <input type="number"
                                                   placeholder="0"
                                                   value={theoryVal ?? ""}
                                                   onChange={(e) => handleMarkChange(student.rollnumber, "theory", e.target.value)}
                                                   onKeyDown={(e) => { preventSymbols(e); handleEnterMove(e); }}
                                                   onFocus={handleFocus}
                                                   className={`w-12 sm:w-20 px-1 py-1.5 border rounded-md text-xs sm:text-sm text-center outline-none transition
                                                        ${(theoryVal === "" || Number(theoryVal) > subjectDetails?.theorymarks)
                                                       ? "border-red-500 bg-red-50 text-red-700"
                                                       : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-1 focus:ring-gray-400"}`}
                                            />
                                        </td>
                                        {subjectDetails?.practicalmarks > 0 && (
                                            <td className="px-1 sm:px-4 py-3 text-center">
                                                <input type="number"
                                                       placeholder="0"
                                                       value={practicalVal ?? ""}
                                                       onChange={(e) => handleMarkChange(student.rollnumber, "practical", e.target.value)}
                                                       onKeyDown={(e) => { preventSymbols(e); handleEnterMove(e); }}
                                                       onFocus={handleFocus}
                                                       className={`w-12 sm:w-20 px-1 py-1.5 border rounded-md text-xs sm:text-sm text-center outline-none transition
                                                            ${(practicalVal === "" || Number(practicalVal) > subjectDetails?.practicalmarks)
                                                           ? "border-red-500 bg-red-50 text-red-700"
                                                           : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-1 focus:ring-gray-400"}`}
                                                />
                                            </td>
                                        )}
                                        <td className="hidden md:table-cell px-4 py-3 text-center font-bold dark:text-gray-200 text-base">{total}</td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end">
                        <button onClick={handleOpenModal} disabled={!isFormComplete}
                                className={`w-full sm:w-auto px-6 py-2.5 text-sm rounded-md transition font-semibold
                                ${isFormComplete ? "bg-gray-900 text-white hover:bg-black" : "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700"}
                            `}>
                            Save Marks
                        </button>
                    </div>
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