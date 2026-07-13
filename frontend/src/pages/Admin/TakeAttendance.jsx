import { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";
import ConfirmSaveModal from "./modals/ConfirmSaveModal.jsx";
import Toast from "./Toast.jsx";
import {
    CheckSquare,
    Filter,
    RotateCcw,
    Save,
    AlertCircle,
    ListChecks,
    CheckCircle2
} from "lucide-react";

const TakeAttendance = () => {
    const token = localStorage.getItem("token");

    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [existingDates, setExistingDates] = useState([]);

    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedSem, setSelectedSem] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedDate, setSelectedDate] = useState("");

    const [markMode, setMarkMode] = useState("present");
    const [checkedStudents, setCheckedStudents] = useState({});

    const [error, setError] = useState("");
    const [toast, setToast] = useState(null);

    const [showSaveModal, setShowSaveModal] = useState(false);

    /* ================= ACTION: RESET ================= */
    const handleReset = () => {
        setSelectedCourse("");
        setSelectedSem("");
        setSelectedSubject("");
        setSelectedDate("");
        setCheckedStudents({});
        setExistingDates([]);
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
                setError("Failed to load courses.");
            }
        };
        fetchCourses();
    }, [token]);

    /* ================= DERIVED SEM/YEAR OPTIONS ================= */

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
                setCheckedStudents({});
                setExistingDates([]);
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
                setExistingDates(res.data.map(d => d.date));
            } catch {
                setExistingDates([]);
            }
        };

        fetchDates();
    }, [selectedSubject, selectedCourse, selectedSem, token]);

    /* ================= TOGGLE ================= */

    const toggleStudent = (id) => {
        setCheckedStudents(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    /* ================= SAVE ================= */

    const saveAttendance = async () => {
        if (!selectedSubject || !selectedDate) {
            setError("Select subject and date.");
            return;
        }

        if (existingDates.includes(selectedDate)) {
            setError("Attendance already exists for this date.");
            return;
        }

        try {
            const records = students.map(student => {
                const isChecked = !!checkedStudents[student.student_id];

                return {
                    student_id: student.student_id,
                    present:
                        markMode === "present"
                            ? (isChecked ? 1 : 0)
                            : (isChecked ? 0 : 1)
                };
            });

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

            setToast({ type: "success", message: "Attendance saved successfully!" });
            setError("");
            setCheckedStudents({});

        } catch (err) {
            const apiError = err.response?.data?.message || "Failed to save attendance.";
            setError(apiError);
            setToast({ type: "error", message: apiError });
        }
    };

    const isFormReady =
        selectedCourse &&
        selectedSem &&
        selectedSubject &&
        selectedDate;

    return (
        <div className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">

            {/* PLATFORM HEADER - GLASSMORPHISM */}
            <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 text-white rounded-lg shadow-md shadow-blue-500/20">
                            <CheckSquare className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight leading-tight">Log Attendance</h1>
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
            <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 space-y-6">

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
                        <h2 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Class Parameters</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <select value={selectedCourse} onChange={(e) => { setSelectedCourse(e.target.value); setSelectedSem(""); setError(""); }}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                            <option value="">Course...</option>
                            {courses.map(course => <option key={course.id} value={course.course_code}>{course.course_name}</option>)}
                        </select>

                        <select value={selectedSem} onChange={(e) => { setSelectedSem(e.target.value); setError(""); }} disabled={!selectedCourse}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 disabled:opacity-40 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                            <option value="">{semLabel}...</option>
                            {semesterOptions.map(num => <option key={num} value={num}>{semLabel} {num}</option>)}
                        </select>

                        <select value={selectedSubject} onChange={(e) => { setSelectedSubject(e.target.value); setError(""); }} disabled={!selectedSem}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 disabled:opacity-40 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                            <option value="">Subject...</option>
                            {subjects.map(sub => <option key={sub.subjectcode} value={sub.subjectcode}>{sub.subjectname}</option>)}
                        </select>

                        <input type="date" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setError(""); }}
                               className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />

                        <select value={markMode} onChange={(e) => setMarkMode(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-semibold text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                            <option value="present">Check = Present</option>
                            <option value="absent">Check = Absent</option>
                        </select>
                    </div>
                </section>

                {/* ATTENDANCE LEDGER */}
                {isFormReady ? (
                    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                            <table className="w-full table-fixed">
                                <thead>
                                <tr>
                                    <th className="w-[30%] sm:w-[25%] px-4 sm:px-6 py-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Roll No</th>
                                    <th className="w-[50%] sm:w-[50%] px-2 sm:px-4 py-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
                                    <th className="w-[20%] sm:w-[25%] px-4 sm:px-6 py-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        {markMode === "present" ? "Present" : "Absent"}
                                    </th>
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
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Awaiting Configuration</h2>
                        <p className="text-sm text-slate-500 mt-1 max-w-xs">Complete the hierarchy and select a date to load the attendance ledger.</p>
                    </div>
                )}
            </main>

            {/* STICKY BOTTOM ACTION BAR - REFACTORED TO STICKY W-FULL */}
            {isFormReady && students.length > 0 && (
                <div className="sticky bottom-0 mt-auto w-full z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 p-4 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                        <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-500">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            Recording for {students.length} students
                        </div>
                        <button onClick={() => setShowSaveModal(true)} disabled={!isFormReady}
                                className={`w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2
                                ${isFormReady ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}
                            `}>
                            <Save className="w-4 h-4" /> Save Attendance
                        </button>
                    </div>
                </div>
            )}

            {/* MODALS & TOASTS */}
            <ConfirmSaveModal
                show={showSaveModal}
                title="Confirm Data Sync"
                message={`Submit official attendance records for ${selectedDate}? This action logs data to the central server.`}
                confirmText="Save Records"
                onCancel={() => setShowSaveModal(false)}
                onConfirm={() => {
                    setShowSaveModal(false);
                    saveAttendance();
                }}
            />

            {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
};

export default TakeAttendance;