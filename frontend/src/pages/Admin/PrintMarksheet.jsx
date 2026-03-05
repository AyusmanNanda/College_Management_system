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

    return (

        <div className="p-6">

            {/* PAGE TITLE */}

            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                Student Marksheet
            </h2>

            {error && (
                <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
                    {error}
                </div>
            )}

            {/* ================= FILTER CARD ================= */}

            <div className="bg-white shadow-md rounded-xl p-6 mb-6">

                <div className="grid md:grid-cols-4 gap-4">

                    {/* COURSE */}

                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="border rounded-lg px-3 py-2"
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
                        className="border rounded-lg px-3 py-2"
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
                        className="border rounded-lg px-3 py-2"
                    >
                        <option value="">Select Student</option>

                        {students.map(s => (
                            <option key={s.rollnumber} value={s.rollnumber}>
                                {s.rollnumber} - {s.firstname} {s.lastname}
                            </option>
                        ))}
                    </select>

                    {/* LOAD */}

                    <button
                        onClick={loadMarksheet}
                        className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
                    >
                        Load Marksheet
                    </button>

                </div>

            </div>

            {/* ================= MARKSHEET ================= */}

            {marksheet && (

                <div className="bg-white shadow-md rounded-xl p-6">

                    {/* DOWNLOAD BUTTON */}

                    <div className="flex justify-end mb-4">

                        <button
                            onClick={downloadPDF}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                            Download PDF
                        </button>

                    </div>

                    {/* MARKSHEET PREVIEW */}

                    <div
                        id="marksheet"
                        className="bg-white text-black p-6 max-w-4xl mx-auto border"
                    >

                        <h2 className="text-center text-xl font-bold mb-4">
                            {marksheet.collegeName}
                        </h2>

                        {/* STUDENT HEADER */}

                        <div className="flex justify-between mb-6">

                            <div className="space-y-1">

                                <p>
                                    <b>Name:</b>{" "}
                                    {marksheet.marks[0].firstname}{" "}
                                    {marksheet.marks[0].lastname}
                                </p>

                                <p>
                                    <b>Roll:</b> {marksheet.marks[0].rollnumber}
                                </p>

                                <p>
                                    <b>Course:</b> {marksheet.marks[0].courcecode}
                                </p>

                                <p>
                                    <b>{semLabel}:</b> {selectedSem}
                                </p>

                            </div>

                            {/* PHOTO */}

                            <img
                                src={`${api.defaults.baseURL}/uploads/students/${marksheet.marks[0].profilepic || "default.png"}`}
                                alt="student"
                                className="w-24 h-24 object-cover border"
                                crossOrigin="anonymous"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `${api.defaults.baseURL}/uploads/students/default.png`;
                                }}
                            />

                        </div>

                        {/* MARKS TABLE */}

                        <table className="w-full border text-sm">

                            <thead className="bg-gray-100">

                            <tr>
                                <th className="border p-2">#</th>
                                <th className="border p-2">Code</th>
                                <th className="border p-2">Subject</th>
                                <th className="border p-2">Theory</th>
                                <th className="border p-2">Practical</th>
                                <th className="border p-2">Total</th>
                                <th className="border p-2">Grade</th>
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

                                    <tr key={i} className="text-center">

                                        <td className="border p-2">{i + 1}</td>

                                        <td className="border p-2">{m.subjectcode}</td>

                                        <td className="border p-2">{m.subjectname}</td>

                                        <td className="border p-2">
                                            {theory}/{theoryFull}
                                        </td>

                                        <td className="border p-2">
                                            {practical}/{practicalFull}
                                        </td>

                                        <td className="border p-2">
                                            {total}/{maxTotal}
                                        </td>

                                        <td className="border p-2 font-semibold">
                                            {grade}
                                        </td>

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