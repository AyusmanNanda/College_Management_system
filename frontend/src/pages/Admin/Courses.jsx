import { useEffect, useState } from "react";
import axios from "axios";

/*
  Courses Management Page
  -----------------------
  Admin can:
  - Add course
  - View courses
  - Edit course
  - Delete course
*/

const Courses = () => {
    const token = localStorage.getItem("token");

    const [courses, setCourses] = useState([]);
    const [form, setForm] = useState({
        course_code: "",
        course_name: "",
        total_semesters: ""
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/courses", {
                headers: { Authorization: `Bearer ${token}` }
            });

            setCourses(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
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
            fetchCourses();

        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (course) => {
        setForm({
            course_code: course.course_code,
            course_name: course.course_name,
            total_semesters: course.total_semesters
        });
        setEditingId(course.id);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(
                `http://localhost:5000/api/courses/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchCourses();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-semibold mb-6">
                Courses Management
            </h1>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-xl shadow-md mb-8 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                <input
                    type="text"
                    name="course_code"
                    placeholder="Course Code"
                    value={form.course_code}
                    onChange={handleChange}
                    required
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />

                <input
                    type="text"
                    name="course_name"
                    placeholder="Course Name"
                    value={form.course_name}
                    onChange={handleChange}
                    required
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />

                <input
                    type="number"
                    name="total_semesters"
                    placeholder="Total Semesters"
                    value={form.total_semesters}
                    onChange={handleChange}
                    required
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />

                <div className="md:col-span-3">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        {editingId ? "Update Course" : "Add Course"}
                    </button>
                </div>
            </form>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="p-3">Code</th>
                        <th className="p-3">Name</th>
                        <th className="p-3">Semesters</th>
                        <th className="p-3">Actions</th>
                    </tr>
                    </thead>

                    <tbody>
                    {courses.map((course) => (
                        <tr key={course.id} className="border-t">
                            <td className="p-3">{course.course_code}</td>
                            <td className="p-3">{course.course_name}</td>
                            <td className="p-3">{course.total_semesters}</td>
                            <td className="p-3 space-x-2">
                                <button
                                    onClick={() => handleEdit(course)}
                                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(course.id)}
                                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}

                    {courses.length === 0 && (
                        <tr>
                            <td colSpan="4" className="p-4 text-center text-gray-500">
                                No courses available
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Courses;
