import { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";
import {
    TrendingUp,
    Filter,
    RotateCcw,
    Users,
    Calendar,
    Percent,
    AlertCircle,
    ListChecks
} from "lucide-react";

const AttendanceReport = () => {
    const token = localStorage.getItem("token");

    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [reportData, setReportData] = useState([]);

    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedSem, setSelectedSem] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const isSelectionComplete = selectedCourse && selectedSem && selectedSubject;

    /* ================= ACTION: RESET ================= */
    const handleReset = () => {
        setSelectedCourse("");
        setSelectedSem("");
        setSelectedSubject("");
        setReportData([]);
        setError("");
    };

    /* ================= DATA ENGINE ================= */
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await api.get("/api/courses", { headers: { Authorization: `Bearer ${token}` } });
                setCourses(res.data || []);
            } catch { setError("Failed to load courses."); }
        };
        if (token) fetchCourses();
    }, [token]);

    const selectedCourseObj = useMemo(() => courses.find(c => c.course_code === selectedCourse), [courses, selectedCourse]);
    const semLabel = selectedCourseObj?.sem_or_year?.toLowerCase() === "year" ? "Year" : "Semester";
    const semesterOptions = useMemo(() => {
        if (!selectedCourseObj) return [];
        return Array.from({ length: Number(selectedCourseObj.total_semesters) }, (_, i) => i + 1);
    }, [selectedCourseObj]);

    useEffect(() => {
        if (!selectedCourse || !selectedSem) { setSubjects([]); return; }
        const fetchSubjects = async () => {
            try {
                const res = await api.get(`/api/subjects?course_code=${selectedCourse}&sem=${selectedSem}`, { headers: { Authorization: `Bearer ${token}` } });
                setSubjects(res.data || []);
            } catch { setError("Failed to load subjects."); }
        };
        fetchSubjects();
    }, [selectedCourse, selectedSem, token]);

    useEffect(() => {
        if (!isSelectionComplete) { setReportData([]); return; }
        const fetchReport = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/api/attendance/report?course=${selectedCourse}&sem=${selectedSem}&subject=${selectedSubject}`, { headers: { Authorization: `Bearer ${token}` } });
                setReportData(res.data || []);
                setError("");
            } catch { setError("Failed to load report."); } finally { setLoading(false); }
        };
        fetchReport();
    }, [selectedSubject, selectedCourse, selectedSem, token, isSelectionComplete]);

    const summary = useMemo(() => {
        if (reportData.length === 0) return null;
        const totalStudents = reportData.length;
        const totalClasses = reportData[0]?.total_classes || 0;
        const avg = reportData.reduce((acc, s) => acc + Number(s.percentage), 0) / totalStudents;
        const below75 = reportData.filter(s => Number(s.percentage) < 75).length;
        return { totalStudents, totalClasses, average: avg.toFixed(1), below75 };
    }, [reportData]);

    return (
        <div className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">

            {/* PLATFORM HEADER */}
            <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-md shadow-indigo-500/20">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight leading-tight">Attendance Report</h1>
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:block">Performance Analytics</p>
                        </div>
                    </div>
                    <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
                        <RotateCcw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Reset Matrix</span>
                    </button>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 space-y-6">

                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-900/20 rounded-xl text-red-600 dark:text-red-400 text-sm font-semibold">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {/* FILTER CARD */}
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4 sm:p-6 transition-all">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="w-4 h-4 text-indigo-500" />
                        <h2 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Report Parameters</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <select value={selectedCourse} onChange={(e) => { setSelectedCourse(e.target.value); setSelectedSem(""); setSelectedSubject(""); }}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer">
                            <option value="">Select Course...</option>
                            {courses.map(c => <option key={c.id} value={c.course_code}>{c.course_name}</option>)}
                        </select>
                        <select value={selectedSem} disabled={!selectedCourse} onChange={(e) => { setSelectedSem(e.target.value); setSelectedSubject(""); }}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm disabled:opacity-40 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer">
                            <option value="">Select {semLabel}...</option>
                            {semesterOptions.map(num => <option key={num} value={num}>{semLabel} {num}</option>)}
                        </select>
                        <select value={selectedSubject} disabled={!selectedSem} onChange={(e) => setSelectedSubject(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm disabled:opacity-40 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer">
                            <option value="">Select Subject...</option>
                            {subjects.map(s => <option key={s.subjectcode} value={s.subjectcode}>{s.subjectname}</option>)}
                        </select>
                    </div>
                </section>

                {/* CONTENT RENDERER */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Compiling report data...</p>
                    </div>
                ) : isSelectionComplete && reportData.length > 0 ? (
                    <div className="space-y-6">
                        {/* SUMMARY CARDS */}
                        {summary && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: "Strength", value: summary.totalStudents, icon: Users },
                                    { label: "Lectures", value: summary.totalClasses, icon: Calendar },
                                    { label: "Average %", value: `${summary.average}%`, icon: Percent },
                                    { label: "Critical", value: summary.below75, icon: AlertCircle, danger: summary.below75 > 0 }
                                ].map((item, idx) => (
                                    <div key={idx} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{item.label}</p>
                                            <item.icon className={`w-3.5 h-3.5 ${item.danger ? 'text-red-500' : 'text-indigo-500'}`} />
                                        </div>
                                        <p className={`text-xl font-black ${item.danger ? "text-red-600" : "text-slate-900 dark:text-slate-100"}`}>{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* DATA TABLE */}
                        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all">
                            <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                                <table className="w-full table-fixed">
                                    <thead>
                                    <tr>
                                        <th className="w-[45%] sm:w-[40%] px-4 sm:px-6 py-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Student Profile</th>
                                        <th className="w-[30%] px-2 sm:px-4 py-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Classes (P/T)</th>
                                        <th className="w-[25%] sm:w-[30%] px-4 sm:px-6 py-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance %</th>
                                    </tr>
                                    </thead>
                                </table>
                            </div>

                            <div className="w-full">
                                <table className="w-full table-fixed">
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                    {reportData.map((student, idx) => {
                                        const low = Number(student.percentage) < 75;
                                        return (
                                            <tr key={student.rollnumber} className={`${idx % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/50 dark:bg-slate-800/20'} hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-colors`}>
                                                <td className="w-[45%] sm:w-[40%] px-4 sm:px-6 py-4">
                                                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{student.name}</div>
                                                    <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{student.rollnumber}</div>
                                                </td>
                                                <td className="w-[30%] px-2 sm:px-4 py-4 text-center">
                                                    <div className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                                                        {student.present_count} / {student.total_classes}
                                                    </div>
                                                </td>
                                                <td className="w-[25%] sm:w-[30%] px-4 sm:px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-black border
                                                        ${low ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20'
                                                        : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'}`}>
                                                        {student.percentage}%
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                ) : (
                    /* MODERN EMPTY STATE */
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center px-4 shadow-sm">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-4 border border-slate-100 dark:border-slate-800">
                            <ListChecks className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Generate Report</h2>
                        <p className="text-sm text-slate-500 mt-1 max-w-xs">Select the course, semester, and subject to view aggregate attendance statistics.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AttendanceReport;