import { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";

const EnterMarks = () => {

    const token = localStorage.getItem("token");

    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);

    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedSem, setSelectedSem] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");

    const [subjectDetails, setSubjectDetails] = useState(null);

    const [marks, setMarks] = useState({});

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

    /* ================= SEM / YEAR OPTIONS ================= */

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

    /* ================= LOAD SUBJECTS ================= */

    useEffect(() => {

        if (!selectedCourse || !selectedSem) return;

        const loadSubjects = async () => {

            try {

                const res = await api.get(
                    `/api/subjects?course_code=${selectedCourse}&sem=${selectedSem}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                setSubjects(res.data || []);
                setStudents([]);
                setMarks({});
                setSelectedSubject("");
                setSubjectDetails(null);
                setError("");
                setSuccess("");

            } catch {

                setError("Failed to load subjects.");

            }

        };

        loadSubjects();

    }, [selectedCourse, selectedSem]);

    /* ================= SUBJECT SELECT ================= */

    const handleSubjectChange = async (code) => {

        setSelectedSubject(code);

        const subject = subjects.find(
            s => s.subjectcode === code
        );

        setSubjectDetails(subject);

        try {

            const res = await api.get(
                `/api/marks/students?course=${selectedCourse}&sem=${selectedSem}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setStudents(res.data || []);

        } catch {

            setError("Failed to load students.");

        }

    };

    /* ================= HANDLE MARK CHANGE ================= */

    const handleMarkChange = (roll, field, value) => {

        setMarks(prev => ({
            ...prev,
            [roll]: {
                ...prev[roll],
                [field]: value
            }
        }));

    };

    /* ================= SAVE MARKS ================= */

    const saveMarks = async () => {

        if (!selectedSubject) {
            setError("Select subject first.");
            return;
        }

        if (subjectDetails) {

            const maxTheory = subjectDetails.theorymarks;
            const maxPractical = subjectDetails.practicalmarks;

            for (const roll in marks) {

                const theory = Number(marks[roll]?.theory || 0);
                const practical = Number(marks[roll]?.practical || 0);

                if (theory > maxTheory) {
                    setError(`Theory marks cannot exceed ${maxTheory}`);
                    return;
                }

                if (practical > maxPractical) {
                    setError(`Practical marks cannot exceed ${maxPractical}`);
                    return;
                }

            }

        }

        try {

            const records = students.map(student => ({
                rollnumber: student.rollnumber,
                theorymarks: marks[student.rollnumber]?.theory || 0,
                practicalmarks: marks[student.rollnumber]?.practical || 0
            }));

            await api.post(
                "/api/marks/save",
                {
                    course: selectedCourse,
                    sem: Number(selectedSem),
                    subject: selectedSubject,
                    subjectname: subjectDetails?.subjectname,
                    marks: records
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccess("Marks saved successfully.");
            setError("");

        } catch {

            setError("Failed to save marks.");

        }

    };

    return (
        <div>

            <h2>Enter Marks</h2>

            {error && <p>{error}</p>}
            {success && <p>{success}</p>}

            <div>

                <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
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
                    onChange={(e) => handleSubjectChange(e.target.value)}
                >
                    <option value="">Select Subject</option>

                    {subjects.map(sub => (
                        <option key={sub.subjectcode} value={sub.subjectcode}>
                            {sub.subjectname}
                        </option>
                    ))}

                </select>

            </div>

            {selectedSubject && students.length > 0 && (

                <table border="1">

                    <thead>
                    <tr>
                        <th>Roll</th>
                        <th>Name</th>
                        <th>Theory</th>

                        {subjectDetails?.practicalmarks > 0 && (
                            <th>Practical</th>
                        )}

                    </tr>
                    </thead>

                    <tbody>

                    {students.map(student => (

                        <tr key={student.rollnumber}>

                            <td>{student.rollnumber}</td>

                            <td>
                                {student.firstname} {student.lastname}
                            </td>

                            <td>
                                <input
                                    type="number"
                                    max={subjectDetails?.theorymarks}
                                    value={marks[student.rollnumber]?.theory || ""}
                                    onChange={(e) =>
                                        handleMarkChange(
                                            student.rollnumber,
                                            "theory",
                                            e.target.value
                                        )
                                    }
                                />
                            </td>

                            {subjectDetails?.practicalmarks > 0 && (

                                <td>
                                    <input
                                        type="number"
                                        max={subjectDetails?.practicalmarks}
                                        value={marks[student.rollnumber]?.practical || ""}
                                        onChange={(e) =>
                                            handleMarkChange(
                                                student.rollnumber,
                                                "practical",
                                                e.target.value
                                            )
                                        }
                                    />
                                </td>

                            )}

                        </tr>

                    ))}

                    </tbody>

                </table>

            )}

            {students.length > 0 && (
                <button onClick={saveMarks}>
                    Save Marks
                </button>
            )}

        </div>
    );
};

export default EnterMarks;