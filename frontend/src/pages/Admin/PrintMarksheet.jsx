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

    const marksheetCode = `MS-${selectedCourse}-${selectedSem}-${selectedRoll}`;

    return (

        <div className="space-y-10 p-6">

            {/* HEADER */}

            <div>

                <h2 className="text-2xl font-semibold text-gray-800">
                    Student Marksheet
                </h2>

                <p className="text-sm text-gray-500 mt-2">
                    Generate and download semester marksheets.
                </p>

            </div>

            {/* FILTERS */}

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">

                <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
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
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                    <option value="">Select {semLabel}</option>

                    {semesterOptions.map(num => (

                        <option key={num} value={num}>
                            {semLabel} {num}
                        </option>

                    ))}

                </select>

                <select
                    value={selectedRoll}
                    onChange={(e) => setSelectedRoll(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                    <option value="">Select Student</option>

                    {students.map(s => (

                        <option key={s.rollnumber} value={s.rollnumber}>
                            {s.rollnumber} - {s.firstname} {s.lastname}
                        </option>

                    ))}

                </select>

                <button
                    onClick={loadMarksheet}
                    className="px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-black transition"
                >
                    Load Marksheet
                </button>

            </div>

            {error && (

                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">
                    {error}
                </div>

            )}

            {/* ================= MARKSHEET ================= */}

            {marksheet && (

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">

                    <div className="flex justify-end mb-6">

                        <button
                            onClick={downloadPDF}
                            className="px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-black transition"
                        >
                            Download PDF
                        </button>

                    </div>

                    <div
                        id="marksheet"
                        className="bg-white text-black p-12 mx-auto border border-gray-400"
                        style={{ width: "794px" }}
                    >

                        {/* HEADER */}

                        <div className="text-center border-b border-gray-400 pb-4 mb-6">

                            <img
                                src={
                                    marksheet?.collegeLogo
                                        ? `${api.defaults.baseURL}${marksheet.collegeLogo}`
                                        : `${api.defaults.baseURL}/uploads/admin/default.png`
                                }
                                alt="college logo"
                                className="h-24 mx-auto mb-2"
                                crossOrigin="anonymous"
                            />

                            <h1 className="text-2xl font-bold uppercase tracking-wide">
                                {marksheet?.collegeName}
                            </h1>

                            <p className="text-sm font-semibold uppercase mt-1">
                                Statement of Marks
                            </p>

                            <p className="text-sm text-gray-700">
                                {semLabel} Examination – {selectedSem}
                            </p>

                            <p className="text-xs mt-1 text-gray-600">
                                Marksheet No: {marksheetCode}
                            </p>

                        </div>

                        {/* STUDENT INFO */}

                        <div className="grid grid-cols-3 gap-6 mb-8 items-center">

                            <div className="col-span-2">

                                <table className="w-full text-sm border border-gray-400">

                                    <tbody>

                                    <tr>
                                        <td className="border p-2 bg-gray-100 font-semibold w-40">
                                            Student Name
                                        </td>
                                        <td className="border p-2">
                                            {marksheet?.marks?.[0]?.firstname} {marksheet?.marks?.[0]?.lastname}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="border p-2 bg-gray-100 font-semibold">
                                            Roll Number
                                        </td>
                                        <td className="border p-2">
                                            {marksheet?.marks?.[0]?.rollnumber}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="border p-2 bg-gray-100 font-semibold">
                                            Course Code
                                        </td>
                                        <td className="border p-2">
                                            {marksheet?.marks?.[0]?.courcecode}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="border p-2 bg-gray-100 font-semibold">
                                            {semLabel}
                                        </td>
                                        <td className="border p-2">
                                            {selectedSem}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="border p-2 bg-gray-100 font-semibold">
                                            Issue Date
                                        </td>
                                        <td className="border p-2">
                                            {new Date().toLocaleDateString()}
                                        </td>
                                    </tr>

                                    </tbody>

                                </table>

                            </div>

                            {/* PHOTO + TEXT SEAL */}

                            <div className="flex justify-center">

                                <div className="relative w-44 h-44 flex items-center justify-center">

                                    <svg viewBox="0 0 200 200" className="absolute w-full h-full">

                                        <defs>

                                            <path
                                                id="sealCircle"
                                                d="M100 100 m -80 0 a 80 80 0 1 1 160 0 a 80 80 0 1 1 -160 0"
                                            />

                                        </defs>

                                        <text
                                            fontSize="11"
                                            fontWeight="bold"
                                            letterSpacing="2"
                                            fill="#111"
                                        >

                                            <textPath href="#sealCircle">

                                                {marksheet?.collegeName?.toUpperCase()} • {marksheetCode} •

                                            </textPath>

                                        </text>

                                    </svg>

                                    <img
                                        src={`${api.defaults.baseURL}/uploads/students/${marksheet?.marks?.[0]?.profilepic}`}
                                        alt="student"
                                        className="w-32 h-40 object-cover border-2 border-gray-700 bg-white"
                                        crossOrigin="anonymous"
                                        onError={(e) => {

                                            e.currentTarget.onerror = null;

                                            e.currentTarget.src =
                                                `${api.defaults.baseURL}/uploads/students/default.png`;

                                        }}
                                    />

                                </div>

                            </div>

                        </div>

                        {/* MARKS TABLE */}

                        <table className="w-full border border-gray-400 text-sm mb-6">

                            <thead>

                            <tr className="bg-gray-200 text-center font-semibold">

                                <th className="border p-2">#</th>
                                <th className="border p-2">Code</th>
                                <th className="border p-2 text-left">Subject</th>
                                <th className="border p-2">Theory</th>
                                <th className="border p-2">Practical</th>
                                <th className="border p-2">Total</th>
                                <th className="border p-2">Grade</th>

                            </tr>

                            </thead>

                            <tbody>

                            {marksheet?.marks?.map((m, i) => {

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
                                        <td className="border p-2 text-left">{m.subjectname}</td>
                                        <td className="border p-2">{theory}/{theoryFull}</td>
                                        <td className="border p-2">{practical}/{practicalFull}</td>
                                        <td className="border p-2 font-semibold">{total}/{maxTotal}</td>
                                        <td className="border p-2 font-bold">{grade}</td>

                                    </tr>

                                );

                            })}

                            </tbody>

                        </table>

                        {/* FOOTER */}

                        <div className="text-xs text-center text-gray-600">
                            This is a computer-generated statement of marks. No signature is required.
                        </div>

                    </div>

                </div>

            )}

        </div>

    );

};

export default PrintMarksheet;