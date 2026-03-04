import { useEffect, useState } from "react";
import api from "../../utils/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const PrintMarksheet = () => {

    const token = localStorage.getItem("token");

    const [courses, setCourses] = useState([]);
    const [sems, setSems] = useState([]);
    const [students, setStudents] = useState([]);

    const [course, setCourse] = useState("");
    const [sem, setSem] = useState("");
    const [roll, setRoll] = useState("");

    const [data, setData] = useState([]);
    const [name, setName] = useState("");
    const [collegeName, setCollegeName] = useState("");

    // =========================
    // Load Courses
    // =========================
    useEffect(() => {

        const loadCourses = async () => {

            const res = await api.get("/api/courses", {
                headers: { Authorization: `Bearer ${token}` }
            });

            setCourses(res.data);

        };

        loadCourses();

    }, []);

    // =========================
    // Handle Course Change
    // =========================
    const handleCourseChange = (value) => {

        setCourse(value);
        setSem("");
        setRoll("");
        setStudents([]);

        const selected = courses.find(c => c.course_code === value);

        if (!selected) return;

        const arr = [];

        for (let i = 1; i <= selected.total_semesters; i++) {
            arr.push(i);
        }

        setSems(arr);

    };

    // =========================
    // Load Students
    // =========================
    useEffect(() => {

        if (!course || !sem) return;

        const loadStudents = async () => {

            const res = await api.get(
                `/api/marks/students?course=${course}&sem=${sem}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setStudents(res.data);

        };

        loadStudents();

    }, [course, sem]);

    // =========================
    // Load Marksheet
    // =========================
    const loadMarksheet = async () => {

        const res = await api.get(
            `/api/marks/student-marks?course=${course}&sem=${sem}&roll=${roll}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        setCollegeName(res.data.collegeName);
        setData(res.data.marks);

        if (res.data.marks.length > 0) {
            setName(
                res.data.marks[0].firstname +
                " " +
                res.data.marks[0].lastname
            );
        }

    };

    // =========================
    // Download PDF
    // =========================
    const downloadPDF = async () => {

        const element = document.getElementById("marksheet");

        const canvas = await html2canvas(element, {
            scale: 2
        });

        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");

        const imgWidth = 190;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);

        pdf.save(`marksheet_${roll}.pdf`);

    };

    // =========================
    // Calculate Totals
    // =========================
    const totalObtained = data.reduce(
        (sum, r) => sum + (r.theorymarks || 0) + (r.practicalmarks || 0),
        0
    );

    const totalFull = data.reduce(
        (sum, r) => sum + (r.theoryfull || 0) + (r.practicalfull || 0),
        0
    );

    const percentage = totalFull ? (totalObtained / totalFull) * 100 : 0;

    // =========================
    // Final Grade
    // =========================
    let finalGrade = "F";

    if (percentage >= 90) finalGrade = "O";
    else if (percentage >= 80) finalGrade = "A+";
    else if (percentage >= 70) finalGrade = "A";
    else if (percentage >= 60) finalGrade = "B+";
    else if (percentage >= 50) finalGrade = "B";
    else if (percentage >= 40) finalGrade = "C";

    return (

        <div>

            <h2>Print Marksheet</h2>

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
                onChange={(e) => setSem(e.target.value)}
            >
                <option value="">Select Semester</option>

                {sems.map(s => (
                    <option key={s} value={s}>
                        {s}
                    </option>
                ))}
            </select>

            {/* Student */}
            <select
                value={roll}
                onChange={(e) => setRoll(e.target.value)}
            >
                <option value="">Select Student</option>

                {students.map(s => (
                    <option key={s.rollnumber} value={s.rollnumber}>
                        {s.rollnumber} - {s.firstname} {s.lastname}
                    </option>
                ))}
            </select>

            <button onClick={loadMarksheet}>
                Load Marksheet
            </button>

            <button onClick={downloadPDF}>
                Download PDF
            </button>

            <br /><br />

            {/* ========================= */}
            {/* MARKSHEET */}
            {/* ========================= */}

            <div
                id="marksheet"
                style={{
                    width: "210mm",
                    minHeight: "297mm",
                    margin: "auto",
                    padding: "20mm",
                    background: "white",
                    color: "black",
                    fontFamily: "Arial, sans-serif",
                    boxSizing: "border-box"
                }}
            >

                {/* Header */}

                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <h1 style={{ margin: 0 }}>{collegeName}</h1>
                    <h3 style={{ margin: "5px 0" }}>Semester Marksheet</h3>
                </div>

                {/* Student Info */}

                <div style={{ marginBottom: "20px" }}>
                    <p><b>Name:</b> {name}</p>
                    <p><b>Roll Number:</b> {roll}</p>
                    <p><b>Course:</b> {course}</p>
                    <p><b>Semester:</b> {sem}</p>
                </div>

                {/* Marks Table */}

                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        marginTop: "10px"
                    }}
                >

                    <thead>

                    <tr>
                        <th style={{border:"1px solid black",padding:"6px"}}>Subject Code</th>
                        <th style={{border:"1px solid black",padding:"6px"}}>Subject</th>
                        <th style={{border:"1px solid black",padding:"6px"}}>Theory</th>
                        <th style={{border:"1px solid black",padding:"6px"}}>Practical</th>
                        <th style={{border:"1px solid black",padding:"6px"}}>Total</th>
                        <th style={{border:"1px solid black",padding:"6px"}}>Grade</th>
                    </tr>

                    </thead>

                    <tbody>

                    {data.map((row, i) => {

                        const theory = row.theorymarks || 0;
                        const practical = row.practicalmarks || 0;

                        const theoryFull = row.theoryfull || 0;
                        const practicalFull = row.practicalfull || 0;

                        const total = theory + practical;
                        const totalFullMarks = theoryFull + practicalFull;

                        const percent = totalFullMarks
                            ? (total / totalFullMarks) * 100
                            : 0;

                        let grade = "F";

                        if (percent >= 90) grade = "O";
                        else if (percent >= 80) grade = "A+";
                        else if (percent >= 70) grade = "A";
                        else if (percent >= 60) grade = "B+";
                        else if (percent >= 50) grade = "B";
                        else if (percent >= 40) grade = "C";

                        return (

                            <tr key={i}>

                                <td style={{border:"1px solid black",padding:"6px"}}>
                                    {row.subjectcode}
                                </td>

                                <td style={{border:"1px solid black",padding:"6px"}}>
                                    {row.subjectname}
                                </td>

                                <td style={{border:"1px solid black",padding:"6px"}}>
                                    {theory} / {theoryFull}
                                </td>

                                <td style={{border:"1px solid black",padding:"6px"}}>
                                    {practical} / {practicalFull}
                                </td>

                                <td style={{border:"1px solid black",padding:"6px"}}>
                                    {total} / {totalFullMarks}
                                </td>

                                <td style={{border:"1px solid black",padding:"6px"}}>
                                    {grade}
                                </td>

                            </tr>

                        );

                    })}

                    </tbody>

                </table>

                <br />

                {/* Summary */}

                <h3>Total Marks: {totalObtained} / {totalFull}</h3>
                <h3>Percentage: {percentage.toFixed(2)}%</h3>
                <h3>Final Grade: {finalGrade}</h3>

                <br /><br />

                {/* Footer */}

                <div
                    style={{
                        marginTop: "40px",
                        display: "flex",
                        justifyContent: "space-between"
                    }}
                >

                    <div>
                        <p>Generated On: {new Date().toLocaleDateString()}</p>
                    </div>

                    <div style={{ textAlign: "center" }}>
                        __________________________
                        <br />
                        Authorized by
                        <br />
                        College Administration
                    </div>

                </div>

            </div>

        </div>

    );

};

export default PrintMarksheet;