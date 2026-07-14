import { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";
import ConfirmDeleteModal from "../../components/modals/ConfirmDeleteModal.jsx";
import ConfirmSaveModal from "../../components/modals/ConfirmSaveModal.jsx";
import Toast from "./Toast.jsx";
import {
    ClipboardEdit,
    Filter,
    RotateCcw,
    Save,
    Trash2,
    AlertCircle,
    ListChecks,
    CheckCircle2
} from "lucide-react";

const EditAttendance = () => {
    const token = localStorage.getItem("token");

    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [attendanceDates, setAttendanceDates] = useState([]);

    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedSem, setSelectedSem] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedDate, setSelectedDate] = useState("");

    const [checkedStudents, setCheckedStudents] = useState({});
    const [error, setError] = useState("");
    const [toast, setToast] = useState(null);

    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    /* ================= ACTION: RESET ================= */
    const handleReset = () => {
        setSelectedCourse("");
        setSelectedSem("");
        setSelectedSubject("");
        setSelectedDate("");
        setCheckedStudents({});
        setAttendanceDates([]);
        setError("");
    };

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

    /* ================= DERIVED SEM OPTIONS ================= */

    const selectedCourseObj = useMemo(() => {
        return courses.find(c => c.course_code === selectedCourse);
    }, [courses, selectedCourse]);

    const semLabel =
        selectedCourseObj?.sem_or_year?.toLowerCase() === "year"
            ? "Year"
            : "Semester";

    const semesterOptions = useMemo(() => {
        if (!selectedCourseObj) return [];
        const total = Number(selectedCourseObj.total_semesters);
        return Array.from({ length: total }, (_, i) => i + 1);
    }, [selectedCourseObj]);

    /* ================= FETCH SUBJECTS + STUDENTS ================= */

    useEffect(() => {
        if (!selectedCourse || !selectedSem) return;

        const loadData = async () => {
            try {
                const [subRes, stuRes] = await Promise.all([
                    api.get(
                        `/api/subjects?course_code=${selectedCourse}&sem=${selectedSem}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    ),
                    api.get(
                        `/api/attendance/students?course=${selectedCourse}&sem=${selectedSem}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    )
                ]);

                setSubjects(subRes.data || []);
                setStudents(stuRes.data || []);

                setSelectedSubject("");
                setSelectedDate("");
                setAttendanceDates([]);
                setCheckedStudents({});
                setError("");
            } catch {
                setError("Failed to load subjects or students.");
            }
        };

        loadData();
    }, [selectedCourse, selectedSem, token]);

    /* ================= FETCH EXISTING DATES ================= */

    useEffect(() => {
        if (!selectedSubject) return;

        const fetchDates = async () => {
            try {
                const res = await api.get(
                    `/api/attendance/dates?subjectcode=${selectedSubject}&courcecode=${selectedCourse}&semoryear=${selectedSem}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const formattedDates = (res.data || []).map(d => ({
                    date: String(d.date).slice(0, 10)
                }));

                setAttendanceDates(formattedDates);
                setSelectedDate("");
                setCheckedStudents({});
                setError("");
            } catch {
                setAttendanceDates([]);
            }
        };

        fetchDates();
    }, [selectedSubject, selectedCourse, selectedSem, token]);

    /* ================= LOAD ATTENDANCE ================= */

    useEffect(() => {
        if (!selectedCourse || !selectedSem || !selectedSubject || !selectedDate) return;
        if (students.length === 0) return;

        const loadAttendance = async () => {
            try {
                const res = await api.get(
                    `/api/attendance?subjectcode=${selectedSubject}&date=${selectedDate}&courcecode=${selectedCourse}&semoryear=${selectedSem}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const map = {};
                students.forEach(student => {
                    map[Number(student.student_id)] = false;
                });

                res.data.forEach(record => {
                    const id = Number(record.student_id);
                    const present = Number(record.present);
                    map[id] = present === 1;
                });

                setCheckedStudents(map);
                setError("");
            } catch {
                setError("Failed to load attendance.");
            }
        };

        loadAttendance();
    }, [selectedCourse, selectedSem, selectedSubject, selectedDate, students, token]);

    /* ================= TOGGLE ================= */

    const toggleStudent = (id) => {
        setCheckedStudents(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    /* ================= UPDATE ================= */

    const updateAttendance = async () => {
        if (!selectedDate) {
            setError("Select a date first.");
            return;
        }

        try {
            const records = students.map(student => ({
                student_id: student.student_id,
                present: checkedStudents[student.student_id] ? 1 : 0
            }));

            await api.post(
                "/api/attendance",
                {
                    subjectcode: selectedSubject,
                    date: selectedDate,
                    courcecode: selectedCourse,
                    semoryear: Number(selectedSem),
                    records
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setToast({ type: "success", message: "Attendance updated successfully!" });
            setError("");
        } catch (err) {
            const apiError = err.response?.data?.message || "Failed to update attendance.";
            setError(apiError);
            setToast({ type: "error", message: apiError });
        }
    };

    /* ================= DELETE ================= */

    const deleteAttendance = async () => {
        if (!selectedDate) {
            setError("Select a date first.");
            return;
        }

        try {
            await api.delete("/api/attendance", {
                headers: { Authorization: `Bearer ${token}` },
                data: {
                    subjectcode: selectedSubject,
                    date: selectedDate,
                    courcecode: selectedCourse,
                    semoryear: Number(selectedSem)
                }
            });

            const res = await api.get(
                `/api/attendance/dates?subjectcode=${selectedSubject}&courcecode=${selectedCourse}&semoryear=${selectedSem}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const formattedDates = (res.data || []).map(d => ({
                date: String(d.date).slice(0, 10)
            }));

            setAttendanceDates(formattedDates);
            setSelectedDate("");
            setCheckedStudents({});
            setToast({ type: "success", message: "Attendance deleted successfully." });
            setError("");
        } catch {
            const delError = "Failed to delete attendance record.";
            setError(delError);
            setToast({ type: "error", message: delError });
        }
    };

    return (
        <div className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">

            {/* PLATFORM HEADER - GLASSMORPHISM */}
            <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 text-white rounded-lg shadow-md shadow-blue-500/20">
                            <ClipboardEdit className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight leading-tight">Edit Attendance</h1>
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:block">Faculty Dashboard</p>
                        </div>
                    </div>
                    {/* RESET BUTTON */}
                    <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
                        <RotateCcw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Reset Form</span>
                    </button>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 space-y-6 pb-24">

                {/* ERROR STATE */}
                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm font-semibold animate-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {/* FILTER CARD */}
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4 sm:p-6 transition-all">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="w-4 h-4 text-blue-500" />
                        <h2 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Record Selection</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <select value={selectedCourse} onChange={(e) => { setSelectedCourse(e.target.value); setSelectedSem(""); setError(""); }}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                            <option value="">Course...</option>
                            {courses.map(course => <option key={course.id} value={course.course_code}>{course.course_name}</option>)}
                        </select>

                        <select value={selectedSem} onChange={(e) => { setSelectedSem(e.target.value); setSelectedSubject(""); setError(""); }} disabled={!selectedCourse}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 disabled:opacity-40 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                            <option value="">{semLabel}...</option>
                            {semesterOptions.map(num => <option key={num} value={num}>{semLabel} {num}</option>)}
                        </select>

                        <select value={selectedSubject} onChange={(e) => { setSelectedSubject(e.target.value); setSelectedDate(""); setError(""); }} disabled={!selectedSem}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 disabled:opacity-40 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                            <option value="">Subject...</option>
                            {subjects.map(sub => <option key={sub.subjectcode} value={sub.subjectcode}>{sub.subjectname}</option>)}
                        </select>

                        <select value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setError(""); }} disabled={!selectedSubject || attendanceDates.length === 0}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 disabled:opacity-40 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                            <option value="">{attendanceDates.length === 0 && selectedSubject ? "No Records Found" : "Select Date..."}</option>
                            {attendanceDates.map(d => <option key={d.date} value={d.date}>{d.date}</option>)}
                        </select>
                    </div>
                </section>

                {/* ATTENDANCE LEDGER */}
                {selectedDate ? (
                    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                            <table className="w-full table-fixed">
                                <thead>
                                <tr>
                                    <th className="w-[30%] sm:w-[25%] px-4 sm:px-6 py-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Roll No</th>
                                    <th className="w-[50%] sm:w-[50%] px-2 sm:px-4 py-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
                                    <th className="w-[20%] sm:w-[25%] px-4 sm:px-6 py-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Present</th>
                                </tr>
                                </thead>
                            </table>
                        </div>

                        <div className="w-full">
                            <table className="w-full table-fixed">
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {students.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                                            No students enrolled in this selection.
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((student, idx) => (
                                        <tr key={student.student_id} className={`${idx % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/50 dark:bg-slate-800/20'} hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-colors cursor-pointer`}
                                            onClick={() => toggleStudent(student.student_id)}>
                                            <td className="w-[30%] sm:w-[25%] px-4 sm:px-6 py-4">
                                                <div className="text-[11px] sm:text-xs font-mono font-bold text-slate-600 dark:text-slate-400 truncate">{student.rollnumber}</div>
                                            </td>
                                            <td className="w-[50%] sm:w-[50%] px-2 sm:px-4 py-4">
                                                <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                                                    {student.firstname} {student.lastname}
                                                </div>
                                            </td>
                                            <td className="w-[20%] sm:w-[25%] px-4 sm:px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={!!checkedStudents[student.student_id]}
                                                    onChange={() => toggleStudent(student.student_id)}
                                                    className="h-5 w-5 rounded border-slate-300 dark:border-slate-600 text-blue-600 bg-white dark:bg-slate-900 focus:ring-blue-500 dark:focus:ring-blue-500/50 cursor-pointer transition-colors"
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                ) : (
                    /* MODERN EMPTY STATE */
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center px-4 shadow-sm">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-4 border border-slate-100 dark:border-slate-800">
                            <ListChecks className="w-8 h-8 text-blue-500" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Load Existing Record</h2>
                        <p className="text-sm text-slate-500 mt-1 max-w-xs">Complete the hierarchy and select an existing date to edit attendance.</p>
                    </div>
                )}
            </main>

            {/* STICKY BOTTOM ACTION BAR */}
            {selectedDate && students.length > 0 && (
                <div className="sticky bottom-0 mt-auto w-full z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 p-4 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                        <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-500">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            Editing record for {selectedDate}
                        </div>
                        <div className="flex w-full sm:w-auto items-center justify-end gap-3">
                            <button onClick={() => setShowDeleteModal(true)}
                                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                                <Trash2 className="w-4 h-4" /> Delete
                            </button>
                            <button onClick={() => setShowSaveModal(true)}
                                    className="w-full sm:w-auto px-8 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2">
                                <Save className="w-4 h-4" /> Update
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODALS & TOASTS */}
            <ConfirmSaveModal
                show={showSaveModal}
                title="Confirm Updates"
                message={`Submit modified attendance records for ${selectedDate}? This will overwrite existing data on the server.`}
                confirmText="Update Records"
                onCancel={() => setShowSaveModal(false)}
                onConfirm={() => {
                    setShowSaveModal(false);
                    updateAttendance();
                }}
            />

            <ConfirmDeleteModal
                show={showDeleteModal}
                title="Authorization Required"
                message={`Are you sure you want to permanently delete the entire attendance log for ${selectedDate}? This action cannot be reversed.`}
                onCancel={() => setShowDeleteModal(false)}
                onConfirm={() => {
                    setShowDeleteModal(false);
                    deleteAttendance();
                }}
            />

            {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
};

export default EditAttendance;