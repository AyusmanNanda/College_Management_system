import { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import MarksheetLayout from "./MarksheetLayout";

const PrintMarksheet = () => {

    const token = localStorage.getItem("token");

    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);

    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedSem, setSelectedSem] = useState("");
    const [selectedRoll, setSelectedRoll] = useState("");

    const [marksheet, setMarksheet] = useState(null);
    const [error, setError] = useState("");

    const [hash, setHash] = useState("");

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

    const verificationUrl =
        `${window.location.origin}/verify/marksheet/${marksheetCode}`;

    const summary = marksheet?.summary;

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

                    <MarksheetLayout
                        marksheet={marksheet}
                        semLabel={semLabel}
                        selectedSem={selectedSem}
                        marksheetCode={marksheetCode}
                        verificationUrl={verificationUrl}
                        summary={summary}
                        hash={hash}
                        courseDisplay={courseDisplay}
                        getGrade={getGrade}
                    />

                </div>

            )}

        </div>

    );

};

export default PrintMarksheet;