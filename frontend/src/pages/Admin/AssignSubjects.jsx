import { useEffect, useState } from "react";
import api from "../../utils/api";
import Toast from "../../components/ui/Toast.jsx";
import {
    UserCheck,
    Filter,
    RotateCcw,
    AlertCircle,
    CheckCircle2,
    XCircle,
    ListChecks
} from "lucide-react";

const AssignSubjects = () => {
    const token = localStorage.getItem("token");

    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [faculties, setFaculties] = useState([]);

    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedSem, setSelectedSem] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [toast, setToast] = useState(null);

    /* ================= ACTION: RESET ================= */
    const handleReset = () => {
        setSelectedCourse("");
        setSelectedSem("");
        setSelectedSubject("");
        setSubjects([]);
        setFaculties([]);
        setError("");
    };

    /* ================= FETCH COURSES ================= */

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

    /* ================= FETCH SUBJECTS ================= */

    const fetchSubjects = async () => {
        if (!selectedCourse || !selectedSem) return;

        try {
            const res = await api.get(
                `/api/subjects?course_code=${selectedCourse}&sem=${selectedSem}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSubjects(res.data || []);
        } catch {
            setError("Failed to load subjects.");
        }
    };

    /* ================= FETCH FACULTIES ================= */

    const fetchFaculties = async () => {
        try {
            const res = await api.get("/api/assign/faculties", {
                headers: { Authorization: `Bearer ${token}` }
            });

            const filtered = (res.data || []).filter(
                (f) =>
                    f.courcecode === "NOT ASSIGNED" ||
                    f.courcecode === selectedCourse
            );

            setFaculties(filtered);
        } catch {
            setError("Failed to load faculties.");
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse && selectedSem) {
            fetchSubjects();
            fetchFaculties();
        } else {
            setSubjects([]);
            setFaculties([]);
        }
    }, [selectedCourse, selectedSem]);

    /* ================= ASSIGN ================= */

    const handleAssign = async (facultyId) => {
        if (!selectedCourse || !selectedSem || !selectedSubject) {
            setError("Select course, semester and subject first.");
            setToast({ type: "error", message: "Select course, semester and subject first." });
            return;
        }

        try {
            setLoading(true);

            await api.put(
                `/api/assign/${facultyId}`,
                {
                    subjectcode: selectedSubject,
                    courcecode: selectedCourse,
                    semoryear: selectedSem
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setToast({ type: "success", message: "Subject assigned successfully!" });
            fetchFaculties();
            setError("");
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Failed to assign subject.";
            setError(errorMessage);
            setToast({ type: "error", message: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    /* ================= UNASSIGN ================= */

    const handleUnassign = async (facultyId) => {
        try {
            setLoading(true);

            await api.put(
                `/api/assign/${facultyId}`,
                {
                    subjectcode: "NOT ASSIGNED",
                    courcecode: "NOT ASSIGNED",
                    semoryear: 0
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setToast({ type: "success", message: "Subject unassigned successfully!" });
            fetchFaculties();
            setError("");
        } catch {
            setError("Failed to unassign subject.");
            setToast({ type: "error", message: "Failed to unassign subject." });
        } finally {
            setLoading(false);
        }
    };

    const selectedCourseData = courses.find(
        (c) => c.course_code === selectedCourse
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans pb-12">

            {/* PLATFORM HEADER - GLASSMORPHISM */}
            <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 text-white rounded-lg shadow-md shadow-blue-500/20">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight leading-tight">Faculty Assignments</h1>
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:block">Resource Allocation</p>
                        </div>
                    </div>
                    {/* RESET BUTTON */}
                    <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
                        <RotateCcw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Reset Matrix</span>
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">

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
                        <h2 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Assignment Parameters</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select
                            value={selectedCourse}
                            onChange={(e) => {
                                setSelectedCourse(e.target.value);
                                setSelectedSem("");
                                setSelectedSubject("");
                            }}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                        >
                            <option value="">Select Course...</option>
                            {courses.map((course) => (
                                <option key={course.id} value={course.course_code}>
                                    {course.course_name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedSem}
                            onChange={(e) => {
                                setSelectedSem(e.target.value);
                                setSelectedSubject("");
                            }}
                            disabled={!selectedCourse}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 disabled:opacity-40 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                        >
                            <option value="">Select Semester/Year...</option>
                            {selectedCourseData &&
                                Array.from(
                                    { length: selectedCourseData.total_semesters },
                                    (_, i) => i + 1
                                ).map((sem) => (
                                    <option key={sem} value={sem}>
                                        {selectedCourseData.sem_or_year === "year" ? `Year ${sem}` : `Semester ${sem}`}
                                    </option>
                                ))}
                        </select>

                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            disabled={!selectedSem}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 disabled:opacity-40 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                        >
                            <option value="">Select Target Subject...</option>
                            {subjects.map((sub) => (
                                <option key={sub.subjectcode} value={sub.subjectcode}>
                                    {sub.subjectname} ({sub.subjectcode})
                                </option>
                            ))}
                        </select>
                    </div>
                </section>

                {/* FACULTY ASSIGNMENT TABLE - ZERO HORIZONTAL SCROLL ON MOBILE */}
                {selectedCourse && selectedSem ? (
                    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                            <table className="w-full table-fixed">
                                <thead>
                                <tr>
                                    <th className="w-[35%] sm:w-[25%] px-4 sm:px-6 py-3.5 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Faculty Name</th>
                                    <th className="hidden sm:table-cell sm:w-[30%] px-2 sm:px-4 py-3.5 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</th>
                                    <th className="w-[35%] sm:w-[25%] px-2 sm:px-4 py-3.5 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Current Assignment</th>
                                    <th className="w-[30%] sm:w-[20%] px-4 sm:px-6 py-3.5 text-right sm:text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Controls</th>
                                </tr>
                                </thead>
                            </table>
                        </div>

                        <div className="w-full">
                            <table className="w-full table-fixed">
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {faculties.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                                            No faculty members available for this selection.
                                        </td>
                                    </tr>
                                ) : (
                                    faculties.map((faculty, idx) => {
                                        const isAssigned = faculty.subject !== "NOT ASSIGNED";
                                        return (
                                            <tr key={faculty.sr_no} className={`${idx % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/50 dark:bg-slate-800/20'} hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-colors`}>
                                                <td className="w-[35%] sm:w-[25%] px-4 sm:px-6 py-4">
                                                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{faculty.facultyname}</div>
                                                </td>
                                                <td className="hidden sm:table-cell sm:w-[30%] px-2 sm:px-4 py-4">
                                                    <div className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 truncate">{faculty.emailid}</div>
                                                </td>
                                                <td className="w-[35%] sm:w-[25%] px-2 sm:px-4 py-4">
                                                    {isAssigned ? (
                                                        <div className="inline-flex flex-col items-start">
                                                                <span className="px-2 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded border border-emerald-200 dark:border-emerald-500/20 truncate max-w-full" title={faculty.subjectname}>
                                                                    {faculty.subjectname || faculty.subject}
                                                                </span>
                                                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-1 px-1">{faculty.subject}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="px-2 py-1 text-[10px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 rounded uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                                                                Available
                                                            </span>
                                                    )}
                                                </td>
                                                <td className="w-[30%] sm:w-[20%] px-4 sm:px-6 py-3 text-right sm:text-center">
                                                    <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end sm:justify-center gap-2">
                                                        <button
                                                            onClick={() => handleAssign(faculty.sr_no)}
                                                            disabled={loading}
                                                            className="w-full max-w-[100px] flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] sm:text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 active:scale-95"
                                                        >
                                                            <CheckCircle2 className="w-3.5 h-3.5 hidden sm:block" /> Assign
                                                        </button>

                                                        {isAssigned && (
                                                            <button
                                                                onClick={() => handleUnassign(faculty.sr_no)}
                                                                disabled={loading}
                                                                className="w-full max-w-[100px] flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-lg text-[10px] sm:text-xs font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors disabled:opacity-70 active:scale-95"
                                                            >
                                                                <XCircle className="w-3.5 h-3.5 hidden sm:block" /> Unlink
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
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
                        <p className="text-sm text-slate-500 mt-1 max-w-xs">Select a course and semester to load the faculty matrix.</p>
                    </div>
                )}
            </main>

            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default AssignSubjects;