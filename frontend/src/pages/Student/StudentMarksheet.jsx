import { useEffect, useState } from "react";
import api from "../../utils/api";
import {
    BarChart3,
    Filter,
    BookOpen,
    Percent,
    Trophy,
    RotateCcw,
    ChevronDown,
    ListChecks
} from "lucide-react";

const StudentMarksheet = () => {
    const token = localStorage.getItem("token");

    const [marks, setMarks] = useState([]);
    const [allMarks, setAllMarks] = useState([]);
    const [selectedSem, setSelectedSem] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");

    const fetchMarks = async () => {
        try {
            const res = await api.get("/api/student/marks", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAllMarks(res.data.marks || []);
            setMarks(res.data.marks || []);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchMarks();
    }, []);

    useEffect(() => {
        let filtered = allMarks;
        if (selectedSem) {
            filtered = filtered.filter(m => String(m.semoryear) === String(selectedSem));
        }
        if (selectedSubject) {
            filtered = filtered.filter(m => String(m.subjectcode) === String(selectedSubject));
        }
        setMarks(filtered);
    }, [selectedSem, selectedSubject, allMarks]);

    const semesters = [...new Set(allMarks.map(m => m.semoryear))];
    const subjects = [
        ...new Map(
            allMarks
                .filter(m => !selectedSem || String(m.semoryear) === String(selectedSem))
                .map(m => [m.subjectcode, { name: m.subjectname, code: m.subjectcode }])
        ).values()
    ];

    /* ================= SUMMARY LOGIC ================= */
    const totalSubjects = marks.length;
    const totalMarks = marks.reduce((acc, m) => acc + (m.theorymarks + m.practicalmarks), 0);
    const avgMarks = totalSubjects ? (totalMarks / totalSubjects).toFixed(1) : 0;
    const highest = totalSubjects ? Math.max(...marks.map(m => m.theorymarks + m.practicalmarks)) : 0;

    const handleReset = () => {
        setSelectedSem("");
        setSelectedSubject("");
    };

    return (
        <div className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">

            {/* PLATFORM HEADER */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-md shadow-indigo-500/20">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight leading-tight">My Marksheet</h1>
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:block">Academic Performance</p>
                        </div>
                    </div>
                    {(selectedSem || selectedSubject) && (
                        <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
                            <RotateCcw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Clear Filters</span>
                        </button>
                    )}
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 space-y-6">

                {/* FILTER CARD */}
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="w-4 h-4 text-indigo-500" />
                        <h2 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Analysis Matrix</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                            <select
                                value={selectedSem}
                                onChange={(e) => { setSelectedSem(e.target.value); setSelectedSubject(""); }}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">All Semesters / Years</option>
                                {semesters.map((sem, i) => <option key={i} value={sem}>Semester {sem}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>

                        <div className="relative">
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">All Subjects</option>
                                {subjects.map((sub) => <option key={sub.code} value={sub.code}>{sub.name}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </section>

                {/* SUMMARY CARDS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Subjects", value: totalSubjects, icon: BookOpen },
                        { label: "Total Marks", value: totalMarks, icon: Percent },
                        { label: "Avg. Performance", value: avgMarks, icon: BarChart3 },
                        { label: "Highest Score", value: highest, icon: Trophy },
                    ].map((item, i) => (
                        <div key={i} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                            <div className="flex justify-between mb-2">
                                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{item.label}</p>
                                <item.icon className="w-3.5 h-3.5 text-indigo-500" />
                            </div>
                            <p className="text-xl font-black text-slate-900 dark:text-slate-100">{item.value}</p>
                        </div>
                    ))}
                </div>

                {/* DATA TABLE */}
                {marks.length > 0 ? (
                    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                            <table className="w-full table-fixed">
                                <thead>
                                    <tr>
                                        <th className="w-[50%] px-4 sm:px-6 py-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Subject Title</th>
                                        <th className="w-[15%] px-2 py-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Theory</th>
                                        <th className="w-[15%] px-2 py-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Practical</th>
                                        <th className="w-[20%] px-4 py-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Total Score</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>

                        <div className="w-full">
                            <table className="w-full table-fixed">
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                    {marks.map((item, index) => (
                                        <tr key={index} className="hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-colors">
                                            <td className="w-[50%] px-4 sm:px-6 py-4">
                                                <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                                                    {item.subjectname}
                                                </div>
                                                <div className="text-[10px] text-slate-500 font-medium mt-0.5 uppercase tracking-wide">
                                                    Code: {item.subjectcode}
                                                </div>
                                            </td>
                                            <td className="w-[15%] px-2 py-4 text-center">
                                                <div className="text-xs font-medium text-slate-600 dark:text-slate-400">{item.theorymarks}</div>
                                            </td>
                                            <td className="w-[15%] px-2 py-4 text-center">
                                                <div className="text-xs font-medium text-slate-600 dark:text-slate-400">{item.practicalmarks}</div>
                                            </td>
                                            <td className="w-[20%] px-4 py-4 text-center">
                                                <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-black border border-indigo-100 dark:border-indigo-900/30">
                                                    {item.theorymarks + item.practicalmarks}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                ) : (
                    /* EMPTY STATE */
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center px-4 shadow-sm">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-4">
                            <ListChecks className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Records Found</h2>
                        <p className="text-sm text-slate-500 mt-1 max-w-xs">We couldn't find any marks matching your selected criteria. Try adjusting your filters.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default StudentMarksheet;