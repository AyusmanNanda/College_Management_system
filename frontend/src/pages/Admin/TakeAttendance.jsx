import { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";

const TakeAttendance = () => {
    const token = localStorage.getItem("token");

    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [existingDates, setExistingDates] = useState([]);

    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedSem, setSelectedSem] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedDate, setSelectedDate] = useState("");

    const [markMode, setMarkMode] = useState("present");
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
    }, []);

    /* ================= DERIVED SEM/YEAR OPTIONS ================= */

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
                setCheckedStudents({});
                setExistingDates([]);
                setError("");
                setSuccess("");

            } catch {
                setError("Failed to load subjects or students.");
            }
        };

        loadData();
    }, [selectedCourse, selectedSem]);

    /* ================= FETCH EXISTING DATES ================= */

    useEffect(() => {
        if (!selectedSubject) return;

        const fetchDates = async () => {
            try {
                const res = await api.get(
                    `/api/attendance/dates?subjectcode=${selectedSubject}&courcecode=${selectedCourse}&semoryear=${selectedSem}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setExistingDates(res.data.map(d => d.date));
            } catch {
                setExistingDates([]);
            }
        };

        fetchDates();
    }, [selectedSubject, selectedCourse, selectedSem]);

    /* ================= TOGGLE ================= */

    const toggleStudent = (id) => {
        setCheckedStudents(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    /* ================= SAVE ================= */

    const saveAttendance = async () => {
        if (!selectedSubject || !selectedDate) {
            setError("Select subject and date.");
            return;
        }

        if (existingDates.includes(selectedDate)) {
            setError("Attendance already exists for this date.");
            return;
        }

        try {
            const records = students.map(student => {
                const isChecked = !!checkedStudents[student.student_id];

                return {
                    student_id: student.student_id,
                    present:
                        markMode === "present"
                            ? (isChecked ? 1 : 0)
                            : (isChecked ? 0 : 1)
                };
            });

            await api.post(
                "/api/attendance",
                {
                    subjectcode: selectedSubject,
                    date: selectedDate,
                    courcecode: selectedCourse,
                    semoryear: Number(selectedSem),
                    records
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccess("Attendance saved successfully.");
            setError("");
            setCheckedStudents({});

        } catch {
            setError("Failed to save attendance.");
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Take Attendance</h2>

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

                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />

                <select value={markMode} onChange={(e) => setMarkMode(e.target.value)}>
                    <option value="present">Mark Present</option>
                    <option value="absent">Mark Absent</option>
                </select>
            </div>

            <table border="1" cellPadding="5">
                <thead>
                <tr>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>{markMode === "present" ? "Present" : "Absent"}</th>
                </tr>
                </thead>
                <tbody>
                {students.length === 0 ? (
                    <tr>
                        <td colSpan="3">No students loaded</td>
                    </tr>
                ) : (
                    students.map(student => (
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
                    ))
                )}
                </tbody>
            </table>

            <br />

            <button onClick={saveAttendance}>
                Save Attendance
            </button>
        </div>
    );
};

export default TakeAttendance;