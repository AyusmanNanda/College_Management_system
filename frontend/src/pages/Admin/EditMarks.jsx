import { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";
import ConfirmSaveModal from "./modals/ConfirmSaveModal.jsx";
import ConfirmDeleteModal from "./modals/ConfirmDeleteModal.jsx";
import Toast from "./Toast.jsx";

const EditMarks = () => {
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
    const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);

    /* ================= UX HELPERS ================= */

    const preventSymbols = (e) => {
        if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 || (e.keyCode >= 35 && e.keyCode <= 39)) return;
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) e.preventDefault();
    };

    const handleEnterMove = (e) => {
        const table = e.target.closest("table");
        const inputs = Array.from(table.querySelectorAll("input[type='number']"));
        const index = inputs.indexOf(e.target);
        if (e.key === "Enter") {
            e.preventDefault();
            if (inputs[index + 1]) { inputs[index + 1].focus(); inputs[index + 1].select(); }
        }
        if (e.key === "ArrowDown") if (inputs[index + 1]) inputs[index + 1].focus();
        if (e.key === "ArrowUp") if (inputs[index - 1]) inputs[index - 1].focus();
    };

    const handleFocus = (e) => e.target.select();

    const handleCancel = () => {
        setSelectedSubject("");
        setSubjectDetails(null);
        setStudents([]);
        setMarks({});
        setError("");
    };

    /* ================= FETCH COURSES ================= */

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await api.get("/api/courses", { headers: { Authorization: `Bearer ${token}` } });
                setCourses(res.data || []);
            } catch { setCourses([]); }
        };
        fetchCourses();
    }, [token]);

    const selectedCourseObj = useMemo(() => courses.find(c => c.course_code === selectedCourse), [courses, selectedCourse]);
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
                const res = await api.get(`/api/subjects?course_code=${selectedCourse}&sem=${selectedSem}`, { headers: { Authorization: `Bearer ${token}` } });
                setSubjects(res.data || []);
                handleCancel();
            } catch { setError("Failed to load subjects."); }
        };
        loadSubjects();
    }, [selectedCourse, selectedSem, token]);

    /* ================= LOAD MARKS ================= */

    const handleSubjectChange = async (code) => {
        if (!code) { handleCancel(); return; }
        setSelectedSubject(code);
        const subject = subjects.find(s => s.subjectcode === code);
        setSubjectDetails(subject);

        try {
            const res = await api.get(`/api/marks/edit?course=${selectedCourse}&sem=${selectedSem}&subject=${code}`, { headers: { Authorization: `Bearer ${token}` } });
            setStudents(res.data || []);

            const existingMarks = {};
            res.data.forEach(student => {
                // Ensure we use empty string "" for null/undefined so validator catches it
                existingMarks[student.rollnumber] = {
                    theory: (student.theorymarks !== null && student.theorymarks !== undefined) ? student.theorymarks : "",
                    practical: (student.practicalmarks !== null && student.practicalmarks !== undefined) ? student.practicalmarks : ""
                };
            });
            setMarks(existingMarks);
        } catch { setError("Failed to load marks."); }
    };

    const handleMarkChange = (roll, field, value) => {
        const sanitizedValue = value === "" ? "" : Math.max(0, parseInt(value, 10));
        setMarks(prev => ({ ...prev, [roll]: { ...prev[roll], [field]: sanitizedValue } }));
    };

    /* ================= THE RIGID GATEKEEPER ================= */

    const handleOpenModal = () => {
        // 1. Initial Check
        if (!subjectDetails || students.length === 0) return;

        // 2. Loop through every student currently in the list
        for (const student of students) {
            const roll = student.rollnumber;
            const currentMarks = marks[roll];

            // If the student doesn't even have a marks object entry
            if (!currentMarks) {
                setToast({ type: "error", message: `Data missing for Roll: ${roll}` });
                return;
            }

            const theory = currentMarks.theory;
            const practical = currentMarks.practical;
            const needsPractical = Number(subjectDetails.practicalmarks) > 0;

            // STICK CHECK: We block "", null, or undefined. 0 is allowed.
            if (theory === "" || theory === null || theory === undefined) {
                setToast({ type: "error", message: `Please enter theory marks for ${student.firstname}.` });
                return; // KILLS the function - Modal won't open
            }

            if (needsPractical && (practical === "" || practical === null || practical === undefined)) {
                setToast({ type: "error", message: `Please enter practical marks for ${student.firstname}.` });
                return; // KILLS the function - Modal won't open
            }

            // MAX MARKS CHECK
            if (Number(theory) > subjectDetails.theorymarks) {
                setToast({ type: "error", message: `${student.firstname}: Theory exceeds ${subjectDetails.theorymarks}` });
                return;
            }
            if (needsPractical && Number(practical) > subjectDetails.practicalmarks) {
                setToast({ type: "error", message: `${student.firstname}: Practical exceeds ${subjectDetails.practicalmarks}` });
                return;
            }
        }

        // 3. ONLY if every single student passes the loop above
        setError("");
        setShowSaveModal(true);
    };

    /* ================= ACTIONS ================= */

    const deleteMarks = async (rollnumber) => {
        try {
            await api.delete("/api/marks/delete", {
                headers: { Authorization: `Bearer ${token}` },
                data: { course: selectedCourse, sem: selectedSem, subject: selectedSubject, rollnumber }
            });
            setStudents(prev => prev.filter(s => s.rollnumber !== rollnumber));
            setToast({ type: "success", message: "Student marks deleted." });
        } catch { setToast({ type: "error", message: "Failed to delete student marks." }); }
    };

    const deleteAllMarks = async () => {
        try {
            await api.delete("/api/marks/delete-subject", {
                headers: { Authorization: `Bearer ${token}` },
                data: { course: selectedCourse, sem: selectedSem, subject: selectedSubject }
            });
            handleCancel();
            setToast({ type: "success", message: "All marks deleted." });
        } catch { setToast({ type: "error", message: "Failed to delete all marks." }); }
    };

    const updateMarks = async () => {
        try {
            const records = students.map(student => ({
                rollnumber: student.rollnumber,
                theorymarks: marks[student.rollnumber]?.theory || 0,
                practicalmarks: marks[student.rollnumber]?.practical || 0
            }));
            await api.put("/api/marks/update", { course: selectedCourse, sem: Number(selectedSem), subject: selectedSubject, marks: records }, { headers: { Authorization: `Bearer ${token}` } });
            setToast({ type: "success", message: "Marks updated successfully!" });
            setShowSaveModal(false);
        } catch { setToast({ type: "error", message: "Database error: Update failed." }); }
    };

    return (
        <div className="space-y-10">
            <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Edit Marks</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Update student scores manually.</p>
            </div>

            {error && <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-md">{error}</div>}

            {/* FILTER CARD */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 transition-colors">
                <select value={selectedCourse} onChange={(e) => { setSelectedCourse(e.target.value); setSelectedSem(""); }}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm focus:ring-1 focus:ring-gray-400 transition outline-none">
                    <option value="">Select Course</option>
                    {courses.map(course => <option key={course.id} value={course.course_code}>{course.course_name}</option>)}
                </select>

                <select value={selectedSem} onChange={(e) => { setSelectedSem(e.target.value); setSelectedSubject(""); }}
                        disabled={!selectedCourse} className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm focus:ring-1 focus:ring-gray-400 transition disabled:opacity-60 outline-none">
                    <option value="">Select {semLabel}</option>
                    {semesterOptions.map(num => <option key={num} value={num}>{semLabel} {num}</option>)}
                </select>

                <select value={selectedSubject} onChange={(e) => handleSubjectChange(e.target.value)}
                        disabled={!selectedSem} className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm focus:ring-1 focus:ring-gray-400 transition disabled:opacity-60 outline-none">
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
                                {subjectDetails?.practicalmarks > 0 && <th className="px-2 sm:px-4 py-3 text-center">Pract.</th>}
                                <th className="hidden md:table-cell px-4 py-3 text-center font-bold">Total</th>
                                <th className="px-2 sm:px-4 py-3 text-center">Action</th>
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
                                                <span className="font-medium truncate">{student.firstname}</span>
                                                <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{student.rollnumber}</span>
                                            </div>
                                        </td>
                                        <td className="px-1 sm:px-4 py-3 text-center">
                                            <input type="number" value={theoryVal ?? ""}
                                                   onChange={(e) => handleMarkChange(student.rollnumber, "theory", e.target.value)}
                                                   onKeyDown={(e) => { preventSymbols(e); handleEnterMove(e); }} onFocus={handleFocus}
                                                   className={`w-12 sm:w-20 px-1 py-1.5 border rounded-md text-xs sm:text-sm text-center outline-none transition
                                                        ${(theoryVal === "" || Number(theoryVal) > subjectDetails?.theorymarks) ? "border-red-500 bg-red-50 text-red-700" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-1 focus:ring-gray-400"}`}
                                            />
                                        </td>
                                        {subjectDetails?.practicalmarks > 0 && (
                                            <td className="px-1 sm:px-4 py-3 text-center">
                                                <input type="number" value={practicalVal ?? ""}
                                                       onChange={(e) => handleMarkChange(student.rollnumber, "practical", e.target.value)}
                                                       onKeyDown={(e) => { preventSymbols(e); handleEnterMove(e); }} onFocus={handleFocus}
                                                       className={`w-12 sm:w-20 px-1 py-1.5 border rounded-md text-xs sm:text-sm text-center outline-none transition
                                                            ${(practicalVal === "" || Number(practicalVal) > subjectDetails?.practicalmarks) ? "border-red-500 bg-red-50 text-red-700" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-1 focus:ring-gray-400"}`}
                                                />
                                            </td>
                                        )}
                                        <td className="hidden md:table-cell px-4 py-3 text-center font-bold dark:text-gray-200">{total}</td>
                                        <td className="px-1 sm:px-4 py-3 text-center">
                                            <button onClick={() => setStudentToDelete(student.rollnumber)} className="px-2 py-1 bg-red-50 text-red-600 border border-red-200 rounded-md text-[10px] sm:text-xs hover:bg-red-600 hover:text-white transition font-medium">Delete</button>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex flex-col sm:flex-row gap-3 justify-end">
                        <button onClick={handleCancel} className="w-full sm:w-auto px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-100 text-sm rounded-md hover:bg-gray-300 transition">Cancel</button>
                        <button onClick={() => setShowDeleteAllModal(true)} className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition">Delete All</button>
                        <button onClick={handleOpenModal} className="w-full sm:w-auto px-6 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-black transition font-bold">Update</button>
                    </div>
                </div>
            )}

            <ConfirmSaveModal show={showSaveModal} title="Confirm Update" message="Save changes to student marks?" confirmText="Update" onCancel={() => setShowSaveModal(false)} onConfirm={updateMarks} />
            <ConfirmDeleteModal show={!!studentToDelete} title="Delete Marks" message="Delete this student's score?" onCancel={() => setStudentToDelete(null)} onConfirm={() => { deleteMarks(studentToDelete); setStudentToDelete(null); }} />
            <ConfirmDeleteModal show={showDeleteAllModal} title="Delete All" message="Delete all marks for this subject?" onCancel={() => setShowDeleteAllModal(false)} onConfirm={() => { deleteAllMarks(); setShowDeleteAllModal(false); }} />
            {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
};

export default EditMarks;