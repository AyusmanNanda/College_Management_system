import { useEffect, useState } from "react";
import api from "../../utils/api";
import StudentProfile from "./StudentProfile";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

const Students = () => {
    const BASE_URL = api.defaults.baseURL;
    const token = localStorage.getItem("token");

    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [courseFilter, setCourseFilter] = useState("");

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isNew, setIsNew] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    /* ================= FETCH STUDENTS ================= */

    const fetchStudents = async () => {
        if (!token) return;

        try {
            setLoading(true);
            const res = await api.get("/api/student", {
                headers: { Authorization: `Bearer ${token}` }
            });

            setStudents(Array.isArray(res.data) ? res.data : []);
            setError("");
        } catch (err) {
            console.error(err);
            setError("Failed to load students.");
        } finally {
            setLoading(false);
        }
    };

    /* ================= FETCH COURSES ================= */

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

    useEffect(() => {
        fetchStudents();
        fetchCourses();
    }, []);

    /* ================= DELETE ================= */

    const handleDelete = async () => {
        if (!studentToDelete) return;

        try {
            await api.delete(`/api/student/${studentToDelete}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            fetchStudents();
        } catch (err) {
            console.error(err);
            setError("Failed to delete student.");
        } finally {
            setShowDeleteModal(false);
            setStudentToDelete(null);
        }
    };

    /* ================= FILTER ================= */

    const filteredStudents = students.filter((student) => {
        const fullName = `${student.firstname} ${student.lastname}`;

        const matchesSearch =
            fullName.toLowerCase().includes(search.toLowerCase()) ||
            student?.emailid?.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
            !statusFilter ||
            String(student?.activestatus) === statusFilter;

        const matchesCourse =
            !courseFilter ||
            student?.Courcecode === courseFilter;

        return matchesSearch && matchesStatus && matchesCourse;
    });

    return (
        <div className="space-y-10">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                        Student Management
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Manage enrolled students.
                    </p>
                </div>

                <button
                    onClick={() => {
                        setIsNew(true);
                        setSelectedStudent({});
                    }}
                    className="px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-black transition"
                >
                    Add Student
                </button>
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
                            <th className="px-3 py-2 sm:px-4 sm:py-4">Student</th>
                            <th className="hidden sm:table-cell px-3 py-2 sm:px-4 sm:py-4">Roll No</th>
                            <th className="hidden md:table-cell px-3 py-2 sm:px-4 sm:py-4">Course</th>
                            <th className="hidden md:table-cell px-3 py-2 sm:px-4 sm:py-4">Semester</th>
                            <th className="hidden lg:table-cell px-3 py-2 sm:px-4 sm:py-4">Optional Subject</th>
                            <th className="hidden lg:table-cell px-3 py-2 sm:px-4 sm:py-4">Admission Date</th>
                            <th className="hidden sm:table-cell px-3 py-2 sm:px-4 sm:py-4">Status</th>
                            <th className="px-3 py-2 sm:px-4 sm:py-4 text-center">Actions</th>
                        </tr>
                        </thead>

                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="9" className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                                    Loading...
                                </td>
                            </tr>
                        ) : filteredStudents.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                                    No students found.
                                </td>
                            </tr>
                        ) : (
                            filteredStudents.map((student) => (
                                <tr
                                    key={student.sr_no}
                                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                                >
                                    <td className="px-3 py-2 sm:px-4 sm:py-4">
                                        <img
                                            src={
                                                student.profilepic
                                                    ? `${BASE_URL}/uploads/students/${student.profilepic}`
                                                    : `${BASE_URL}/uploads/students/default.png`
                                            }
                                            alt="profile"
                                            className="h-9 w-9 rounded-full object-cover border dark:border-gray-600"
                                        />
                                    </td>

                                    <td className="px-3 py-2 sm:px-4 sm:py-4 dark:text-gray-200">
                                        <div className="font-semibold">
                                            {student.firstname} {student.lastname}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {student.userid}
                                        </div>
                                    </td>

                                    <td className="hidden sm:table-cell px-3 py-2 sm:px-4 sm:py-4">
                                        {student.rollnumber}
                                    </td>

                                    <td className="hidden md:table-cell px-3 py-2 sm:px-4 sm:py-4">
                                        {student.Courcecode}
                                    </td>

                                    <td className="hidden md:table-cell px-3 py-2 sm:px-4 sm:py-4">
                                        {student.semoryear}
                                    </td>

                                    <td className="hidden lg:table-cell px-3 py-2 sm:px-4 sm:py-4">
                                        {student.optionalsubject || "-"}
                                    </td>

                                    <td className="hidden lg:table-cell px-3 py-2 sm:px-4 sm:py-4">
                                        {student.admissiondate || "-"}
                                    </td>

                                    <td className="hidden sm:table-cell px-3 py-2 sm:px-4 sm:py-4">
                                        {student.activestatus ? (
                                            <span className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-1 text-xs font-medium bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                                                Inactive
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-3 py-2 sm:px-4 sm:py-4">
                                        <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                            <button
                                                onClick={() => {
                                                    setIsNew(false);
                                                    setSelectedStudent(student);
                                                }}
                                                className="px-3 py-1.5 text-xs sm:text-sm bg-gray-200 dark:bg-gray-600 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setStudentToDelete(student.sr_no);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="px-3 py-1.5 text-xs sm:text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
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
                message="Are you sure you want to delete this student? This action cannot be undone."
                loading={loading}
                onCancel={() => {
                    setShowDeleteModal(false);
                    setStudentToDelete(null);
                }}
                onConfirm={handleDelete}
            />

            {selectedStudent !== null && (
                <StudentProfile
                    student={selectedStudent}
                    isNew={isNew}
                    onClose={() => setSelectedStudent(null)}
                    onUpdated={fetchStudents}
                />
            )}
        </div>
    );
};

export default Students;