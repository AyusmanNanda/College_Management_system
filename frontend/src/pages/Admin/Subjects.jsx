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

    const [form, setForm] = useState({
        subjectcode: "",
        subjectname: "",
        subjecttype: "core",
        theorymarks: "",
        practicalmarks: ""
    });

    // Fetch courses
    const fetchCourses = async () => {
        try {
            const res = await axios.get(
                "http://localhost:5000/api/courses",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCourses(res.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load courses.");
        }
    };

    // Fetch subjects
    const fetchSubjects = async (courseCode, sem) => {
        try {
            setLoading(true);
            const res = await axios.get(
                `http://localhost:5000/api/subjects?course_code=${courseCode}&sem=${sem}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSubjects(res.data);
            setError("");
        } catch (err) {
            console.error(err);
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

    const handleAddSubject = async (e) => {
        e.preventDefault();

        if (!selectedCourse || !selectedSem) {
            setError("Select course and semester first.");
            return;
        }

        try {
            setLoading(true);

            await axios.post(
                "http://localhost:5000/api/subjects",
                {
                    ...form,
                    courcecode: selectedCourse,
                    semoryear: selectedSem
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setForm({
                subjectcode: "",
                subjectname: "",
                subjecttype: "core",
                theorymarks: "",
                practicalmarks: ""
            });

            fetchSubjects(selectedCourse, selectedSem);

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to add subject.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10">

            {/* Header */}
            <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                    Subject Management
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                    Manage subjects by course and semester.
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm grid md:grid-cols-2 gap-6">

                <select
                    value={selectedCourse}
                    onChange={(e) => {
                        setSelectedCourse(e.target.value);
                        setSelectedSem("");
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
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

            {/* Add Subject Form */}
            {selectedCourse && selectedSem && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-6">
                        Add New Subject
                    </h3>

                    <form
                        onSubmit={handleAddSubject}
                        className="grid grid-cols-1 md:grid-cols-5 gap-6"
                    >
                        <input
                            name="subjectcode"
                            placeholder="Subject Code"
                            value={form.subjectcode}
                            onChange={handleFormChange}
                            required
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />

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
                            placeholder="Theory Marks"
                            value={form.theorymarks}
                            onChange={handleFormChange}
                            required
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />

                        <input
                            type="number"
                            name="practicalmarks"
                            placeholder="Practical Marks"
                            value={form.practicalmarks}
                            onChange={handleFormChange}
                            required
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />

                        <div className="md:col-span-5">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-5 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-black transition disabled:opacity-60"
                            >
                                Add Subject
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                    <tr>
                        <th className="p-4">Code</th>
                        <th className="p-4">Name</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Theory</th>
                        <th className="p-4">Practical</th>
                    </tr>
                    </thead>

                    <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="5" className="p-6 text-center text-gray-500">
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
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="p-6 text-center text-gray-500">
                                {selectedCourse && selectedSem
                                    ? "No subjects found."
                                    : "Select course and semester."}
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