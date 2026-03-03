import { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";

const EditAttendance = () => {
    const token = localStorage.getItem("token");

    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [attendanceDates, setAttendanceDates] = useState([]);

    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedSem, setSelectedSem] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedDate, setSelectedDate] = useState("");

    const [checkedStudents, setCheckedStudents] = useState({});
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    /* ================= FETCH COURSES ================= */

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await api.get("/api/courses", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCourses(res.data || []);
            } catch {
                setCourses([]);
            }
        };
        fetchCourses();
    }, [token]);

    /* ================= DERIVED SEM OPTIONS ================= */

    const selectedCourseObj = useMemo(() => {
        return courses.find(c => c.course_code === selectedCourse);
    }, [courses, selectedCourse]);

    const semLabel =
        selectedCourseObj?.sem_or_year?.toLowerCase() === "year"
            ? "Year"
            : "Semester";

    const semesterOptions = useMemo(() => {
        if (!selectedCourseObj) return [];
        const total = Number(selectedCourseObj.total_semesters);
        return Array.from({ length: total }, (_, i) => i + 1);
    }, [selectedCourseObj]);

    /* ================= FETCH SUBJECTS + STUDENTS ================= */

    useEffect(() => {
        if (!selectedCourse || !selectedSem) return;

        const loadData = async () => {
            try {
                const [subRes, stuRes] = await Promise.all([
                    api.get(
                        `/api/subjects?course_code=${selectedCourse}&sem=${selectedSem}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    ),
                    api.get(
                        `/api/attendance/students?course=${selectedCourse}&sem=${selectedSem}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    )
                ]);

                setSubjects(subRes.data || []);
                setStudents(stuRes.data || []);

                setSelectedSubject("");
                setSelectedDate("");
                setAttendanceDates([]);
                setCheckedStudents({});
                setError("");
                setSuccess("");

            } catch {
                setError("Failed to load subjects or students.");
            }
        };

        loadData();
    }, [selectedCourse, selectedSem, token]);

    /* ================= FETCH EXISTING DATES ================= */

    useEffect(() => {
        if (!selectedSubject) return;

        const fetchDates = async () => {
            try {
                const res = await api.get(
                    `/api/attendance/dates?subjectcode=${selectedSubject}&courcecode=${selectedCourse}&semoryear=${selectedSem}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // 🔥 CRITICAL FIX: Convert ISO → raw YYYY-MM-DD
                const formattedDates = (res.data || []).map(d => ({
                    date: String(d.date).slice(0, 10)
                }));

                setAttendanceDates(formattedDates);
                setSelectedDate("");
                setCheckedStudents({});
                setError("");
                setSuccess("");

            } catch {
                setAttendanceDates([]);
            }
        };

        fetchDates();
    }, [selectedSubject, selectedCourse, selectedSem, token]);

    /* ================= LOAD ATTENDANCE ================= */

    useEffect(() => {
        if (!selectedCourse || !selectedSem || !selectedSubject || !selectedDate) return;
        if (students.length === 0) return;

        const loadAttendance = async () => {
            try {
                const res = await api.get(
                    `/api/attendance?subjectcode=${selectedSubject}&date=${selectedDate}&courcecode=${selectedCourse}&semoryear=${selectedSem}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const map = {};

                // Initialize all as absent
                students.forEach(student => {
                    map[Number(student.student_id)] = false;
                });

                // Apply DB values
                res.data.forEach(record => {
                    const id = Number(record.student_id);
                    const present = Number(record.present);
                    map[id] = present === 1;
                });

                setCheckedStudents(map);
                setError("");

            } catch {
                setError("Failed to load attendance.");
            }
        };

        loadAttendance();

    }, [selectedCourse, selectedSem, selectedSubject, selectedDate, students, token]);

    /* ================= TOGGLE ================= */

    const toggleStudent = (id) => {
        setCheckedStudents(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    /* ================= UPDATE ================= */

    const updateAttendance = async () => {
        if (!selectedDate) {
            setError("Select a date first.");
            return;
        }

        try {
            const records = students.map(student => ({
                student_id: student.student_id,
                present: checkedStudents[student.student_id] ? 1 : 0
            }));

            await api.post(
                "/api/attendance",
                {
                    subjectcode: selectedSubject,
                    date: selectedDate, // RAW YYYY-MM-DD
                    courcecode: selectedCourse,
                    semoryear: Number(selectedSem),
                    records
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccess("Attendance updated successfully.");
            setError("");

        } catch {
            setError("Failed to update attendance.");
        }
    };

    /* ================= DELETE ================= */

    const deleteAttendance = async () => {
        if (!selectedDate) {
            setError("Select a date first.");
            return;
        }

        try {
            await api.delete("/api/attendance", {
                headers: { Authorization: `Bearer ${token}` },
                data: {
                    subjectcode: selectedSubject,
                    date: selectedDate, // RAW YYYY-MM-DD
                    courcecode: selectedCourse,
                    semoryear: Number(selectedSem)
                }
            });

            // Refetch dates after delete
            const res = await api.get(
                `/api/attendance/dates?subjectcode=${selectedSubject}&courcecode=${selectedCourse}&semoryear=${selectedSem}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const formattedDates = (res.data || []).map(d => ({
                date: String(d.date).slice(0, 10)
            }));

            setAttendanceDates(formattedDates);
            setSelectedDate("");
            setCheckedStudents({});
            setSuccess("Attendance deleted successfully.");
            setError("");

        } catch {
            setError("Failed to delete attendance.");
        }
    };

    return (
        <div className="space-y-10">

            {/* HEADER */}
            <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                    Edit Attendance
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Modify or delete previously recorded attendance.
                </p>
            </div>

            {/* ERROR / SUCCESS */}
            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-md">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm rounded-md">
                    {success}
                </div>
            )}

            {/* FILTER SECTION */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">

                <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
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
                    onChange={(e) => setSelectedSem(e.target.value)}
                    disabled={!selectedCourse}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
                >
                    <option value="">Select {semLabel}</option>
                    {semesterOptions.map(num => (
                        <option key={num} value={num}>
                            {semLabel} {num}
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

                <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    disabled={!selectedSubject}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
                >
                    <option value="">Select Date</option>
                    {attendanceDates.map(d => (
                        <option key={d.date} value={d.date}>
                            {d.date}
                        </option>
                    ))}
                </select>

            </div>

            {/* TABLE SECTION */}
            {selectedDate && (
                <>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-xs sm:text-sm text-left">

                                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3">Roll No</th>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3 text-center">Present</th>
                                </tr>
                                </thead>

                                <tbody>
                                {students.map(student => (
                                    <tr
                                        key={student.student_id}
                                        className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                                    >
                                        <td className="px-4 py-3 dark:text-gray-200">
                                            {student.rollnumber}
                                        </td>

                                        <td className="px-4 py-3 dark:text-gray-200 font-medium">
                                            {student.firstname} {student.lastname}
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={!!checkedStudents[student.student_id]}
                                                onChange={() => toggleStudent(student.student_id)}
                                                className="h-4 w-4 text-gray-900 border-gray-300 rounded focus:ring-gray-500"
                                            />
                                        </td>
                                    </tr>
                                ))}
                                </tbody>

                            </table>
                        </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex justify-end gap-3">
                        <div className="flex flex-col sm:flex-row justify-end gap-3">
                            <button
                                onClick={updateAttendance}
                                className="w-full sm:w-auto px-5 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-black transition"
                            >
                                Update Attendance
                            </button>

                            <button
                                onClick={deleteAttendance}
                                className="w-full sm:w-auto px-5 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition"
                            >
                                Delete Attendance
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default EditAttendance;