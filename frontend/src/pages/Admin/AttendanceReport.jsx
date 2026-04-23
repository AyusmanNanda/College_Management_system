import { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";

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

    /* ================= FETCH DATA LOGIC ================= */
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
        <div className="space-y-8 sm:space-y-10 pb-10">
            {/* HEADER - Centered for Mobile */}
            <div className="text-center sm:text-left px-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                    Attendance Report
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto sm:mx-0">
                    Track subject-wise student attendance and performance trends.
                </p>
            </div>

            {error && <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-md mx-2">{error}</div>}

            {/* FILTERS */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 mx-2">
                <select value={selectedCourse} onChange={(e) => { setSelectedCourse(e.target.value); setSelectedSem(""); setSelectedSubject(""); }}
                        className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-1 focus:ring-gray-400 transition">
                    <option value="">Select Course</option>
                    {courses.map(c => <option key={c.id} value={c.course_code}>{c.course_name}</option>)}
                </select>

                <select value={selectedSem} onChange={(e) => { setSelectedSem(e.target.value); setSelectedSubject(""); }} disabled={!selectedCourse}
                        className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-1 focus:ring-gray-400 transition disabled:opacity-50">
                    <option value="">Select {semLabel}</option>
                    {semesterOptions.map(num => <option key={num} value={num}>{semLabel} {num}</option>)}
                </select>

                <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} disabled={!selectedSem}
                        className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-1 focus:ring-gray-400 transition disabled:opacity-50">
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s.subjectcode} value={s.subjectcode}>{s.subjectname}</option>)}
                </select>
            </div>

            {isSelectionComplete ? (
                <div className="px-2 space-y-6">
                    {/* SUMMARY */}
                    {summary && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { label: "Students", value: summary.totalStudents },
                                { label: "Classes", value: summary.totalClasses },
                                { label: "Average", value: `${summary.average}%` },
                                { label: "Below 75%", value: summary.below75, danger: summary.below75 > 0 }
                            ].map((item, idx) => (
                                <div key={idx} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-center sm:text-left">
                                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">{item.label}</p>
                                    <p className={`text-xl font-black ${item.danger ? "text-red-600" : "text-gray-900 dark:text-gray-100"}`}>{item.value}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* OPTIMIZED TABLE */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
                        <div className="w-full overflow-x-auto">
                            <table className="w-full table-auto text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-2 sm:px-6 py-4 text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">Student</th>
                                    <th className="px-1 sm:px-4 py-4 text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 text-center">Total</th>
                                    <th className="px-1 sm:px-4 py-4 text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 text-center">Pres.</th>
                                    <th className="px-2 sm:px-6 py-4 text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 text-center">%</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {loading ? (
                                    <tr><td colSpan="4" className="py-20 text-center text-gray-400">Loading...</td></tr>
                                ) : reportData.map(student => {
                                    const low = Number(student.percentage) < 75;
                                    return (
                                        <tr key={student.rollnumber} className={`transition-colors ${low ? "bg-red-50/40 dark:bg-red-900/10" : ""}`}>
                                            <td className="px-2 sm:px-6 py-4">
                                                <div className="font-semibold text-gray-900 dark:text-gray-100 text-[13px] sm:text-sm truncate max-w-[120px] sm:max-w-none">{student.name}</div>
                                                <div className="text-[10px] text-gray-500 font-mono mt-0.5">{student.rollnumber}</div>
                                            </td>
                                            <td className="px-1 sm:px-4 py-4 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">{student.total_classes}</td>
                                            <td className="px-1 sm:px-4 py-4 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">{student.present_count}</td>
                                            <td className={`px-2 sm:px-6 py-4 text-center text-xs sm:text-sm font-bold ${low ? "text-red-600" : "text-green-600 dark:text-green-400"}`}>
                                                {student.percentage}%
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mx-2 flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/20">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-sm mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <h3 className="text-gray-900 dark:text-gray-100 font-semibold text-sm">No Report Generated</h3>
                    <p className="text-gray-400 text-xs mt-1 text-center">Pick a subject to view attendance details.</p>
                </div>
            )}
        </div>
    );
};

export default AttendanceReport;