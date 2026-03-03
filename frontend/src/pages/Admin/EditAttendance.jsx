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

    const semLabel = selectedCourseObj?.sem_or_year || "Semester";

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
        <div style={{ padding: 20 }}>
            <h2>Edit Attendance</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}

            <div style={{ marginBottom: 20 }}>

                <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                    <option value="">Select Course</option>
                    {courses.map(course => (
                        <option key={course.id} value={course.course_code}>
                            {course.course_name}
                        </option>
                    ))}
                </select>

                <select value={selectedSem} onChange={(e) => setSelectedSem(e.target.value)}>
                    <option value="">Select {semLabel}</option>
                    {semesterOptions.map(num => (
                        <option key={num} value={num}>
                            {semLabel} {num}
                        </option>
                    ))}
                </select>

                <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                    <option value="">Select Subject</option>
                    {subjects.map(sub => (
                        <option key={sub.subjectcode} value={sub.subjectcode}>
                            {sub.subjectname}
                        </option>
                    ))}
                </select>

                <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
                    <option value="">Select Date</option>
                    {attendanceDates.map(d => (
                        <option key={d.date} value={d.date}>
                            {d.date}
                        </option>
                    ))}
                </select>

            </div>

            {selectedDate && (
                <>
                    <table border="1" cellPadding="5">
                        <thead>
                        <tr>
                            <th>Roll No</th>
                            <th>Name</th>
                            <th>Present</th>
                        </tr>
                        </thead>
                        <tbody>
                        {students.map(student => (
                            <tr key={student.student_id}>
                                <td>{student.rollnumber}</td>
                                <td>{student.firstname} {student.lastname}</td>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={!!checkedStudents[student.student_id]}
                                        onChange={() => toggleStudent(student.student_id)}
                                    />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <br />

                    <button onClick={updateAttendance}>Update</button>
                    <button onClick={deleteAttendance} style={{ marginLeft: 10 }}>
                        Delete
                    </button>
                </>
            )}
        </div>
    );
};

export default EditAttendance;