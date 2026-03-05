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

    const getGrade = (percentage) => {

        if (percentage >= 90) return "O";
        if (percentage >= 80) return "A+";
        if (percentage >= 70) return "A";
        if (percentage >= 60) return "B+";
        if (percentage >= 50) return "B";
        if (percentage >= 40) return "C";

        return "F";

    };

    const downloadPDF = async () => {

        const element = document.getElementById("marksheet");

        const canvas = await html2canvas(element, {
            scale: 3,
            backgroundColor: "#ffffff",
            useCORS: true
        });

        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");

        pdf.addImage(imgData, "PNG", 0, 0, 210, 297);

        pdf.save(`marksheet-${selectedRoll}.pdf`);

    };

    const marksheetCode = `MS-${selectedCourse}-${selectedSem}-${selectedRoll}`;
    const summary = marksheet?.summary;

    const [hash, setHash] = useState("");

    useEffect(() => {

        const generateHash = async () => {

            if (!marksheet?.marks) return;

            const dataString = JSON.stringify({
                course: selectedCourse,
                semester: selectedSem,
                roll: selectedRoll,
                marks: marksheet.marks
            });

            const encoder = new TextEncoder();
            const data = encoder.encode(dataString);

            const hashBuffer = await crypto.subtle.digest("SHA-256", data);

            const hashArray = Array.from(new Uint8Array(hashBuffer));

            const hashHex = hashArray
                .map(b => b.toString(16).padStart(2, "0"))
                .join("");

            setHash(hashHex);

        };

        generateHash();

    }, [marksheet]);

    const courseDisplay = useMemo(() => {

        if (!marksheet?.marks?.length) return "";

        const code = marksheet.marks[0].courcecode;

        const course = courses.find(c => c.course_code === code);

        if (!course) return code;

        return `${course.course_name} (${code})`;

    }, [marksheet, courses]);
    return (

        <div className="space-y-10 p-6">

            <div>

                <h2 className="text-2xl font-semibold text-gray-800">
                    Student Marksheet
                </h2>

                <p className="text-sm text-gray-500 mt-2">
                    Generate and download semester marksheets.
                </p>

            </div>

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
                        className="bg-white text-black mx-auto border border-gray-400 flex flex-col"
                        style={{ width: "794px", height: "1123px", padding: "48px" }}
                    >

                        {/* HEADER */}

                        <div className="text-center border-b border-gray-500 pb-5 mb-8">

                            <img
                                src={
                                    marksheet?.collegeLogo
                                        ? `${api.defaults.baseURL}${marksheet.collegeLogo}`
                                        : `${api.defaults.baseURL}/uploads/admin/default.png`
                                }
                                alt="college logo"
                                className="h-14 mx-auto mb-2"
                                crossOrigin="anonymous"
                            />

                            <h1 className="text-[22px] font-bold uppercase tracking-wide">
                                {marksheet?.collegeName}
                            </h1>

                            <p className="text-[12px] uppercase tracking-wider font-semibold mt-1">
                                Statement of Marks – {semLabel} Examination {selectedSem}
                            </p>

                            <p className="text-[11px] text-gray-600 mt-1">
                                Marksheet No: <span className="font-semibold">{marksheetCode}</span>
                            </p>

                        </div>
                        <div className="flex-1 flex flex-col justify-center">

                        {/* STUDENT INFO */}

                        <div className="grid grid-cols-3 gap-6 mb-8 items-start">

                            <div className="col-span-2">

                                <table className="w-full text-sm border border-gray-400">

                                    <tbody>

                                    <tr>
                                        <td className="border px-3 py-2 bg-gray-100 font-semibold w-40">
                                            Student Name
                                        </td>
                                        <td className="border px-3 py-2">
                                            {marksheet?.marks?.[0]?.firstname} {marksheet?.marks?.[0]?.lastname}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="border px-3 py-2 bg-gray-100 font-semibold">
                                            Roll Number
                                        </td>
                                        <td className="border px-3 py-2">
                                            {marksheet?.marks?.[0]?.rollnumber}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="border px-3 py-2 bg-gray-100 font-semibold">
                                            Course
                                        </td>
                                        <td className="border px-3 py-2">
                                            {courseDisplay}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="border px-3 py-2 bg-gray-100 font-semibold">
                                            {semLabel}
                                        </td>
                                        <td className="border px-3 py-2">
                                            {selectedSem}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="border px-3 py-2 bg-gray-100 font-semibold">
                                            Issue Date
                                        </td>
                                        <td className="border px-3 py-2">
                                            {new Date().toLocaleDateString()}
                                        </td>
                                    </tr>

                                    </tbody>

                                </table>

                            </div>

                            {/* PHOTO + TEXT SEAL */}

                            <div className="flex justify-center items-start pt-2">

                                <div className="relative w-[180px] h-[180px] flex items-center justify-center">

                                    <svg viewBox="0 0 200 200" className="absolute w-full h-full">

                                        <defs>

                                            <path
                                                id="sealCircle"
                                                d="M100 100 m -80 0 a 80 80 0 1 1 160 0 a 80 80 0 1 1 -160 0"
                                            />

                                        </defs>

                                        <text
                                            fontSize="12"
                                            fontWeight="700"
                                            letterSpacing="3"
                                            fill="#111"
                                        >

                                            <textPath
                                                href="#sealCircle"
                                                startOffset="50%"
                                                textAnchor="middle"
                                            >

                                                {marksheet?.collegeName?.toUpperCase()} • {marksheetCode} •

                                            </textPath>

                                        </text>

                                    </svg>

                                    <img
                                        src={`${api.defaults.baseURL}/uploads/students/${marksheet?.marks?.[0]?.profilepic}`}
                                        alt="student"
                                        className="w-[120px] h-[150px] object-cover border-2 border-gray-700 bg-white"
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

                                <th className="border px-3 py-2">#</th>
                                <th className="border px-3 py-2">Code</th>
                                <th className="border px-3 py-2 text-left">Subject</th>
                                <th className="border px-3 py-2">Theory</th>
                                <th className="border px-3 py-2">Practical</th>
                                <th className="border px-3 py-2">Total</th>
                                <th className="border px-3 py-2">Grade</th>

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

                                        <td className="border px-3 py-2">{i + 1}</td>
                                        <td className="border px-3 py-2">{m.subjectcode}</td>
                                        <td className="border px-3 py-2 text-left">{m.subjectname}</td>
                                        <td className="border px-3 py-2">{theory}/{theoryFull}</td>
                                        <td className="border px-3 py-2">{practical}/{practicalFull}</td>
                                        <td className="border px-3 py-2 font-semibold">{total}/{maxTotal}</td>
                                        <td className="border px-3 py-2 font-bold">
                                            {grade}
                                        </td>

                                    </tr>

                                );

                            })}

                            </tbody>

                        </table>
                        {/* SUMMARY */}

                        {summary && (

                            <div className="mt-6 border border-gray-400">

                                <table className="w-full text-sm">

                                    <tbody>

                                    <tr className="bg-gray-100 text-center font-semibold">

                                        <td className="border px-3 py-2">Total Marks</td>
                                        <td className="border px-3 py-2">Percentage</td>
                                        <td className="border px-3 py-2">Final Grade</td>
                                        <td className="border px-3 py-2">Division</td>
                                        <td className="border px-3 py-2">Result</td>

                                    </tr>

                                    <tr className="text-center font-semibold">

                                        <td className="border px-3 py-3">
                                            {summary.totalObtained} / {summary.totalMaximum}
                                        </td>

                                        <td className="border px-3 py-3">
                                            {summary.percentage}%
                                        </td>

                                        <td className="border px-3 py-3">
                                            {summary.finalGrade}
                                        </td>

                                        <td className="border px-3 py-3">
                                            {summary.division}
                                        </td>

                                        <td
                                            className={`border px-3 py-3 font-bold ${
                                                summary.result.includes("FAIL")
                                                    ? "text-red-700"
                                                    : summary.result.includes("DISTINCTION")
                                                        ? "text-blue-700"
                                                        : "text-green-700"
                                            }`}
                                        >
                                            {summary.result}
                                        </td>

                                    </tr>

                                    </tbody>

                                </table>

                            </div>

                        )}
                        </div>
                        <div className="mt-12 pt-6 border-t border-gray-400 text-xs">

                            <div className="grid grid-cols-3 items-end">

                                {/* LEFT */}

                                <div className="space-y-1">

                                    <p>
                                        <span className="font-semibold">Issue Date:</span>{" "}
                                        {new Date().toLocaleDateString()}
                                    </p>

                                    <p>
                                        <span className="font-semibold">Marksheet ID:</span>{" "}
                                        {marksheetCode}
                                    </p>

                                </div>

                                {/* CENTER */}

                                <div className="text-center text-gray-600 px-4">

                                    This is a digitally generated marksheet.
                                    The integrity of this document can be verified
                                    using the SHA256 hash printed below.

                                </div>

                                {/* SIGNATURE */}

                                <div className="text-center">

                                    <div className="h-12"></div>

                                    <div className="border-t border-gray-600 w-40 mx-auto pt-1">

                                        <p className="font-semibold">
                                            Controller of Examination
                                        </p>

                                    </div>

                                </div>

                            </div>

                            {/* HASH */}

                            <div className="mt-6 text-center text-[10px] break-all text-gray-600">

                                <span className="font-semibold">SHA256:</span>{" "}
                                {hash}

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

};

export default PrintMarksheet;