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

    // Load Courses
    useEffect(() => {

        const loadCourses = async () => {

            const res = await api.get("/api/courses", {
                headers: { Authorization: `Bearer ${token}` }
            });

            setCourses(res.data);

        };

        loadCourses();

    }, []);

    // Handle Course Change
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

    // Load Students
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

    // Load Marksheet
    const loadMarksheet = async () => {

        const res = await api.get(
            `/api/marks/student-marks?course=${course}&sem=${sem}&roll=${roll}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        if (res.data.length > 0) {
            setName(res.data[0].firstname + " " + res.data[0].lastname);
        }

        setData(res.data);

    };

    // PDF Download
    const downloadPDF = async () => {

        const element = document.getElementById("marksheet");

        const canvas = await html2canvas(element);

        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");

        const imgWidth = 190;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);

        pdf.save(`marksheet_${roll}.pdf`);

    };

    // Total Marks
    const totalObtained = data.reduce(
        (sum, r) => sum + (r.theorymarks || 0) + (r.practicalmarks || 0),
        0
    );

    const totalFull = data.reduce(
        (sum, r) => sum + (r.theoryfull || 0) + (r.practicalfull || 0),
        0
    );

    const percentage = totalFull ? (totalObtained / totalFull) * 100 : 0;

    // Final Grade
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

            <select value={course} onChange={(e) => handleCourseChange(e.target.value)}>
                <option value="">Select Course</option>
                {courses.map(c => (
                    <option key={c.course_code} value={c.course_code}>
                        {c.course_name}
                    </option>
                ))}
            </select>

            <select value={sem} onChange={(e) => setSem(e.target.value)}>
                <option value="">Select Semester</option>
                {sems.map(s => (
                    <option key={s} value={s}>{s}</option>
                ))}
            </select>

            <select value={roll} onChange={(e) => setRoll(e.target.value)}>
                <option value="">Select Student</option>
                {students.map(s => (
                    <option key={s.rollnumber} value={s.rollnumber}>
                        {s.rollnumber} - {s.firstname} {s.lastname}
                    </option>
                ))}
            </select>

            <button onClick={loadMarksheet}>Load Marksheet</button>
            <button onClick={downloadPDF}>Download PDF</button>

            <br /><br />

            <div id="marksheet">

                <h2>ABC College</h2>
                <h3>Semester Marksheet</h3>

                <p><b>Name:</b> {name}</p>
                <p><b>Roll Number:</b> {roll}</p>
                <p><b>Course:</b> {course}</p>
                <p><b>Semester:</b> {sem}</p>

                <table border="1" width="100%">

                    <thead>
                    <tr>
                        <th>Subject Code</th>
                        <th>Subject</th>
                        <th>Theory</th>
                        <th>Practical</th>
                        <th>Total</th>
                        <th>Grade</th>
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
                                <td>{row.subjectcode}</td>
                                <td>{row.subjectname}</td>
                                <td>{theory} / {theoryFull}</td>
                                <td>{practical} / {practicalFull}</td>
                                <td>{total} / {totalFullMarks}</td>
                                <td>{grade}</td>
                            </tr>

                        );

                    })}

                    </tbody>

                </table>

                <br />

                <h3>Total Marks: {totalObtained} / {totalFull}</h3>
                <h3>Percentage: {percentage.toFixed(2)}%</h3>
                <h3>Final Grade: {finalGrade}</h3>

                <br /><br />

                <p>Generated On: {new Date().toLocaleDateString()}</p>

                <div style={{ textAlign: "right", marginTop: "40px" }}>
                    __________________________
                    <br />
                    Authorized by
                    <br />
                    College Administration
                </div>

            </div>

        </div>

    );

};

export default PrintMarksheet;