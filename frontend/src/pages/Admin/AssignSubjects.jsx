import { useEffect, useState } from "react";
import axios from "axios";

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

    // =========================
    // Fetch Courses
    // =========================
    const fetchCourses = async () => {
        try {
            const res = await axios.get(
                "http://localhost:5000/api/courses",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCourses(res.data);
        } catch (err) {
            setError("Failed to load courses.");
        }
    };

    // =========================
    // Fetch Subjects
    // =========================
    const fetchSubjects = async () => {
        if (!selectedCourse || !selectedSem) return;

        try {
            const res = await axios.get(
                `http://localhost:5000/api/subjects?course_code=${selectedCourse}&sem=${selectedSem}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSubjects(res.data);
        } catch (err) {
            setError("Failed to load subjects.");
        }
    };

    // =========================
    // Fetch Faculties (Only After Course + Sem)
    // =========================
    const fetchFaculties = async () => {
        try {
            const res = await axios.get(
                "http://localhost:5000/api/assign/faculties",
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Only show faculties relevant to selected course
            const filtered = res.data.filter(
                (f) =>
                    f.courcecode === "NOT ASSIGNED" ||
                    f.courcecode === selectedCourse
            );

            setFaculties(filtered);
        } catch (err) {
            setError("Failed to load faculties.");
        }
    };

    // Load courses once
    useEffect(() => {
        fetchCourses();
    }, []);

    // Load subjects + faculties only when course + sem selected
    useEffect(() => {
        if (selectedCourse && selectedSem) {
            fetchSubjects();
            fetchFaculties();
        } else {
            setSubjects([]);
            setFaculties([]);
        }
    }, [selectedCourse, selectedSem]);

    // =========================
    // Assign Subject
    // =========================
    const handleAssign = async (facultyId) => {
        if (!selectedCourse || !selectedSem || !selectedSubject) {
            setError("Select course, semester and subject first.");
            return;
        }

        try {
            setLoading(true);

            await axios.put(
                `http://localhost:5000/api/assign/${facultyId}`,
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

    // =========================
    // Unassign Subject
    // =========================
    const handleUnassign = async (facultyId) => {
        try {
            setLoading(true);

            await axios.put(
                `http://localhost:5000/api/assign/${facultyId}`,
                {
                    subjectcode: "NOT ASSIGNED",
                    courcecode: "NOT ASSIGNED",
                    semoryear: 0
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchFaculties();
            setError("");
        } catch (err) {
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
                <h2 className="text-2xl font-semibold text-gray-800">
                    Assign Subject to Faculty
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                    Select course and semester before assigning subjects.
                </p>
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm grid md:grid-cols-3 gap-6">

                <select
                    value={selectedCourse}
                    onChange={(e) => {
                        setSelectedCourse(e.target.value);
                        setSelectedSem("");
                        setSelectedSubject("");
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
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
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
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
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
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
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Assignment</th>
                            <th className="p-4">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {faculties.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="p-6 text-center text-gray-500">
                                    No faculty available.
                                </td>
                            </tr>
                        ) : (
                            faculties.map((faculty) => (
                                <tr key={faculty.sr_no} className="border-t">

                                    <td className="p-4">{faculty.facultyname}</td>

                                    <td className="p-4">{faculty.emailid}</td>

                                    <td className="p-4">
                                        {faculty.subject !== "NOT ASSIGNED" ? (
                                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                                                    {faculty.subjectname
                                                        ? `${faculty.subjectname} (${faculty.subject})`
                                                        : faculty.subject}
                                                </span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded">
                                                    Not Assigned
                                                </span>
                                        )}
                                    </td>

                                    <td className="p-4 flex gap-2">
                                        <button
                                            onClick={() => handleAssign(faculty.sr_no)}
                                            disabled={loading}
                                            className="px-3 py-1 bg-gray-900 text-white rounded text-sm"
                                        >
                                            Assign
                                        </button>

                                        {faculty.subject !== "NOT ASSIGNED" && (
                                            <button
                                                onClick={() => handleUnassign(faculty.sr_no)}
                                                className="px-3 py-1 bg-red-600 text-white rounded text-sm"
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
            )}

        </div>
    );
};

export default AssignSubjects;