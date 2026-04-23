import { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";
import ConfirmSaveModal from "./modals/ConfirmSaveModal.jsx";
import ConfirmDeleteModal from "./modals/ConfirmDeleteModal.jsx";
import Toast from "./Toast.jsx";
// Suggestion: Use Lucide-React or similar for the Empty State icons
import { Edit3, Layers, BookOpen, UserMinus } from "lucide-react";

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

    /* ================= UX HELPERS (Preserved) ================= */

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

    /* ================= DATA FETCHING (Preserved) ================= */

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

    /* ================= GATEKEEPER & ACTIONS (Preserved) ================= */

    const handleOpenModal = () => {
        if (!subjectDetails || students.length === 0) return;
        for (const student of students) {
            const roll = student.rollnumber;
            const currentMarks = marks[roll];
            if (!currentMarks) { setToast({ type: "error", message: `Data missing for Roll: ${roll}` }); return; }

            const theory = currentMarks.theory;
            const practical = currentMarks.practical;
            const needsPractical = Number(subjectDetails.practicalmarks) > 0;

            if (theory === "" || theory === null || theory === undefined) {
                setToast({ type: "error", message: `Please enter theory marks for ${student.firstname}.` });
                return;
            }
            if (needsPractical && (practical === "" || practical === null || practical === undefined)) {
                setToast({ type: "error", message: `Please enter practical marks for ${student.firstname}.` });
                return;
            }
            if (Number(theory) > subjectDetails.theorymarks) {
                setToast({ type: "error", message: `${student.firstname}: Theory exceeds ${subjectDetails.theorymarks}` });
                return;
            }
            if (needsPractical && Number(practical) > subjectDetails.practicalmarks) {
                setToast({ type: "error", message: `${student.firstname}: Practical exceeds ${subjectDetails.practicalmarks}` });
                return;
            }
        }
        setError("");
        setShowSaveModal(true);
    };

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
        <div className="space-y-8 sm:space-y-10 pb-10">
            {/* HEADER */}
            <div className="text-center sm:text-left px-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight flex items-center justify-center sm:justify-start gap-3">
                    <Edit3 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                    Edit Marks
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto sm:mx-0">
                    Modify existing student records. Changes are permanent after confirmation.
                </p>
            </div>

            {error && <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-md mx-2">{error}</div>}

            {/* FILTER CARD */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 mx-2">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400 px-1">Course</label>
                    <select value={selectedCourse} onChange={(e) => { setSelectedCourse(e.target.value); setSelectedSem(""); }}
                            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm focus:ring-1 focus:ring-gray-400 transition outline-none">
                        <option value="">Select Course</option>
                        {courses.map(course => <option key={course.id} value={course.course_code}>{course.course_name}</option>)}
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400 px-1">{semLabel}</label>
                    <select value={selectedSem} onChange={(e) => { setSelectedSem(e.target.value); setSelectedSubject(""); }}
                            disabled={!selectedCourse} className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm focus:ring-1 focus:ring-gray-400 transition disabled:opacity-50 outline-none">
                        <option value="">Select {semLabel}</option>
                        {semesterOptions.map(num => <option key={num} value={num}>{semLabel} {num}</option>)}
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400 px-1">Subject</label>
                    <select value={selectedSubject} onChange={(e) => handleSubjectChange(e.target.value)}
                            disabled={!selectedSem} className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm focus:ring-1 focus:ring-gray-400 transition disabled:opacity-50 outline-none">
                        <option value="">Select Subject</option>
                        {subjects.map(sub => <option key={sub.subjectcode} value={sub.subjectcode}>{sub.subjectname}</option>)}
                    </select>
                </div>
            </div>

            {selectedSubject && students.length > 0 ? (
                /* DATA TABLE VIEW */
                <div className="px-2">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden transition-colors">
                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-4 sm:px-6 py-4 text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">Student</th>
                                    <th className="px-2 sm:px-4 py-4 text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 text-center">Theory</th>
                                    {subjectDetails?.practicalmarks > 0 && <th className="px-2 sm:px-4 py-4 text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 text-center">Pract.</th>}
                                    <th className="hidden md:table-cell px-4 py-4 text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 text-center">Total</th>
                                    <th className="px-4 sm:px-6 py-4 text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 text-center">Action</th>
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
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm truncate max-w-[120px] sm:max-w-none">{student.firstname}</span>
                                                    <span className="text-[10px] font-mono text-gray-400">{student.rollnumber}</span>
                                                </div>
                                            </td>
                                            <td className="px-2 sm:px-4 py-4 text-center">
                                                <input type="number" value={theoryVal ?? ""}
                                                       onChange={(e) => handleMarkChange(student.rollnumber, "theory", e.target.value)}
                                                       onKeyDown={(e) => { preventSymbols(e); handleEnterMove(e); }} onFocus={handleFocus}
                                                       className={`w-14 sm:w-20 px-2 py-2 border rounded-lg text-xs sm:text-sm text-center outline-none transition-all font-medium
                                                            ${(theoryVal === "" || Number(theoryVal) > subjectDetails?.theorymarks) ? "border-red-500 bg-red-50 text-red-700 ring-1 ring-red-200" : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 dark:text-white focus:ring-1 focus:ring-gray-400"}`}
                                                />
                                            </td>
                                            {subjectDetails?.practicalmarks > 0 && (
                                                <td className="px-2 sm:px-4 py-4 text-center">
                                                    <input type="number" value={practicalVal ?? ""}
                                                           onChange={(e) => handleMarkChange(student.rollnumber, "practical", e.target.value)}
                                                           onKeyDown={(e) => { preventSymbols(e); handleEnterMove(e); }} onFocus={handleFocus}
                                                           className={`w-14 sm:w-20 px-2 py-2 border rounded-lg text-xs sm:text-sm text-center outline-none transition-all font-medium
                                                                ${(practicalVal === "" || Number(practicalVal) > subjectDetails?.practicalmarks) ? "border-red-500 bg-red-50 text-red-700 ring-1 ring-red-200" : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 dark:text-white focus:ring-1 focus:ring-gray-400"}`}
                                                    />
                                                </td>
                                            )}
                                            <td className="hidden md:table-cell px-4 py-4 text-center">
                                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-bold dark:text-gray-300">{total}</span>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 text-center">
                                                <button onClick={() => setStudentToDelete(student.rollnumber)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition" title="Delete Student Marks">
                                                    <UserMinus className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 bg-gray-50/50 dark:bg-gray-900/20 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-3 justify-end">
                            <button onClick={handleCancel} className="px-5 py-2 text-gray-600 dark:text-gray-300 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">Cancel</button>
                            <button onClick={() => setShowDeleteAllModal(true)} className="px-5 py-2 bg-white dark:bg-gray-800 border border-red-200 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition">Delete All Records</button>
                            <button onClick={handleOpenModal} className="px-8 py-2 bg-gray-900 dark:bg-blue-600 text-white text-sm rounded-lg hover:bg-black dark:hover:bg-blue-700 transition font-bold shadow-lg shadow-gray-200 dark:shadow-none">Update Subject Marks</button>
                        </div>
                    </div>
                </div>
            ) : (
                /* INSTRUCTIONAL EMPTY STATE */
                <div className="mx-2 flex flex-col items-center justify-center py-24 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/30 transition-all">
                    <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm flex items-center justify-center mb-5 border border-gray-100 dark:border-gray-700">
                        {!selectedCourse ? <Layers className="text-blue-500 w-8 h-8" /> : !selectedSem ? <BookOpen className="text-orange-500 w-8 h-8" /> : <Edit3 className="text-green-500 w-8 h-8" />}
                    </div>
                    <h3 className="text-gray-900 dark:text-gray-100 font-bold text-lg">
                        {!selectedCourse ? "Step 1: Select a Course" : !selectedSem ? "Step 2: Choose Semester" : "Step 3: Select Subject to Edit"}
                    </h3>
                    <p className="text-gray-400 text-sm mt-2 text-center max-w-xs">
                        Locate the specific academic record you wish to modify by filtering the options above.
                    </p>

                    {/* Progress Indicator */}
                    <div className="flex items-center gap-2 mt-8">
                        <div className={`h-1.5 w-8 rounded-full ${selectedCourse ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                        <div className={`h-1.5 w-8 rounded-full ${selectedSem ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                        <div className={`h-1.5 w-8 rounded-full ${selectedSubject ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                    </div>
                </div>
            )}

            <ConfirmSaveModal show={showSaveModal} title="Confirm Update" message="Are you sure you want to update student marks? This action will sync changes to the database." confirmText="Update" onCancel={() => setShowSaveModal(false)} onConfirm={updateMarks} />
            <ConfirmDeleteModal show={!!studentToDelete} title="Delete Record" message="Are you sure you want to delete this specific student's score from this subject?" onCancel={() => setStudentToDelete(null)} onConfirm={() => { deleteMarks(studentToDelete); setStudentToDelete(null); }} />
            <ConfirmDeleteModal show={showDeleteAllModal} title="Wipe Subject Data" message="WARNING: This will permanently delete ALL marks recorded for this subject across all students. This cannot be undone." onCancel={() => setShowDeleteAllModal(false)} onConfirm={() => { deleteAllMarks(); setShowDeleteAllModal(false); }} />
            {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
};

export default EditMarks;