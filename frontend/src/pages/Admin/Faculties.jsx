import { useEffect, useState } from "react";
import axios from "axios";
import FacultyProfile from "./FacultyProfile";

const Faculties = () => {
    const token = localStorage.getItem("token");

    const [faculties, setFaculties] = useState([]);
    const [courses, setCourses] = useState([]);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [courseFilter, setCourseFilter] = useState("");

    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [isNew, setIsNew] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // =========================
    // Fetch Faculties
    // =========================
    const fetchFaculties = async () => {
        if (!token) return;

        try {
            setLoading(true);
            const res = await axios.get(
                "http://localhost:5000/api/faculty",
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setFaculties(Array.isArray(res.data) ? res.data : []);
            setError("");
        } catch (err) {
            console.error(err);
            setError("Failed to load faculties.");
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // Fetch Courses
    // =========================
    const fetchCourses = async () => {
        try {
            const res = await axios.get(
                "http://localhost:5000/api/courses",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCourses(res.data || []);
        } catch {
            setCourses([]);
        }
    };

    useEffect(() => {
        fetchFaculties();
        fetchCourses();
    }, []);

    // =========================
    // Delete Faculty
    // =========================
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this faculty?"))
            return;

        try {
            await axios.delete(
                `http://localhost:5000/api/faculty/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchFaculties();
        } catch (err) {
            console.error(err);
            setError("Failed to delete faculty.");
        }
    };

    // =========================
    // Filtering
    // =========================
    const filteredFaculties = faculties.filter((faculty) => {
        const matchesSearch =
            faculty?.facultyname?.toLowerCase().includes(search.toLowerCase()) ||
            faculty?.emailid?.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
            !statusFilter ||
            String(faculty?.activestatus) === statusFilter;

        const matchesCourse =
            !courseFilter ||
            faculty?.courcecode === courseFilter;

        return matchesSearch && matchesStatus && matchesCourse;
    });

    return (
        <div className="space-y-10">

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800">
                        Faculty Management
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage academic faculty assignments.
                    </p>
                </div>

                <button
                    onClick={() => {
                        setIsNew(true);
                        setSelectedFaculty({});
                    }}
                    className="px-5 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-black transition"
                >
                    Add Faculty
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm grid md:grid-cols-3 gap-6">
                <input
                    type="text"
                    placeholder="Search by name or email"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                    <option value="">All Status</option>
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                </select>

                <select
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                    <option value="">All Courses</option>
                    {courses.map((course) => (
                        <option key={course.id} value={course.course_code}>
                            {course.course_name}
                        </option>
                    ))}
                </select>
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">
                    {error}
                </div>
            )}

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-[1200px] w-full text-left text-sm">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                        <tr>
                            <th className="p-4">Profile</th>
                            <th className="p-4">Faculty</th>
                            <th className="p-4">Position</th>
                            <th className="p-4">Course</th>
                            <th className="p-4">Semester</th>
                            <th className="p-4">Subject</th>
                            <th className="p-4">Experience</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                        </thead>

                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="10" className="p-6 text-center text-gray-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : filteredFaculties.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="p-6 text-center text-gray-500">
                                    No faculties found.
                                </td>
                            </tr>
                        ) : (
                            filteredFaculties.map((faculty) => (
                                <tr key={faculty.sr_no} className="border-t hover:bg-gray-50">

                                    {/* Profile */}
                                    <td className="p-4">
                                        {faculty.profilepic ? (
                                            <img
                                                src={`http://localhost:5000/uploads/faculties/${faculty.profilepic}`}
                                                alt="profile"
                                                className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                                                {faculty.facultyname?.charAt(0)?.toUpperCase() || "?"}
                                            </div>
                                        )}
                                    </td>

                                    <td className="p-4 max-w-[220px]">
                                        <div className="font-medium text-gray-900">
                                            {faculty.facultyid}
                                        </div>
                                        <div
                                            className="text-sm text-gray-600 truncate"
                                            title={faculty.facultyname}
                                        >
                                            {faculty.facultyname}
                                        </div>
                                    </td>

                                    <td className="p-4 max-w-[180px] truncate" title={faculty.position}>
                                        {faculty.position}
                                    </td>

                                    {/* Course ID + Name */}
                                    <td className="p-4 max-w-[220px]">
                                        <div className="font-medium">
                                            {faculty.courcecode}
                                        </div>
                                        {faculty.course_name && (
                                            <div
                                                className="text-xs text-gray-500 truncate"
                                                title={faculty.course_name}
                                            >
                                                {faculty.course_name}
                                            </div>
                                        )}
                                    </td>

                                    <td className="p-4">
                                        {faculty.semoryear || "-"}
                                    </td>

                                    {/* Subject ID + Name */}
                                    <td className="p-4 max-w-[220px]">
                                        {faculty.subject === "NOT ASSIGNED" ? (
                                            <span className="text-yellow-600 font-medium">
                                                    Unassigned
                                                </span>
                                        ) : (
                                            <>
                                                <div className="font-medium">
                                                    {faculty.subject}
                                                </div>
                                                {faculty.subject_name && (
                                                    <div
                                                        className="text-xs text-gray-500 truncate"
                                                        title={faculty.subject_name}
                                                    >
                                                        {faculty.subject_name}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </td>

                                    <td className="p-4">{faculty.experience}</td>

                                    <td className="p-4">
                                        {faculty.activestatus ? (
                                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                                                    Active
                                                </span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">
                                                    Inactive
                                                </span>
                                        )}
                                    </td>

                                    <td className="p-4 flex gap-2">
                                        <button
                                            onClick={() => {
                                                setIsNew(false);
                                                setSelectedFaculty(faculty);
                                            }}
                                            className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => handleDelete(faculty.sr_no)}
                                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                        >
                                            Delete
                                        </button>
                                    </td>

                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedFaculty !== null && (
                <FacultyProfile
                    faculty={selectedFaculty}
                    isNew={isNew}
                    onClose={() => setSelectedFaculty(null)}
                    onUpdated={fetchFaculties}
                />
            )}
        </div>
    );
};

export default Faculties;