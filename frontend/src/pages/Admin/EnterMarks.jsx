import { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";
import ConfirmSaveModal from "./ConfirmSaveModal";

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

    const [showSaveModal, setShowSaveModal] = useState(false);

    /* ================= UX HELPERS ================= */

    const handleEnterMove = (e) => {

        if (e.key === "Enter") {

            e.preventDefault();

            const table = e.target.closest("table");
            const inputs = table.querySelectorAll("input[type='number']");
            const index = Array.from(inputs).indexOf(e.target);

            if (inputs[index + 1]) {
                inputs[index + 1].focus();
                inputs[index + 1].select();
            }

        }

        if (e.key === "ArrowDown") {

            const table = e.target.closest("table");
            const inputs = table.querySelectorAll("input[type='number']");
            const index = Array.from(inputs).indexOf(e.target);

            if (inputs[index + 1]) {
                inputs[index + 1].focus();
            }

        }

        if (e.key === "ArrowUp") {

            const table = e.target.closest("table");
            const inputs = table.querySelectorAll("input[type='number']");
            const index = Array.from(inputs).indexOf(e.target);

            if (inputs[index - 1]) {
                inputs[index - 1].focus();
            }

        }

    };

    const handleFocus = (e) => {
        e.target.select();
    };

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
        <div className="space-y-10">

            <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                    Enter Marks
                </h2>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Enter student marks for the selected subject.
                </p>
            </div>

            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-md">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm rounded-md">
                    {success}
                </div>
            )}

            {/* FILTER CARD */}

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">

                <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
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
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
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
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
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

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">

                    <div className="w-full overflow-x-auto">

                        <table className="w-full text-xs sm:text-sm text-left">

                            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wide">

                            <tr>
                                <th className="px-4 py-3">Student</th>
                                <th className="px-4 py-3">Theory</th>

                                {subjectDetails?.practicalmarks > 0 && (
                                    <th className="px-4 py-3">Practical</th>
                                )}

                            </tr>

                            </thead>

                            <tbody>

                            {students.map(student => (

                                <tr
                                    key={student.rollnumber}
                                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                                >

                                    <td className="px-4 py-3 dark:text-gray-200">

                                        <div className="flex flex-col">

                                            <span className="font-medium">
                                                {student.firstname} {student.lastname}
                                            </span>

                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {student.rollnumber}
                                            </span>

                                        </div>

                                    </td>

                                    <td className="px-4 py-3">

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
                                            onKeyDown={handleEnterMove}
                                            onFocus={handleFocus}
                                            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm focus:ring-2 focus:ring-gray-500 outline-none"
                                        />

                                    </td>

                                    {subjectDetails?.practicalmarks > 0 && (

                                        <td className="px-4 py-3">

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
                                                onKeyDown={handleEnterMove}
                                                onFocus={handleFocus}
                                                className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm focus:ring-2 focus:ring-gray-500 outline-none"
                                            />

                                        </td>

                                    )}

                                </tr>

                            ))}

                            </tbody>

                        </table>

                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end">

                        <button
                            onClick={() => setShowSaveModal(true)}
                            className="w-full sm:w-auto px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-black transition"
                        >
                            Save Marks
                        </button>

                    </div>

                </div>

            )}

            <ConfirmSaveModal
                show={showSaveModal}
                title="Confirm Marks Save"
                message="Are you sure you want to save marks for this subject?"
                confirmText="Save Marks"
                onCancel={() => setShowSaveModal(false)}
                onConfirm={saveMarks}
            />

        </div>
    );
};

export default EnterMarks;