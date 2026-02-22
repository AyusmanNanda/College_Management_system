import { useEffect, useState } from "react";
import axios from "axios";

const Subjects = () => {
    const token = localStorage.getItem("token");

    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedSem, setSelectedSem] = useState("");

    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [editingCode, setEditingCode] = useState(null);

    const [form, setForm] = useState({
        subjectcode: "",
        subjectname: "",
        subjecttype: "core",
        theorymarks: "",
        practicalmarks: ""
    });

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

    const fetchSubjects = async (courseCode, sem) => {
        try {
            setLoading(true);
            const res = await axios.get(
                `http://localhost:5000/api/subjects?course_code=${courseCode}&sem=${sem}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSubjects(res.data);
        } catch (err) {
            setError("Failed to load subjects.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchCourses();
    }, [token]);

    useEffect(() => {
        if (selectedCourse && selectedSem) {
            fetchSubjects(selectedCourse, selectedSem);
        } else {
            setSubjects([]);
        }
    }, [selectedCourse, selectedSem]);

    const selectedCourseData = courses.find(
        (c) => c.course_code === selectedCourse
    );

    const handleFormChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setForm({
            subjectcode: "",
            subjectname: "",
            subjecttype: "core",
            theorymarks: "",
            practicalmarks: ""
        });
        setEditingCode(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedCourse || !selectedSem) {
            setError("Select course and semester first.");
            return;
        }

        try {
            setLoading(true);

            if (editingCode) {
                await axios.put(
                    `http://localhost:5000/api/subjects/${editingCode}`,
                    {
                        subjectname: form.subjectname,
                        subjecttype: form.subjecttype,
                        theorymarks: form.theorymarks,
                        practicalmarks: form.practicalmarks
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axios.post(
                    "http://localhost:5000/api/subjects",
                    {
                        ...form,
                        courcecode: selectedCourse,
                        semoryear: selectedSem
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            resetForm();
            fetchSubjects(selectedCourse, selectedSem);

        } catch (err) {
            setError(err.response?.data?.message || "Operation failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (subject) => {
        setForm({
            subjectcode: subject.subjectcode,
            subjectname: subject.subjectname,
            subjecttype: subject.subjecttype,
            theorymarks: subject.theorymarks,
            practicalmarks: subject.practicalmarks
        });
        setEditingCode(subject.subjectcode);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (code) => {
        if (!window.confirm("Delete this subject?")) return;

        try {
            setLoading(true);
            await axios.delete(
                `http://localhost:5000/api/subjects/${code}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchSubjects(selectedCourse, selectedSem);
        } catch (err) {
            setError("Failed to delete subject.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10">

            <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                    Subject Management
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                    Manage subjects by course and semester.
                </p>
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">
                    {error}
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm grid md:grid-cols-2 gap-6">

                <select
                    value={selectedCourse}
                    onChange={(e) => {
                        setSelectedCourse(e.target.value);
                        setSelectedSem("");
                        resetForm();
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
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
                    onChange={(e) => setSelectedSem(e.target.value)}
                    disabled={!selectedCourse}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
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
            </div>

            {selectedCourse && selectedSem && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-6">
                        {editingCode ? "Edit Subject" : "Add New Subject"}
                    </h3>

                    <form onSubmit={handleSubmit} className="grid md:grid-cols-5 gap-6">

                        {!editingCode && (
                            <input
                                name="subjectcode"
                                placeholder="Subject Code"
                                value={form.subjectcode}
                                onChange={handleFormChange}
                                required
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                        )}

                        <input
                            name="subjectname"
                            placeholder="Subject Name"
                            value={form.subjectname}
                            onChange={handleFormChange}
                            required
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />

                        <select
                            name="subjecttype"
                            value={form.subjecttype}
                            onChange={handleFormChange}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="core">Core</option>
                            <option value="optional">Optional</option>
                        </select>

                        <input
                            type="number"
                            name="theorymarks"
                            placeholder="Theory"
                            value={form.theorymarks}
                            onChange={handleFormChange}
                            required
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />

                        <input
                            type="number"
                            name="practicalmarks"
                            placeholder="Practical"
                            value={form.practicalmarks}
                            onChange={handleFormChange}
                            required
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />

                        <div className="md:col-span-5 flex gap-3">
                            <button
                                type="submit"
                                className="px-5 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-black"
                            >
                                {editingCode ? "Update Subject" : "Add Subject"}
                            </button>

                            {editingCode && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                    <tr>
                        <th className="p-4">Code</th>
                        <th className="p-4">Name</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Theory</th>
                        <th className="p-4">Practical</th>
                        <th className="p-4">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="6" className="p-6 text-center">
                                Loading...
                            </td>
                        </tr>
                    ) : subjects.length > 0 ? (
                        subjects.map((sub) => (
                            <tr key={sub.subjectcode} className="border-t">
                                <td className="p-4">{sub.subjectcode}</td>
                                <td className="p-4">{sub.subjectname}</td>
                                <td className="p-4 capitalize">{sub.subjecttype}</td>
                                <td className="p-4">{sub.theorymarks}</td>
                                <td className="p-4">{sub.practicalmarks}</td>
                                <td className="p-4 flex gap-2">
                                    <button
                                        onClick={() => handleEdit(sub)}
                                        className="px-3 py-1 bg-gray-200 rounded"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(sub.subjectcode)}
                                        className="px-3 py-1 bg-red-600 text-white rounded"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="p-6 text-center text-gray-500">
                                Select course and semester.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Subjects;