import { useEffect, useState } from "react";
import api from "../../utils/api";

const AssignSubjects = () => {
    const token = localStorage.getItem("token");

    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [faculties, setFaculties] = useState([]);

    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedSem, setSelectedSem] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    /* ================= FETCH COURSES ================= */

    const fetchCourses = async () => {
        try {
            const res = await api.get("/api/courses", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(res.data || []);
        } catch {
            setError("Failed to load courses.");
        }
    };

    /* ================= FETCH SUBJECTS ================= */

    const fetchSubjects = async () => {
        if (!selectedCourse || !selectedSem) return;

        try {
            const res = await api.get(
                `/api/subjects?course_code=${selectedCourse}&sem=${selectedSem}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSubjects(res.data || []);
        } catch {
            setError("Failed to load subjects.");
        }
    };

    /* ================= FETCH FACULTIES ================= */

    const fetchFaculties = async () => {
        try {
            const res = await api.get("/api/assign/faculties", {
                headers: { Authorization: `Bearer ${token}` }
            });

            const filtered = (res.data || []).filter(
                (f) =>
                    f.courcecode === "NOT ASSIGNED" ||
                    f.courcecode === selectedCourse
            );

            setFaculties(filtered);
        } catch {
            setError("Failed to load faculties.");
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse && selectedSem) {
            fetchSubjects();
            fetchFaculties();
        } else {
            setSubjects([]);
            setFaculties([]);
        }
    }, [selectedCourse, selectedSem]);

    /* ================= ASSIGN ================= */

    const handleAssign = async (facultyId) => {
        if (!selectedCourse || !selectedSem || !selectedSubject) {
            setError("Select course, semester and subject first.");
            return;
        }

        try {
            setLoading(true);

            await api.put(
                `/api/assign/${facultyId}`,
                {
                    subjectcode: selectedSubject,
                    courcecode: selectedCourse,
                    semoryear: selectedSem
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchFaculties();
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to assign subject.");
        } finally {
            setLoading(false);
        }
    };

    /* ================= UNASSIGN ================= */

    const handleUnassign = async (facultyId) => {
        try {
            setLoading(true);

            await api.put(
                `/api/assign/${facultyId}`,
                {
                    subjectcode: "NOT ASSIGNED",
                    courcecode: "NOT ASSIGNED",
                    semoryear: 0
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchFaculties();
            setError("");
        } catch {
            setError("Failed to unassign subject.");
        } finally {
            setLoading(false);
        }
    };

    const selectedCourseData = courses.find(
        (c) => c.course_code === selectedCourse
    );

    return (
        <div className="space-y-10">

            {/* Header */}
            <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                    Assign Subject to Faculty
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Select course and semester before assigning subjects.
                </p>
            </div>

            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-md">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 transition-colors">

                <select
                    value={selectedCourse}
                    onChange={(e) => {
                        setSelectedCourse(e.target.value);
                        setSelectedSem("");
                        setSelectedSubject("");
                    }}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
                >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                        <option key={course.id} value={course.course_code}>
                            {course.course_name}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedSem}
                    onChange={(e) => {
                        setSelectedSem(e.target.value);
                        setSelectedSubject("");
                    }}
                    disabled={!selectedCourse}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm disabled:opacity-60"
                >
                    <option value="">Select Semester</option>
                    {selectedCourseData &&
                        Array.from(
                            { length: selectedCourseData.total_semesters },
                            (_, i) => i + 1
                        ).map((sem) => (
                            <option key={sem} value={sem}>
                                {selectedCourseData.sem_or_year === "year"
                                    ? `Year ${sem}`
                                    : `Semester ${sem}`}
                            </option>
                        ))}
                </select>

                <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    disabled={!selectedSem}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm disabled:opacity-60"
                >
                    <option value="">Select Subject</option>
                    {subjects.map((sub) => (
                        <option key={sub.subjectcode} value={sub.subjectcode}>
                            {sub.subjectname} ({sub.subjectcode})
                        </option>
                    ))}
                </select>
            </div>

            {/* Faculty Table */}
            {selectedCourse && selectedSem && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
                            <tr>
                                <th className="p-4">Name</th>
                                <th className="p-4 hidden sm:table-cell">Email</th>
                                <th className="p-4">Assignment</th>
                                <th className="p-4">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {faculties.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-6 text-center text-gray-500 dark:text-gray-400">
                                        No faculty available.
                                    </td>
                                </tr>
                            ) : (
                                faculties.map((faculty) => (
                                    <tr
                                        key={faculty.sr_no}
                                        className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                                    >
                                        <td className="p-4 dark:text-gray-200">
                                            {faculty.facultyname}
                                        </td>

                                        <td className="p-4 hidden sm:table-cell dark:text-gray-200">
                                            {faculty.emailid}
                                        </td>

                                        <td className="p-4">
                                            {faculty.subject !== "NOT ASSIGNED" ? (
                                                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded">
                                                        {faculty.subjectname
                                                            ? `${faculty.subjectname} (${faculty.subject})`
                                                            : faculty.subject}
                                                    </span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 dark:text-gray-200 text-gray-600 rounded">
                                                        Not Assigned
                                                    </span>
                                            )}
                                        </td>

                                        <td className="p-4 flex flex-col sm:flex-row gap-2">
                                            <button
                                                onClick={() => handleAssign(faculty.sr_no)}
                                                disabled={loading}
                                                className="px-3 py-1 bg-gray-900 text-white rounded text-sm hover:bg-black transition w-full sm:w-auto"
                                            >
                                                Assign
                                            </button>

                                            {faculty.subject !== "NOT ASSIGNED" && (
                                                <button
                                                    onClick={() => handleUnassign(faculty.sr_no)}
                                                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition w-full sm:w-auto"
                                                >
                                                    Unassign
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignSubjects;