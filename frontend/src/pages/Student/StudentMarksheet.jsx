import { useEffect, useState } from "react";
import api from "../../utils/api";
import {
  BarChart3,
  Filter,
  BookOpen,
  Percent,
  Trophy
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
            filtered = filtered.filter(
                m => String(m.semoryear) === String(selectedSem)
            );
        }

        if (selectedSubject) {
            filtered = filtered.filter(
                m => String(m.subjectcode) === String(selectedSubject)
            );
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

    /* ================= SUMMARY ================= */
    const totalSubjects = marks.length;
    const totalMarks = marks.reduce((acc, m) => acc + (m.theorymarks + m.practicalmarks), 0);
    const avgMarks = totalSubjects ? (totalMarks / totalSubjects).toFixed(1) : 0;
    const highest = totalSubjects ? Math.max(...marks.map(m => m.theorymarks + m.practicalmarks)) : 0;

    return (
        <div className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">

            {/* HEADER */}
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 text-white rounded-lg">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg">My Marksheet</h1>
                        <p className="text-xs text-slate-500 uppercase">Academic Performance</p>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto w-full px-4 py-6 space-y-6">

                {/* FILTERS */}
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="w-4 h-4 text-indigo-500" />
                        <h2 className="text-xs font-bold uppercase text-slate-500">Filters</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <select
                            value={selectedSem}
                            onChange={(e) => {
                                setSelectedSem(e.target.value);
                                setSelectedSubject("");
                            }}
                            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2"
                        >
                            <option value="">All Semesters</option>
                            {semesters.map((sem, i) => (
                                <option key={i} value={sem}>
                                    Semester {sem}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2"
                        >
                            <option value="">All Subjects</option>
                            {subjects.map((sub) => (
                                <option key={sub.code} value={sub.code}>
                                    {sub.name}
                                </option>
                            ))}
                        </select>

                    </div>
                </section>

                {/* SUMMARY CARDS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Subjects", value: totalSubjects, icon: BookOpen },
                        { label: "Total Marks", value: totalMarks, icon: Percent },
                        { label: "Average", value: avgMarks, icon: BarChart3 },
                        { label: "Highest", value: highest, icon: Trophy },
                    ].map((item, i) => (
                        <div key={i} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                            <div className="flex justify-between mb-2">
                                <p className="text-xs uppercase text-slate-500 font-bold">{item.label}</p>
                                <item.icon className="w-4 h-4 text-indigo-500" />
                            </div>
                            <p className="text-xl font-black">{item.value}</p>
                        </div>
                    ))}
                </div>

                {/* TABLE */}
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">

                    <div className="border-b bg-slate-50 dark:bg-slate-950/50">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="p-4 text-left text-xs uppercase">Subject</th>
                                    <th className="p-4 text-center text-xs uppercase">Theory</th>
                                    <th className="p-4 text-center text-xs uppercase">Practical</th>
                                    <th className="p-4 text-center text-xs uppercase">Total</th>
                                </tr>
                            </thead>
                        </table>
                    </div>

                    <div>
                        <table className="w-full">
                            <tbody>
                                {marks.map((item, index) => (
                                    <tr key={index} className="border-t hover:bg-indigo-50 dark:hover:bg-indigo-500/5">

                                        <td className="p-4 font-semibold">
                                            {item.subjectname}
                                        </td>

                                        <td className="p-4 text-center">
                                            {item.theorymarks}
                                        </td>

                                        <td className="p-4 text-center">
                                            {item.practicalmarks}
                                        </td>

                                        <td className="p-4 text-center font-bold">
                                            {item.theorymarks + item.practicalmarks}
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </section>

            </main>
        </div>
    );
};

export default StudentMarksheet;