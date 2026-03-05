import { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const PrintMarksheet = () => {

    const token = localStorage.getItem("token");

    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);

    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedSem, setSelectedSem] = useState("");
    const [selectedRoll, setSelectedRoll] = useState("");

    const [marksheet, setMarksheet] = useState(null);
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
                setCourses([]);
            }
        };

        fetchCourses();

    }, []);

    /* ================= COURSE OBJECT ================= */

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

    /* ================= LOAD STUDENTS ================= */

    useEffect(() => {

        if (!selectedCourse || !selectedSem) return;

        const fetchStudents = async () => {

            try {

                const res = await api.get(
                    `/api/marks/students?course=${selectedCourse}&sem=${selectedSem}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                setStudents(res.data || []);

            } catch {
                setStudents([]);
            }

        };

        fetchStudents();

    }, [selectedCourse, selectedSem]);

    /* ================= LOAD MARKSHEET ================= */

    const loadMarksheet = async () => {

        if (!selectedCourse || !selectedSem || !selectedRoll) {
            setError("Please select course, semester and student.");
            return;
        }

        try {

            const res = await api.get(
                `/api/marks/student-marks?course=${selectedCourse}&sem=${selectedSem}&roll=${selectedRoll}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMarksheet(res.data);
            setError("");

        } catch {
            setError("Failed to load marksheet.");
        }

    };

    /* ================= GRADE FUNCTION ================= */

    const getGrade = (percentage) => {

        if (percentage >= 90) return "O";
        if (percentage >= 80) return "A+";
        if (percentage >= 70) return "A";
        if (percentage >= 60) return "B+";
        if (percentage >= 50) return "B";
        if (percentage >= 40) return "C";
        return "F";

    };

    /* ================= DOWNLOAD PDF ================= */

    const downloadPDF = async () => {

        const element = document.getElementById("marksheet");

        if (!element) return;

        const canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: "#ffffff",
            useCORS: true
        });

        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");

        const width = 210;
        const height = (canvas.height * width) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, width, height);

        pdf.save(`marksheet-${selectedRoll}.pdf`);

    };

    /* ================= MOBILE DIRECT DOWNLOAD ================= */

    const mobileDownload = async () => {

        if (!selectedCourse || !selectedSem || !selectedRoll) {
            setError("Please select course, semester and student.");
            return;
        }

        try {

            const res = await api.get(
                `/api/marks/student-marks?course=${selectedCourse}&sem=${selectedSem}&roll=${selectedRoll}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMarksheet(res.data);

            setTimeout(() => {
                downloadPDF();
            }, 300);

        } catch {
            setError("Failed to download marksheet.");
        }

    };

    return (

        <div>

            <h2>Student Marksheet</h2>

            {error && <p>{error}</p>}

            {/* ================= FILTERS ================= */}

            <div>

                {/* COURSE */}

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

                {/* SEMESTER */}

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

                {/* STUDENT */}

                <select
                    value={selectedRoll}
                    onChange={(e) => setSelectedRoll(e.target.value)}
                >

                    <option value="">Select Student</option>

                    {students.map(s => (
                        <option key={s.rollnumber} value={s.rollnumber}>
                            {s.rollnumber} - {s.firstname} {s.lastname}
                        </option>
                    ))}

                </select>

                {/* DESKTOP LOAD */}

                <button
                    onClick={loadMarksheet}
                    className="hidden md:inline"
                >
                    Load Marksheet
                </button>

                {/* MOBILE DIRECT DOWNLOAD */}

                <button
                    onClick={mobileDownload}
                    className="md:hidden"
                >
                    Download Marksheet
                </button>

            </div>

            {/* ================= MARKSHEET PREVIEW ================= */}

            {marksheet && (

                <div>

                    <button onClick={downloadPDF}>
                        Download PDF
                    </button>

                    <div
                        id="marksheet"
                        style={{
                            width: "800px",
                            background: "white",
                            color: "black",
                            padding: "20px"
                        }}
                    >

                        <h3>{marksheet.collegeName}</h3>

                        {/* STUDENT INFO */}

                        <p>
                            Name: {marksheet.marks[0].firstname} {marksheet.marks[0].lastname}
                        </p>

                        <p>
                            Roll: {marksheet.marks[0].rollnumber}
                        </p>

                        <p>
                            Course: {marksheet.marks[0].courcecode}
                        </p>

                        <p>
                            {semLabel}: {selectedSem}
                        </p>

                        {/* PROFILE PHOTO */}

                        <img
                            src={`${api.defaults.baseURL}/uploads/students/${marksheet.marks[0].profilepic || "default.png"}`}
                            alt="student"
                            width="96"
                            height="96"
                            crossOrigin="anonymous"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `${api.defaults.baseURL}/uploads/students/default.png`;
                            }}
                        />

                        {/* MARKS TABLE */}

                        <table border="1" width="100%">

                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Code</th>
                                <th>Subject</th>
                                <th>Theory</th>
                                <th>Practical</th>
                                <th>Total</th>
                                <th>Grade</th>
                            </tr>
                            </thead>

                            <tbody>

                            {marksheet.marks.map((m, i) => {

                                const theory = m.theorymarks || 0;
                                const practical = m.practicalmarks || 0;

                                const theoryFull = m.theoryfull || 0;
                                const practicalFull = m.practicalfull || 0;

                                const total = theory + practical;
                                const maxTotal = theoryFull + practicalFull;

                                const percentage =
                                    maxTotal ? (total / maxTotal) * 100 : 0;

                                const grade = getGrade(percentage);

                                return (

                                    <tr key={i}>

                                        <td>{i + 1}</td>

                                        <td>{m.subjectcode}</td>

                                        <td>{m.subjectname}</td>

                                        <td>{theory}/{theoryFull}</td>

                                        <td>{practical}/{practicalFull}</td>

                                        <td>{total}/{maxTotal}</td>

                                        <td>{grade}</td>

                                    </tr>

                                );

                            })}

                            </tbody>

                        </table>

                    </div>

                </div>

            )}

        </div>

    );

};

export default PrintMarksheet;