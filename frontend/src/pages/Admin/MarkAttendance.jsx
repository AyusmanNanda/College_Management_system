import { useEffect, useState } from "react";
import api from "../../utils/api";

const MarkAttendance = () => {
    const token = localStorage.getItem("token");

    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);

    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedSem, setSelectedSem] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedDate, setSelectedDate] = useState("");

    const [markMode, setMarkMode] = useState("absent");
    const [checkedStudents, setCheckedStudents] = useState({});

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

    /* ================= FETCH STUDENTS ================= */

    const fetchStudents = async () => {
        if (!selectedCourse || !selectedSem) return;

        try {
            setLoading(true);
            const res = await api.get(
                `/api/attendance/students?course=${selectedCourse}&sem=${selectedSem}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStudents(res.data || []);
            setCheckedStudents({});
        } catch {
            setError("Failed to load students.");
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
            fetchStudents();
        } else {
            setSubjects([]);
            setStudents([]);
        }
    }, [selectedCourse, selectedSem]);

    /* ================= HANDLE CHECK ================= */

    const toggleStudent = (roll) => {
        setCheckedStudents(prev => ({
            ...prev,
            [roll]: !prev[roll]
        }));
    };

    /* ================= SAVE ATTENDANCE ================= */

    const handleSave = async () => {
        if (!selectedSubject || !selectedDate) {
            setError("Select subject and date.");
            return;
        }

        const records = students.map(student => {
            const isChecked = checkedStudents[student.rollnumber];

            let present;

            if (markMode === "absent") {
                present = isChecked ? 0 : 1;
            } else {
                present = isChecked ? 1 : 0;
            }

            return {
                rollnumber: student.rollnumber,
                present
            };
        });

        try {
            setLoading(true);

            await api.post(
                "/api/attendance",
                {
                    subjectcode: selectedSubject,
                    date: selectedDate,
                    courcecode: selectedCourse,
                    semoryear: selectedSem,
                    records
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("Attendance saved successfully.");
            setCheckedStudents({});
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save attendance.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10">

            <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                    Mark Attendance
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Subject-wise attendance marking.
                </p>
            </div>

            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-md">
                    {error}
                </div>
            )}

            {/* FILTER SECTION */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

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
                    onChange={(e) => setSelectedSem(e.target.value)}
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

                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
                />
            </div>

            {/* MARK MODE */}
            <div className="flex items-center gap-6 text-sm">
                <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        value="absent"
                        checked={markMode === "absent"}
                        onChange={() => setMarkMode("absent")}
                    />
                    Mark Absentees
                </label>

                <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        value="present"
                        checked={markMode === "present"}
                        onChange={() => setMarkMode("present")}
                    />
                    Mark Present Students
                </label>
            </div>

            {/* STUDENT TABLE */}
            <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
                        <tr>
                            <th className="p-4">Roll No</th>
                            <th className="p-4">Name</th>
                            <th className="p-4 text-center">
                                {markMode === "absent" ? "Absent" : "Present"}
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {students.map(student => (
                            <tr key={student.rollnumber} className="border-t dark:border-gray-700">
                                <td className="p-4">{student.rollnumber}</td>
                                <td className="p-4">
                                    {student.firstname} {student.lastname}
                                </td>
                                <td className="p-4 text-center">
                                    <input
                                        type="checkbox"
                                        checked={!!checkedStudents[student.rollnumber]}
                                        onChange={() => toggleStudent(student.rollnumber)}
                                    />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-black transition"
                >
                    {loading ? "Saving..." : "Save Attendance"}
                </button>
            </div>

        </div>
    );
};

export default MarkAttendance;