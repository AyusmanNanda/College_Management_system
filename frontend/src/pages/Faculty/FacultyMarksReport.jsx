import { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";
import {
    BarChart3,
    Filter,
    RotateCcw,
    Users,
    Trophy,
    Percent,
    ArrowDownCircle,
    AlertCircle,
    BookOpen,
    ClipboardList
} from "lucide-react";

export default function FacultyMarksReport() {
    const token = localStorage.getItem("token");

    const [assignedSubjects, setAssignedSubjects] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [loadingSubjects, setLoadingSubjects] = useState(true);
    const [loadingReport, setLoadingReport] = useState(false);
    const [error, setError] = useState("");

    const handleReset = () => {
        setSelectedSubject("");
        setReportData([]);
        setError("");
    };

    /* ================= DATA ENGINE ================= */
    useEffect(() => {
        const fetchAssignedSubjects = async () => {
            try {
                setLoadingSubjects(true);
                const res = await api.get("/api/faculty/assigned-subjects", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAssignedSubjects(res.data || []);
            } catch (err) {
                setAssignedSubjects([]);
                setError("Failed to load assigned subjects.");
            } finally {
                setLoadingSubjects(false);
            }
        };
        if (token) fetchAssignedSubjects();
    }, [token]);

    const selectedSubjectObj = useMemo(() => {
        return assignedSubjects.find((item) => String(item.subjectcode) === String(selectedSubject));
    }, [assignedSubjects, selectedSubject]);

    const selectedCourse = selectedSubjectObj?.courcecode || "";
    const selectedSem = selectedSubjectObj?.semoryear || "";

    useEffect(() => {
        if (!selectedSubject || !selectedCourse || !selectedSem) {
            setReportData([]);
            return;
        }
        const fetchReport = async () => {
            try {
                setLoadingReport(true);
                const res = await api.get(
                    `/api/marks/subject-report?course=${selectedCourse}&sem=${selectedSem}&subject=${selectedSubject}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setReportData(res.data || []);
            } catch (err) {
                setReportData([]);
                setError("Failed to load marks report.");
            } finally {
                setLoadingReport(false);
            }
        };
        fetchReport();
    }, [selectedSubject, selectedCourse, selectedSem, token]);

    const summary = useMemo(() => {
        if (reportData.length === 0) return null;
        const totalStudents = reportData.length;
        const avg = reportData.reduce((acc, s) => acc + Number(s.total || 0), 0) / totalStudents;
        const highest = Math.max(...reportData.map((s) => Number(s.total || 0)));
        const failed = reportData.filter((s) => s.grade === "F").length;
        return { totalStudents, average: avg.toFixed(1), highest, failed };
    }, [reportData]);

    const isReady = selectedSubject && selectedCourse && selectedSem;

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">
            
            {/* PLATFORM HEADER */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-md shadow-indigo-500/20">
                            <ClipboardList className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Marks Report</h1>
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:block">Subject Performance</p>
                        </div>
                    </div>
                    <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
                        <RotateCcw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Reset Report</span>
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
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4 sm:p-6 transition-colors">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <h2 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Subject Selection</h2>
                    </div>
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        disabled={loadingSubjects}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                    >
                        <option value="">{loadingSubjects ? "Loading Assigned Subjects..." : "Select Your Subject..."}</option>
                        {assignedSubjects.map((sub, index) => (
                            <option key={`${sub.subjectcode}-${index}`} value={sub.subjectcode}>
                                {sub.subjectname} ({sub.subjectcode})
                            </option>
                        ))}
                    </select>
                </section>

                {/* SUMMARY GRID - Placed here to ensure consistent layout height */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
                    {[
                        { label: "Students", value: summary?.totalStudents ?? "—", icon: Users, color: "text-indigo-600" },
                        { label: "Avg Score", value: summary?.average ?? "—", icon: Percent, color: "text-emerald-600" },
                        { label: "Highest", value: summary?.highest ?? "—", icon: Trophy, color: "text-amber-500" },
                        { label: "Failed", value: summary?.failed ?? "—", icon: ArrowDownCircle, color: "text-red-500" }
                    ].map((item, idx) => (
                        <div key={idx} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col justify-between min-h-[100px]">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">{item.label}</p>
                                <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                            </div>
                            <p className="text-xl font-black text-slate-900 dark:text-slate-100">{item.value}</p>
                        </div>
                    ))}
                </div>

                {/* DYNAMIC CONTENT AREA */}
                {loadingReport ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Analyzing marks data...</p>
                    </div>
                ) : isReady && reportData.length > 0 ? (
                    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="overflow-x-auto">
                            <table className="w-full table-fixed min-w-[600px]">
                                <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="w-[40%] px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Student Profile</th>
                                        <th className="px-4 py-4 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">Theory</th>
                                        <th className="px-4 py-4 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pract.</th>
                                        <th className="px-4 py-4 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">Grade</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                    {reportData.map((student, idx) => (
                                        <tr key={student.rollnumber} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{student.name}</div>
                                                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{student.rollnumber}</div>
                                            </td>
                                            <td className="px-4 py-4 text-center text-xs font-medium text-slate-600 dark:text-slate-300">{student.theorymarks}</td>
                                            <td className="px-4 py-4 text-center text-xs font-medium text-slate-600 dark:text-slate-300">{student.practicalmarks || 0}</td>
                                            <td className="px-4 py-4 text-center text-xs font-bold text-slate-900 dark:text-slate-100">{student.total}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-[10px] font-black uppercase border ${
                                                    student.grade === 'F' 
                                                    ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-900/30' 
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700'
                                                }`}>
                                                    {student.grade}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center px-4 shadow-sm">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-4 border border-slate-100 dark:border-slate-800">
                            <BookOpen className="w-8 h-8 text-indigo-600 dark:text-indigo-500" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Prepare Marks Report</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">Select a subject from the dropdown above to analyze student performance data.</p>
                    </div>
                )}
            </main>
        </div>
    );
}