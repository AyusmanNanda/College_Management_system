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

            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-md">
                    {error}
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm text-left">
                        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3">Profile</th>
                            <th className="px-4 py-3">Student</th>
                            <th className="px-4 py-3">Roll No</th>
                            <th className="px-4 py-3">Course</th>
                            <th className="px-4 py-3">Semester</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                        </thead>

                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : filteredStudents.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                    No students found.
                                </td>
                            </tr>
                        ) : (
                            filteredStudents.map((student) => (
                                <tr
                                    key={student.sr_no}
                                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                                >
                                    <td className="px-4 py-3">
                                        <img
                                            key={student.profilepic}
                                            src={
                                                student.profilepic
                                                    ? `${BASE_URL}/uploads/students/${student.profilepic}`
                                                    : `${BASE_URL}/uploads/students/default.png`
                                            }
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = `${BASE_URL}/uploads/students/default.png`;
                                            }}
                                            alt="profile"
                                            className="h-10 w-10 rounded-full object-cover border"
                                        />
                                    </td>

                                    <td className="px-4 py-3">
                                        <div className="font-semibold">
                                            {student.firstname} {student.lastname}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {student.userid}
                                        </div>
                                    </td>

                                    <td className="px-4 py-3">{student.rollnumber}</td>
                                    <td className="px-4 py-3">{student.Courcecode}</td>
                                    <td className="px-4 py-3">{student.semoryear}</td>

                                    <td className="px-4 py-3">
                                        {student.activestatus ? (
                                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                                                    Active
                                                </span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">
                                                    Inactive
                                                </span>
                                        )}
                                    </td>

                                    <td className="px-4 py-3 text-center">
                                        <div className="flex gap-2 justify-center">
                                            <button
                                                onClick={() => {
                                                    setIsNew(false);
                                                    setSelectedStudent(student);
                                                }}
                                                className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setStudentToDelete(student.sr_no);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
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
                message="Are you sure you want to delete this student?"
                loading={loading}
                onCancel={() => setShowDeleteModal(false)}
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