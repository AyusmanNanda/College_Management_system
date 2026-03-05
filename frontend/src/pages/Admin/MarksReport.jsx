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

    /* ================= DERIVED SEM OPTIONS ================= */

    const selectedCourseObj = useMemo(() => {
        return courses.find(c => c.course_code === selectedCourse);
    }, [courses, selectedCourse]);

    const semesterOptions = useMemo(() => {

        if (!selectedCourseObj) return [];

        return Array.from(
            { length: Number(selectedCourseObj.total_semesters) },
            (_, i) => i + 1
        );

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
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
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

        if (!selectedSubject) {
            setReportData([]);
            return;
        }

        const fetchReport = async () => {

            try {

                setLoading(true);

                const res = await api.get(
                    `/api/marks/subject-report?course=${selectedCourse}&sem=${selectedSem}&subject=${selectedSubject}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setReportData(res.data || []);

            } catch {

                setError("Failed to load report.");

            } finally {

                setLoading(false);

            }

        };

        fetchReport();

    }, [selectedSubject, selectedCourse, selectedSem, token]);

    /* ================= SUMMARY ================= */

    const summary = useMemo(() => {

        if (reportData.length === 0) return null;

        const totalStudents = reportData.length;

        const avg =
            reportData.reduce((acc, s) => acc + Number(s.total), 0) /
            totalStudents;

        const highest = Math.max(...reportData.map(s => Number(s.total)));
        const lowest = Math.min(...reportData.map(s => Number(s.total)));

        return {
            totalStudents,
            average: avg.toFixed(2),
            highest,
            lowest
        };

    }, [reportData]);

    return (
        <div className="space-y-10">

            {/* HEADER */}

            <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                    Marks Report
                </h2>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Subject-wise marks analytics.
                </p>
            </div>

            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-md">
                    {error}
                </div>
            )}

            {/* FILTER CARD */}

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">

                <select
                    value={selectedCourse}
                    onChange={(e) => {
                        setSelectedCourse(e.target.value);
                        setSelectedSem("");
                        setSelectedSubject("");
                        setReportData([]);
                    }}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
                >
                    <option value="">Select Course</option>

                    {courses.map(course => (
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
                        setReportData([]);
                    }}
                    disabled={!selectedCourse}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
                >
                    <option value="">Select Semester</option>

                    {semesterOptions.map(sem => (
                        <option key={sem} value={sem}>
                            Semester {sem}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    disabled={!selectedSem}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
                >
                    <option value="">Select Subject</option>

                    {subjects.map(sub => (
                        <option key={sub.subjectcode} value={sub.subjectcode}>
                            {sub.subjectname}
                        </option>
                    ))}
                </select>

            </div>

            {/* SUMMARY */}

            {summary && (

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                    {[
                        { label: "Students", value: summary.totalStudents },
                        { label: "Average Marks", value: summary.average },
                        { label: "Highest", value: summary.highest },
                        { label: "Lowest", value: summary.lowest }
                    ].map((item, index) => (

                        <div
                            key={index}
                            className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
                        >

                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {item.label}
                            </p>

                            <p className="text-lg sm:text-xl font-semibold dark:text-gray-100">
                                {item.value}
                            </p>

                        </div>

                    ))}

                </div>

            )}

            {/* REPORT TABLE */}

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-x-auto">

                <table className="w-full text-xs sm:text-sm text-left">

                    <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wide">

                    <tr>

                        <th className="px-2 sm:px-4 py-3 w-[35%]">
                            Student
                        </th>

                        <th className="px-2 sm:px-4 py-3 text-center w-[16%]">
                            Theory
                            <br />
                            <span className="text-[11px] normal-case text-gray-500">
                                {reportData[0]?.theoryfull ?? "-"}
                            </span>
                        </th>

                        <th className="px-2 sm:px-4 py-3 text-center w-[16%]">
                            Practical
                            <br />
                            <span className="text-[11px] normal-case text-gray-500">
                                {reportData[0]?.practicalfull ?? "-"}
                            </span>
                        </th>

                        <th className="px-2 sm:px-4 py-3 text-center hidden sm:table-cell w-[16%]">
                            Total
                            <br />
                            <span className="text-[11px] normal-case text-gray-500">
                                {reportData[0]?.maxtotal ?? "-"}
                            </span>
                        </th>

                        <th className="px-2 sm:px-4 py-3 text-center w-[17%]">
                            Grade
                        </th>

                    </tr>

                    </thead>

                    <tbody>

                    {loading ? (

                        <tr>
                            <td colSpan="5" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                Loading...
                            </td>
                        </tr>

                    ) : reportData.length === 0 ? (

                        <tr>
                            <td colSpan="5" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                No report data available.
                            </td>
                        </tr>

                    ) : (

                        reportData.map(student => (

                            <tr
                                key={student.rollnumber}
                                className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                            >

                                <td className="px-2 sm:px-4 py-3">

                                    <div className="font-medium text-sm dark:text-gray-200 leading-tight">
                                        {student.rollnumber}
                                    </div>

                                    <div className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
                                        {student.name}
                                    </div>

                                </td>

                                <td className="px-2 sm:px-4 py-3 text-center dark:text-gray-200">
                                    {student.theorymarks}
                                </td>

                                <td className="px-2 sm:px-4 py-3 text-center dark:text-gray-200">
                                    {student.practicalmarks}
                                </td>

                                <td className="px-2 sm:px-4 py-3 text-center font-semibold dark:text-gray-100 hidden sm:table-cell">
                                    {student.total}
                                </td>

                                <td className="px-2 sm:px-4 py-3 text-center font-semibold dark:text-gray-100">
                                    {student.grade}
                                </td>

                            </tr>

                        ))

                    )}

                    </tbody>

                </table>

            </div>

        </div>
    );
};

export default MarksReport;