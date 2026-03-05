import { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";
import ConfirmSaveModal from "./ConfirmSaveModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

const EditMarks = () => {

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
    const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);

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

    /* ================= SEM/YEAR OPTIONS ================= */

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

    /* ================= LOAD MARKS ================= */

    const handleSubjectChange = async (code) => {

        setSelectedSubject(code);

        const subject = subjects.find(
            s => s.subjectcode === code
        );

        setSubjectDetails(subject);

        try {

            const res = await api.get(
                `/api/marks/edit?course=${selectedCourse}&sem=${selectedSem}&subject=${code}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setStudents(res.data || []);

            const existingMarks = {};

            res.data.forEach(student => {

                existingMarks[student.rollnumber] = {
                    theory: student.theorymarks || 0,
                    practical: student.practicalmarks || 0
                };

            });

            setMarks(existingMarks);

        } catch {

            setError("Failed to load marks.");

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

    /* ================= CLEAR MARKS ================= */

    const clearMarks = () => {
        setMarks({});
        setError("");
        setSuccess("");
    };

    /* ================= DELETE MARKS (STUDENT) ================= */

    const deleteMarks = async (rollnumber) => {

        try {

            await api.delete(
                "/api/marks/delete",
                {
                    headers: { Authorization: `Bearer ${token}` },
                    data: {
                        course: selectedCourse,
                        sem: selectedSem,
                        subject: selectedSubject,
                        rollnumber
                    }
                }
            );

            setStudents(prev =>
                prev.filter(s => s.rollnumber !== rollnumber)
            );

        } catch {

            setError("Failed to delete marks.");

        }

    };

    /* ================= DELETE ALL MARKS ================= */

    const deleteAllMarks = async () => {

        try {

            await api.delete(
                "/api/marks/delete-subject",
                {
                    headers: { Authorization: `Bearer ${token}` },
                    data: {
                        course: selectedCourse,
                        sem: selectedSem,
                        subject: selectedSubject
                    }
                }
            );

            setStudents([]);
            setMarks({});
            setSuccess("All marks deleted for this subject.");
            setError("");

        } catch {

            setError("Failed to delete subject marks.");

        }

    };

    /* ================= UPDATE MARKS ================= */

    const updateMarks = async () => {

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

            await api.put(
                "/api/marks/update",
                {
                    course: selectedCourse,
                    sem: Number(selectedSem),
                    subject: selectedSubject,
                    marks: records
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccess("Marks updated successfully.");
            setError("");

        } catch {

            setError("Failed to update marks.");

        }

    };

    return (
        <div className="space-y-10">

            <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                    Edit Marks
                </h2>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Update or delete student marks.
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

                                <th className="px-4 py-3 text-center hidden sm:table-cell">
                                    Action
                                </th>
                            </tr>
                            </thead>

                            <tbody>

                            {students.map(student => (

                                <tr
                                    key={student.rollnumber}
                                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                                >

                                    <td className="px-3 py-3 min-w-[140px] text-gray-800 dark:text-gray-200">

                                        <div className="flex flex-col leading-tight">

                                            <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                                {student.firstname} {student.lastname}
                                            </span>

                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {student.rollnumber}
                                            </span>

                                        </div>

                                    </td>

                                    <td className="px-3 py-3">

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
                                            className="w-12 sm:w-20 px-1 sm:px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm text-center"
                                        />

                                    </td>

                                    {subjectDetails?.practicalmarks > 0 && (

                                        <td className="px-3 py-3">

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
                                                className="w-12 sm:w-20 px-1 sm:px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm text-center"
                                            />

                                        </td>

                                    )}

                                    <td className="px-3 py-3 text-center hidden sm:table-cell">

                                        <button
                                            onClick={() => setStudentToDelete(student.rollnumber)}
                                            className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition"
                                        >
                                            Delete
                                        </button>

                                    </td>

                                </tr>

                            ))}

                            </tbody>

                        </table>

                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex flex-col sm:flex-row gap-3 justify-end">

                        <button
                            onClick={clearMarks}
                            className="w-full sm:w-auto px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                        >
                            Clear
                        </button>

                        <button
                            onClick={() => setShowDeleteAllModal(true)}
                            className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition"
                        >
                            Delete All Marks
                        </button>

                        <button
                            onClick={() => setShowSaveModal(true)}
                            className="w-full sm:w-auto px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-black transition"
                        >
                            Update Marks
                        </button>

                    </div>

                </div>

            )}

            <ConfirmSaveModal
                show={showSaveModal}
                title="Confirm Marks Update"
                message="Are you sure you want to update these marks?"
                confirmText="Update Marks"
                onCancel={() => setShowSaveModal(false)}
                onConfirm={updateMarks}
            />

            <ConfirmDeleteModal
                show={!!studentToDelete}
                title="Delete Marks"
                message="Are you sure you want to delete this student's marks?"
                onCancel={() => setStudentToDelete(null)}
                onConfirm={() => {
                    deleteMarks(studentToDelete);
                    setStudentToDelete(null);
                }}
            />

            <ConfirmDeleteModal
                show={showDeleteAllModal}
                title="Delete All Marks"
                message="Are you sure you want to delete all marks for this subject?"
                onCancel={() => setShowDeleteAllModal(false)}
                onConfirm={() => {
                    deleteAllMarks();
                    setShowDeleteAllModal(false);
                }}
            />

        </div>
    );
};

export default EditMarks;