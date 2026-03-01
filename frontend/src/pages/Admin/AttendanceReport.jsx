import { useEffect, useState } from "react";
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

    const fetchSubjects = async (course, sem) => {
        try {
            const res = await api.get(
                `/api/subjects?course_code=${course}&sem=${sem}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSubjects(res.data || []);
        } catch {
            setError("Failed to load subjects.");
        }
    };

    /* ================= FETCH REPORT ================= */

    const fetchReport = async () => {
        if (!selectedSubject) return;

        try {
            setLoading(true);
            const res = await api.get(
                `/api/attendance/report?course=${selectedCourse}&sem=${selectedSem}&subject=${selectedSubject}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setReportData(res.data || []);
        } catch {
            setError("Failed to load report.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchCourses();
    }, [token]);

    useEffect(() => {
        if (selectedCourse && selectedSem) {
            fetchSubjects(selectedCourse, selectedSem);
        } else {
            setSubjects([]);
        }
    }, [selectedCourse, selectedSem]);

    useEffect(() => {
        if (selectedSubject) {
            fetchReport();
        } else {
            setReportData([]);
        }
    }, [selectedSubject]);

    return (
        <div className="space-y-10">

            <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                    Attendance Report
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    View subject-wise attendance percentage.
                </p>
            </div>

            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-md">
                    {error}
                </div>
            )}

            {/* FILTER SECTION */}
            <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">

                <select
                    value={selectedCourse}
                    onChange={(e) => {
                        setSelectedCourse(e.target.value);
                        setSelectedSem("");
                        setSelectedSubject("");
                    }}
                    className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
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
                    }}
                    disabled={!selectedCourse}
                    className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
                >
                    <option value="">Select Semester</option>
                    {selectedCourse &&
                        Array.from({ length: 8 }, (_, i) => i + 1).map(sem => (
                            <option key={sem} value={sem}>
                                Semester {sem}
                            </option>
                        ))}
                </select>

                <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    disabled={!selectedSem}
                    className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
                >
                    <option value="">Select Subject</option>
                    {subjects.map(sub => (
                        <option key={sub.subjectcode} value={sub.subjectcode}>
                            {sub.subjectname}
                        </option>
                    ))}
                </select>

            </div>

            {/* REPORT TABLE */}
            <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
                        <tr>
                            <th className="p-4">Roll No</th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Total Classes</th>
                            <th className="p-4">Present</th>
                            <th className="p-4">Percentage</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="p-6 text-center">
                                    Loading...
                                </td>
                            </tr>
                        ) : reportData.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-6 text-center text-gray-500">
                                    No report data available.
                                </td>
                            </tr>
                        ) : (
                            reportData.map(student => (
                                <tr key={student.rollnumber} className="border-t dark:border-gray-700">
                                    <td className="p-4">{student.rollnumber}</td>
                                    <td className="p-4">{student.name}</td>
                                    <td className="p-4">{student.total_classes}</td>
                                    <td className="p-4">{student.present_count}</td>
                                    <td className="p-4 font-semibold">
                                        {student.percentage}%
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default AttendanceReport;