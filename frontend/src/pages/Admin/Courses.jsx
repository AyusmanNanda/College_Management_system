import { useEffect, useState } from "react";
import axios from "axios";

const Courses = () => {
    const token = localStorage.getItem("token");

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        course_code: "",
        course_name: "",
        total_semesters: ""
    });

    const [editingId, setEditingId] = useState(null);

    /* ---------------- Fetch Courses ---------------- */

    const fetchCourses = async () => {
        if (!token) return;

        try {
            setLoading(true);
            const res = await axios.get(
                "http://localhost:5000/api/courses",
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
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

    /* ---------------- Handlers ---------------- */

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (Number(form.total_semesters) <= 0) {
            setError("Total semesters must be greater than 0.");
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
                total_semesters: ""
            });

            setEditingId(null);
            setError("");
            fetchCourses();

        } catch (err) {
            console.error(err);
            setError("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (course) => {
        setForm({
            course_code: course.course_code,
            course_name: course.course_name,
            total_semesters: course.total_semesters
        });
        setEditingId(course.id);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this course?"
        );
        if (!confirmDelete) return;

        try {
            setLoading(true);
            await axios.delete(
                `http://localhost:5000/api/courses/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchCourses();

        } catch (err) {
            console.error(err);
            setError("Failed to delete course.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10">

            <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                    Course Management
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                    Add, update, or remove academic courses.
                </p>
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">
                    {error}
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-6">
                    {editingId ? "Edit Course" : "Add New Course"}
                </h3>

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    <InputField
                        name="course_code"
                        placeholder="Course Code"
                        value={form.course_code}
                        onChange={handleChange}
                    />

                    <InputField
                        name="course_name"
                        placeholder="Course Name"
                        value={form.course_name}
                        onChange={handleChange}
                    />

                    <InputField
                        type="number"
                        name="total_semesters"
                        placeholder="Total Semesters"
                        value={form.total_semesters}
                        onChange={handleChange}
                        min="1"
                    />

                    <div className="md:col-span-3 flex gap-3 mt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-black transition disabled:opacity-60"
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
                                        total_semesters: ""
                                    });
                                }}
                                className="px-5 py-2 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                    <tr>
                        <th className="p-4">Code</th>
                        <th className="p-4">Name</th>
                        <th className="p-4">Semesters</th>
                        <th className="p-4">Actions</th>
                    </tr>
                    </thead>

                    <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="4" className="p-6 text-center">
                                Loading...
                            </td>
                        </tr>
                    ) : courses.length > 0 ? (
                        courses.map((course) => (
                            <tr key={course.id} className="border-t">
                                <td className="p-4">{course.course_code}</td>
                                <td className="p-4">{course.course_name}</td>
                                <td className="p-4">{course.total_semesters}</td>
                                <td className="p-4 flex gap-2">
                                    <button
                                        onClick={() => handleEdit(course)}
                                        className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(course.id)}
                                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="p-6 text-center text-gray-500">
                                No courses available.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

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
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
    />
);

export default Courses;