import { useEffect, useState } from "react";
import api from "../../utils/api";
import FacultyProfile from "./FacultyProfile";
import ImportFacultyModal from "./ImportFacultyModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

const Faculties = () => {
    const BASE_URL = api.defaults.baseURL;
    const token = localStorage.getItem("token");

    const [faculties, setFaculties] = useState([]);
    const [courses, setCourses] = useState([]);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [courseFilter, setCourseFilter] = useState("");

    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [isNew, setIsNew] = useState(false);

    const [showImportModal, setShowImportModal] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [facultyToDelete, setFacultyToDelete] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    /* ================= FETCH FACULTIES ================= */

    const fetchFaculties = async () => {
        if (!token) return;

        try {
            setLoading(true);
            const res = await api.get(
                "/api/faculty",
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

    /* ================= FETCH COURSES ================= */

    const fetchCourses = async () => {
        try {
            const res = await api.get(
                "/api/courses",
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

    /* ================= DELETE ================= */

    const handleDelete = async () => {
        if (!facultyToDelete) return;

        try {
            await api.delete(
                `/api/faculty/${facultyToDelete}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchFaculties();
        } catch (err) {
            console.error(err);
            setError("Failed to delete faculty.");
        } finally {
            setShowDeleteModal(false);
            setFacultyToDelete(null);
        }
    };

    /* ================= FILTER ================= */

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

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                        Faculty Management
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Manage academic faculty assignments.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-100 text-sm rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                    >
                        Import from File
                    </button>

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

            {/* FILTERS */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">

                <input
                    type="text"
                    placeholder="Search by name or email"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
                />

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
                >
                    <option value="">All Status</option>
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                </select>

                <select
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
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
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-md">
                    {error}
                </div>
            )}

            {/* TABLE */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm text-left">
                        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
                        <tr>
                            <th className="px-3 py-2 sm:px-4 sm:py-4">Profile</th>
                            <th className="px-3 py-2 sm:px-4 sm:py-4">Faculty</th>
                            <th className="hidden sm:table-cell px-3 py-2 sm:px-4 sm:py-4">Position</th>
                            <th className="hidden md:table-cell px-3 py-2 sm:px-4 sm:py-4">Course</th>
                            <th className="hidden md:table-cell px-3 py-2 sm:px-4 sm:py-4">Semester</th>
                            <th className="hidden lg:table-cell px-3 py-2 sm:px-4 sm:py-4">Subject</th>
                            <th className="hidden lg:table-cell px-3 py-2 sm:px-4 sm:py-4">Experience</th>
                            <th className="hidden sm:table-cell px-3 py-2 sm:px-4 sm:py-4">Status</th>
                            <th className="px-3 py-2 sm:px-4 sm:py-4 text-center">Actions</th>
                        </tr>
                        </thead>

                        <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan="9"
                                    className="px-3 py-8 text-center text-gray-500 dark:text-gray-400"
                                >
                                    Loading...
                                </td>
                            </tr>
                        ) : filteredFaculties.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="9"
                                    className="px-3 py-8 text-center text-gray-500 dark:text-gray-400"
                                >
                                    No faculties found.
                                </td>
                            </tr>
                        ) : (
                            filteredFaculties.map((faculty) => (
                                <tr
                                    key={faculty.sr_no}
                                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                                >
                                    {/* Profile */}
                                    <td className="px-3 py-2 sm:px-4 sm:py-4">
                                        <img
                                            src={
                                                faculty.profilepic
                                                    ? `${BASE_URL}/uploads/faculties/${faculty.profilepic}`
                                                    : `${BASE_URL}/uploads/faculties/default.png`
                                            }
                                            alt="profile"
                                            className="h-9 w-9 rounded-full object-cover border dark:border-gray-600"
                                        />
                                    </td>

                                    {/* Faculty Info */}
                                    <td className="px-3 py-2 sm:px-4 sm:py-4 dark:text-gray-200">
                                        <div className="font-semibold">
                                            {faculty.facultyname}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {faculty.facultyid}
                                        </div>
                                    </td>

                                    {/* Position */}
                                    <td className="hidden sm:table-cell px-3 py-2 sm:px-4 sm:py-4 dark:text-gray-200">
                                        {faculty.position}
                                    </td>

                                    {/* Course */}
                                    <td className="hidden md:table-cell px-3 py-2 sm:px-4 sm:py-4 dark:text-gray-200">
                                        <div className="font-medium leading-tight">
                                            {faculty.courcecode}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                                            {faculty.course_name || ""}
                                        </div>
                                    </td>

                                    {/* Semester */}
                                    <td className="hidden md:table-cell px-3 py-2 sm:px-4 sm:py-4 dark:text-gray-200">
                                        {faculty.semoryear || "-"}
                                    </td>

                                    {/* Subject */}
                                    <td className="hidden lg:table-cell px-3 py-2 sm:px-4 sm:py-4 dark:text-gray-200 truncate">
                                        <div className="font-medium">
                                            {faculty.subject}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {faculty.subject_name || ""}
                                        </div>
                                    </td>

                                    {/* Experience */}
                                    <td className="hidden lg:table-cell px-3 py-2 sm:px-4 sm:py-4 dark:text-gray-200">
                                        {faculty.experience}
                                    </td>

                                    {/* Status */}
                                    <td className="hidden sm:table-cell px-3 py-2 sm:px-4 sm:py-4">
                                        {faculty.activestatus ? (
                                            <span className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                                    Active
                                </span>
                                        ) : (
                                            <span className="px-2.5 py-1 text-xs font-medium bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                                    Inactive
                                </span>
                                        )}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-3 py-2 sm:px-4 sm:py-4">
                                        <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                            <button
                                                onClick={() => {
                                                    setIsNew(false);
                                                    setSelectedFaculty(faculty);
                                                }}
                                                className="w-full sm:w-auto px-3 py-1.5 text-xs sm:text-sm bg-gray-200 dark:bg-gray-600 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setFacultyToDelete(faculty.sr_no);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="w-full sm:w-auto px-3 py-1.5 text-xs sm:text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
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

            <ConfirmDeleteModal
                show={showDeleteModal}
                title="Confirm Deletion"
                message="Are you sure you want to delete this faculty? This action cannot be undone."
                loading={loading}
                onCancel={() => {
                    setShowDeleteModal(false);
                    setFacultyToDelete(null);
                }}
                onConfirm={handleDelete}
            />

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