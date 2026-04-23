import { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";

const MarksReport = () => {
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
        if (token) fetchCourses();
    }, [token]);

    /* ================= DERIVED OPTIONS ================= */
    const selectedCourseObj = useMemo(() => {
        return courses.find(c => c.course_code === selectedCourse);
    }, [courses, selectedCourse]);

    const semLabel = selectedCourseObj?.sem_or_year?.toLowerCase() === "year" ? "Year" : "Semester";

    const semesterOptions = useMemo(() => {
        if (!selectedCourseObj) return [];
        return Array.from({ length: Number(selectedCourseObj.total_semesters) }, (_, i) => i + 1);
    }, [selectedCourseObj]);

    /* ================= FETCH SUBJECTS ================= */
    useEffect(() => {
        if (!selectedCourse || !selectedSem) {
            setSubjects([]);
            return;
        }

        const fetchSubjects = async () => {
            try {
                const res = await api.get(
                    `/api/marks/subjects?course=${selectedCourse}&sem=${selectedSem}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setSubjects(res.data || []);
            } catch {
                setError("Failed to load subjects.");
            }
        };
        fetchSubjects();
    }, [selectedCourse, selectedSem, token]);

    /* ================= FETCH REPORT ================= */
    useEffect(() => {
        if (!isSelectionComplete) {
            setReportData([]);
            return;
        }

        const fetchReport = async () => {
            try {
                setLoading(true);
                const res = await api.get(
                    `/api/marks/subject-report?course=${selectedCourse}&sem=${selectedSem}&subject=${selectedSubject}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setReportData(res.data || []);
                setError("");
            } catch {
                setError("Failed to load report.");
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [selectedSubject, selectedCourse, selectedSem, token, isSelectionComplete]);

    /* ================= SUMMARY ================= */
    const summary = useMemo(() => {
        if (reportData.length === 0) return null;
        const totalStudents = reportData.length;
        const avg = reportData.reduce((acc, s) => acc + Number(s.total), 0) / totalStudents;
        const highest = Math.max(...reportData.map(s => Number(s.total)));
        const lowest = Math.min(...reportData.map(s => Number(s.total)));

        return { totalStudents, average: avg.toFixed(1), highest, lowest };
    }, [reportData]);

    return (
        <div className="space-y-8 sm:space-y-10 pb-10">
            {/* HEADER - Centered for Mobile */}
            <div className="text-center sm:text-left px-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                    Marks Report
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto sm:mx-0">
                    Subject-wise examination analytics and grade distribution.
                </p>
            </div>

            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-md mx-2">
                    {error}
                </div>
            )}

            {/* FILTER SECTION */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 mx-2">
                <select value={selectedCourse} onChange={(e) => { setSelectedCourse(e.target.value); setSelectedSem(""); setSelectedSubject(""); setReportData([]); }}
                        className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-1 focus:ring-gray-400 transition">
                    <option value="">Select Course</option>
                    {courses.map(c => <option key={c.id} value={c.course_code}>{c.course_name}</option>)}
                </select>

                <select value={selectedSem} onChange={(e) => { setSelectedSem(e.target.value); setSelectedSubject(""); setReportData([]); }} disabled={!selectedCourse}
                        className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-1 focus:ring-gray-400 transition disabled:opacity-50">
                    <option value="">Select {semLabel}</option>
                    {semesterOptions.map(num => <option key={num} value={num}>{semLabel} {num}</option>)}
                </select>

                <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} disabled={!selectedSem}
                        className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-1 focus:ring-gray-400 transition disabled:opacity-50">
                    <option value="">Select Subject</option>
                    {subjects.map(sub => <option key={sub.subjectcode} value={sub.subjectcode}>{sub.subjectname}</option>)}
                </select>
            </div>

            {isSelectionComplete ? (
                <div className="px-2 space-y-6">
                    {/* SUMMARY CARDS */}
                    {summary && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                            {[
                                { label: "Students", value: summary.totalStudents },
                                { label: "Average", value: summary.average },
                                { label: "Highest", value: summary.highest },
                                { label: "Lowest", value: summary.lowest }
                            ].map((item, index) => (
                                <div key={index} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-center sm:text-left">
                                    <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold mb-1">{item.label}</p>
                                    <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* REPORT TABLE */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
                        <div className="w-full overflow-x-auto">
                            <table className="w-full table-auto text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-2 sm:px-6 py-4 text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">Student</th>
                                    <th className="px-1 sm:px-4 py-4 text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 text-center">Theory</th>
                                    <th className="px-1 sm:px-4 py-4 text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 text-center">Pract.</th>
                                    <th className="px-2 sm:px-4 py-4 text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 text-center hidden sm:table-cell">Total</th>
                                    <th className="px-2 sm:px-6 py-4 text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 text-center">Grade</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center text-gray-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                                <span className="text-xs">Processing Analytics...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : reportData.length === 0 ? (
                                    <tr><td colSpan="5" className="py-12 text-center text-gray-400 text-sm">No data found.</td></tr>
                                ) : (
                                    reportData.map(student => (
                                        <tr key={student.rollnumber} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-2 sm:px-6 py-4">
                                                <div className="font-semibold text-gray-900 dark:text-gray-100 text-[13px] sm:text-sm truncate max-w-[120px] sm:max-w-none">{student.name}</div>
                                                <div className="text-[10px] text-gray-500 font-mono mt-0.5">{student.rollnumber}</div>
                                            </td>
                                            <td className="px-1 sm:px-4 py-4 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium">{student.theorymarks}</td>
                                            <td className="px-1 sm:px-4 py-4 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium">{student.practicalmarks}</td>
                                            <td className="px-2 sm:px-4 py-4 text-center text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 hidden sm:table-cell">{student.total}</td>
                                            <td className="px-2 sm:px-6 py-4 text-center">
                                                    <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-[10px] sm:text-xs font-black uppercase">
                                                        {student.grade}
                                                    </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                /* PROFESSIONAL EMPTY STATE */
                <div className="mx-2 flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/20">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-sm mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                        </svg>
                    </div>
                    <h3 className="text-gray-900 dark:text-gray-100 font-semibold text-sm">Marks Analytics</h3>
                    <p className="text-gray-400 text-xs mt-1 text-center">Select course details to generate the performance report.</p>
                </div>
            )}
        </div>
    );
};

export default MarksReport;