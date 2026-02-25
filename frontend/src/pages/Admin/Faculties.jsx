import { useEffect, useState } from "react";
import axios from "axios";
import FacultyProfile from "./FacultyProfile";
import ImportFacultyModal from "./ImportFacultyModal";

const Faculties = () => {
    const token = localStorage.getItem("token");

    const [faculties, setFaculties] = useState([]);
    const [courses, setCourses] = useState([]);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [courseFilter, setCourseFilter] = useState("");

    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [isNew, setIsNew] = useState(false);

    const [showImportModal, setShowImportModal] = useState(false);

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
        <div className="space-y-8">

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                        Faculty Management
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage academic faculty assignments.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Import Button */}
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition"
                    >
                        Import from File
                    </button>

                    {/* Add Faculty Button */}
                    <button
                        onClick={() => {
                            setIsNew(true);
                            setSelectedFaculty({});
                        }}
                        className="px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-black transition"
                    >
                        Add Faculty
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm grid md:grid-cols-3 gap-4">
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
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                        <tr>
                            <th className="px-3 py-2">Profile</th>
                            <th className="px-3 py-2">Faculty</th>
                            <th className="px-3 py-2">Position</th>
                            <th className="px-3 py-2">Course</th>
                            <th className="px-3 py-2">Semester</th>
                            <th className="px-3 py-2">Subject</th>
                            <th className="px-3 py-2">Experience</th>
                            <th className="px-3 py-2">Status</th>
                            <th className="px-3 py-2 text-center">Actions</th>
                        </tr>
                        </thead>

                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="9" className="py-6 text-center text-gray-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : filteredFaculties.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="py-6 text-center text-gray-500">
                                    No faculties found.
                                </td>
                            </tr>
                        ) : (
                            filteredFaculties.map((faculty) => (
                                <tr key={faculty.sr_no} className="border-t hover:bg-gray-50">
                                    <td className="px-3 py-2">
                                        <img
                                            src={
                                                faculty.profilepic
                                                    ? `http://localhost:5000/uploads/faculties/${faculty.profilepic}`
                                                    : `http://localhost:5000/uploads/faculties/default.png`
                                            }
                                            alt="profile"
                                            className="h-8 w-8 rounded-full object-cover border"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src =
                                                    "http://localhost:5000/uploads/faculties/default.png";
                                            }}
                                        />
                                    </td>

                                    <td className="px-3 py-2">
                                        <div className="font-medium">
                                            {faculty.facultyname}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {faculty.facultyid}
                                        </div>
                                    </td>

                                    <td className="px-3 py-2">
                                        {faculty.position}
                                    </td>

                                    <td className="px-3 py-2">
                                        <div className="font-medium">
                                            {faculty.courcecode}
                                        </div>
                                        {faculty.course_name && (
                                            <div className="text-xs text-gray-500">
                                                {faculty.course_name}
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-3 py-2">
                                        {faculty.semoryear || "-"}
                                    </td>

                                    <td className="px-3 py-2">
                                        {faculty.subject === "NOT ASSIGNED" ? (
                                            <span className="text-yellow-600 text-xs font-medium">
                                                    Unassigned
                                                </span>
                                        ) : (
                                            <>
                                                <div>{faculty.subject}</div>
                                                {faculty.subject_name && (
                                                    <div className="text-xs text-gray-500">
                                                        {faculty.subject_name}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </td>

                                    <td className="px-3 py-2">
                                        {faculty.experience}
                                    </td>

                                    <td className="px-3 py-2">
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

                                    <td className="px-3 py-2">
                                        <div className="flex gap-2 justify-center">
                                            <button
                                                onClick={() => {
                                                    setIsNew(false);
                                                    setSelectedFaculty(faculty);
                                                }}
                                                className="px-2 py-1 bg-gray-200 text-xs rounded hover:bg-gray-300"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => handleDelete(faculty.sr_no)}
                                                className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                            >
                                                Delete
                                            </button>
                                        </div>
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

            {showImportModal && (
                <ImportFacultyModal
                    token={token}
                    onClose={() => setShowImportModal(false)}
                    onImportSuccess={fetchFaculties}
                />
            )}
        </div>
    );
};

export default Faculties;