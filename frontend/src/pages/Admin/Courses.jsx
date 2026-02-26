import { useEffect, useState } from "react";
import axios from "axios";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

const Courses = () => {
    const token = localStorage.getItem("token");

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        course_code: "",
        course_name: "",
        sem_or_year: "sem",
        total_semesters: ""
    });

    const [editingId, setEditingId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);

    const fetchCourses = async () => {
        if (!token) return;

        try {
            setLoading(true);
            const res = await axios.get(
                "http://localhost:5000/api/courses",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCourses(res.data);
            setError("");
        } catch (err) {
            console.error(err);
            setError("Failed to load courses.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [token]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (Number(form.total_semesters) <= 0) {
            setError("Total must be greater than 0.");
            return;
        }

        try {
            setLoading(true);

            if (editingId) {
                await axios.put(
                    `http://localhost:5000/api/courses/${editingId}`,
                    form,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axios.post(
                    "http://localhost:5000/api/courses",
                    form,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            setForm({
                course_code: "",
                course_name: "",
                sem_or_year: "sem",
                total_semesters: ""
            });

            setEditingId(null);
            setError("");
            fetchCourses();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (course) => {
        setForm({
            course_code: course.course_code,
            course_name: course.course_name,
            sem_or_year: course.sem_or_year,
            total_semesters: course.total_semesters
        });

        setEditingId(course.id);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async () => {
        if (!courseToDelete) return;

        try {
            setLoading(true);

            await axios.delete(
                `http://localhost:5000/api/courses/${courseToDelete}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchCourses();
            setError("");
        } catch (err) {
            console.error(err);
            setError("Failed to delete course.");
        } finally {
            setLoading(false);
            setShowDeleteModal(false);
            setCourseToDelete(null);
        }
    };

    return (
        <div className="space-y-10">

            {/* Header */}
            <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                    Course Management
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Add, update, or manage academic courses.
                </p>
            </div>

            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-md">
                    {error}
                </div>
            )}

            {/* Form Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm transition-colors">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide mb-6">
                    {editingId ? "Edit Course" : "Add New Course"}
                </h3>

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4"
                >
                    <InputField
                        name="course_code"
                        value={form.course_code}
                        onChange={handleChange}
                        placeholder="Course Code"
                    />

                    <InputField
                        name="course_name"
                        value={form.course_name}
                        onChange={handleChange}
                        placeholder="Course Name"
                    />

                    <select
                        name="sem_or_year"
                        value={form.sem_or_year}
                        onChange={handleChange}
                        className="w-full px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 transition"
                    >
                        <option value="sem">Semester</option>
                        <option value="year">Year</option>
                    </select>

                    <InputField
                        type="number"
                        name="total_semesters"
                        value={form.total_semesters}
                        onChange={handleChange}
                        placeholder="Total"
                        min="1"
                    />

                    <div className="md:col-span-4 flex flex-wrap gap-3 mt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-3 py-1.5 sm:px-5 sm:py-2 bg-gray-900 text-white dark:bg-gray-700 dark:hover:bg-gray-600 text-xs sm:text-sm rounded-md hover:bg-black transition disabled:opacity-60"
                        >
                            {editingId ? "Update Course" : "Add Course"}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingId(null);
                                    setForm({
                                        course_code: "",
                                        course_name: "",
                                        sem_or_year: "sem",
                                        total_semesters: ""
                                    });
                                }}
                                className="px-3 py-1.5 sm:px-5 sm:py-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-100 text-gray-800 text-xs sm:text-sm rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Table Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden transition-colors">
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left text-[11px] sm:text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
                        <tr>
                            <th className="px-2 py-1.5 sm:px-4 sm:py-4">Code</th>
                            <th className="px-2 py-1.5 sm:px-4 sm:py-4">Name</th>
                            <th className="px-2 py-1.5 sm:px-4 sm:py-4">Type</th>
                            <th className="px-2 py-1.5 sm:px-4 sm:py-4">Total</th>
                            <th className="hidden sm:table-cell px-2 py-1.5 sm:px-4 sm:py-4">Subjects</th>
                            <th className="hidden sm:table-cell px-2 py-1.5 sm:px-4 sm:py-4">Students</th>
                            <th className="px-2 py-1.5 sm:px-4 sm:py-4">Actions</th>
                        </tr>
                        </thead>

                        <tbody>
                        {courses.map((course) => (
                            <tr key={course.id} className="border-t dark:border-gray-700">
                                <td className="px-2 py-1.5 sm:px-4 sm:py-4 dark:text-gray-200">{course.course_code}</td>
                                <td className="px-2 py-1.5 sm:px-4 sm:py-4 dark:text-gray-200">{course.course_name}</td>
                                <td className="px-2 py-1.5 sm:px-4 sm:py-4 capitalize dark:text-gray-200">{course.sem_or_year}</td>
                                <td className="px-2 py-1.5 sm:px-4 sm:py-4 dark:text-gray-200">{course.total_semesters}</td>
                                <td className="hidden sm:table-cell px-2 py-1.5 sm:px-4 sm:py-4 dark:text-gray-200">{course.subject_count}</td>
                                <td className="hidden sm:table-cell px-2 py-1.5 sm:px-4 sm:py-4 dark:text-gray-200">{course.student_count}</td>
                                <td className="px-2 py-1.5 sm:px-4 sm:py-4 flex flex-col sm:flex-row gap-2">
                                    <button
                                        onClick={() => handleEdit(course)}
                                        className="px-2 py-1 text-[11px] sm:text-sm bg-gray-200 dark:bg-gray-600 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => {
                                            setCourseToDelete(course.id);
                                            setShowDeleteModal(true);
                                        }}
                                        className="px-2 py-1 text-[11px] sm:text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmDeleteModal
                show={showDeleteModal}
                title="Confirm Deletion"
                message="Are you sure you want to delete this course? This action cannot be undone."
                loading={loading}
                onCancel={() => {
                    setShowDeleteModal(false);
                    setCourseToDelete(null);
                }}
                onConfirm={handleDelete}
            />
        </div>
    );
};

const InputField = ({ type = "text", name, value, onChange, placeholder, min }) => (
    <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        min={min}
        placeholder={placeholder}
        className="w-full px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 transition"
    />
);

export default Courses;