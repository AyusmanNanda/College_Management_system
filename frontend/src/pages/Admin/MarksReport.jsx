import { useEffect, useState } from "react";
import api from "../../utils/api";

const MarksReport = () => {

    const token = localStorage.getItem("token");

    const [courses, setCourses] = useState([]);
    const [sems, setSems] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [data, setData] = useState([]);

    const [course, setCourse] = useState("");
    const [sem, setSem] = useState("");
    const [subject, setSubject] = useState("");

    // =============================
    // Load Courses
    // =============================

    useEffect(() => {

        const loadCourses = async () => {

            try {

                const res = await api.get("/api/courses", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setCourses(res.data);

            } catch (error) {

                console.error("Error loading courses", error);

            }

        };

        loadCourses();

    }, []);

    // =============================
    // Handle Course Change
    // =============================

    const handleCourseChange = (value) => {

        setCourse(value);
        setSem("");
        setSubject("");
        setSubjects([]);
        setData([]);

        const selected = courses.find(c => c.course_code === value);

        if (!selected) return;

        const arr = [];

        for (let i = 1; i <= selected.total_semesters; i++) {
            arr.push(i);
        }

        setSems(arr);

    };

    // =============================
    // Load Subjects
    // =============================

    useEffect(() => {

        if (!course || !sem) return;

        const loadSubjects = async () => {

            try {

                const res = await api.get(
                    `/api/marks/subjects?course=${course}&sem=${sem}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setSubjects(res.data);

            } catch (error) {

                console.error("Error loading subjects", error);

            }

        };

        loadSubjects();

    }, [course, sem]);

    // =============================
    // Load Subject Report
    // =============================

    const loadReport = async () => {

        if (!course || !sem || !subject) return;

        try {

            const res = await api.get(
                `/api/marks/subject-report?course=${course}&sem=${sem}&subject=${subject}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setData(res.data);

        } catch (error) {

            console.error("Error loading report", error);

        }

    };

    return (

        <div>

            <h2>Subject Wise Marks Report</h2>

            <div>

                {/* Course */}

                <select
                    value={course}
                    onChange={(e) => handleCourseChange(e.target.value)}
                >
                    <option value="">Select Course</option>

                    {courses.map(c => (
                        <option key={c.course_code} value={c.course_code}>
                            {c.course_name}
                        </option>
                    ))}

                </select>

                {/* Semester */}

                <select
                    value={sem}
                    onChange={(e) => {
                        setSem(e.target.value);
                        setSubject("");
                        setData([]);
                    }}
                >
                    <option value="">Select Semester</option>

                    {sems.map(s => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}

                </select>

                {/* Subject */}

                <select
                    value={subject}
                    onChange={(e) => {
                        setSubject(e.target.value);
                        setData([]);
                    }}
                >
                    <option value="">Select Subject</option>

                    {subjects.map(s => (
                        <option key={s.subjectcode} value={s.subjectcode}>
                            {s.subjectname}
                        </option>
                    ))}

                </select>

                <button onClick={loadReport}>
                    Load Report
                </button>

            </div>

            <br />

            {/* Report Table */}

            <table border="1">

                <thead>
                <tr>
                    <th>Roll</th>
                    <th>Name</th>
                    <th>Theory</th>
                    <th>Practical</th>
                    <th>Total</th>
                    <th>Grade</th>
                </tr>
                </thead>

                <tbody>

                {data.map((row, i) => (

                    <tr key={i}>
                        <td>{row.rollnumber}</td>
                        <td>{row.name}</td>
                        <td>{row.theorymarks}</td>
                        <td>{row.practicalmarks}</td>
                        <td>{row.total}</td>
                        <td>{row.grade}</td>
                    </tr>

                ))}

                </tbody>

            </table>

        </div>

    );

};

export default MarksReport;