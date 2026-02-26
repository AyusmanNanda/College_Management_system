import { useEffect, useState } from "react";
import axios from "axios";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

const Subjects = () => {
    const token = localStorage.getItem("token");

    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedSem, setSelectedSem] = useState("");
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [editingCode, setEditingCode] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState(null);

    const [form, setForm] = useState({
        subjectcode: "",
        subjectname: "",
        subjecttype: "core",
        theorymarks: "",
        practicalmarks: ""
    });

    /* ================= Fetch Courses ================= */

    const fetchCourses = async () => {
        try {
            const res = await axios.get(
                "http://localhost:5000/api/courses",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCourses(res.data);
        } catch {
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
        } catch {
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

    /* ================= Form Handling ================= */

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

    const handleDelete = async () => {
        if (!subjectToDelete) return;

        try {
            setLoading(true);
            await axios.delete(
                `http://localhost:5000/api/subjects/${subjectToDelete}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchSubjects(selectedCourse, selectedSem);
        } catch {
            setError("Failed to delete subject.");
        } finally {
            setLoading(false);
            setShowDeleteModal(false);
            setSubjectToDelete(null);
        }
    };

    return (
        <div className="space-y-10">

            {/* Header */}
            <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                    Subject Management
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Manage subjects by course and semester.
                </p>
            </div>

            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-md">
                    {error}
                </div>
            )}

            {/* Course & Semester Selection */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">

                <select
                    value={selectedCourse}
                    onChange={(e) => {
                        setSelectedCourse(e.target.value);
                        setSelectedSem("");
                        resetForm();
                    }}
                    className="w-full px-2 py-2 sm:px-3 sm:py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
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
                    className="w-full px-2 py-2 sm:px-3 sm:py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
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

            {/* Subjects Table */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
                        <tr>
                            <th className="px-3 py-2 sm:p-4">Code</th>
                            <th className="px-3 py-2 sm:p-4">Name</th>
                            <th className="px-3 py-2 sm:p-4">Type</th>

                            {/* Hidden on Mobile */}
                            <th className="hidden sm:table-cell px-3 py-2 sm:p-4">
                                Theory
                            </th>
                            <th className="hidden sm:table-cell px-3 py-2 sm:p-4">
                                Practical
                            </th>

                            <th className="px-3 py-2 sm:p-4">Actions</th>
                        </tr>
                        </thead>

                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="p-6 text-center dark:text-gray-300">
                                    Loading...
                                </td>
                            </tr>
                        ) : subjects.length > 0 ? (
                            subjects.map((sub) => (
                                <tr key={sub.subjectcode} className="border-t dark:border-gray-700">
                                    <td className="px-3 py-2 sm:p-4 dark:text-gray-200">{sub.subjectcode}</td>
                                    <td className="px-3 py-2 sm:p-4 dark:text-gray-200">{sub.subjectname}</td>
                                    <td className="px-3 py-2 sm:p-4 capitalize dark:text-gray-200">{sub.subjecttype}</td>

                                    {/* Hidden on Mobile */}
                                    <td className="hidden sm:table-cell px-3 py-2 sm:p-4 dark:text-gray-200">
                                        {sub.theorymarks}
                                    </td>
                                    <td className="hidden sm:table-cell px-3 py-2 sm:p-4 dark:text-gray-200">
                                        {sub.practicalmarks}
                                    </td>

                                    <td className="px-3 py-2 sm:p-4">
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <button
                                                onClick={() => handleEdit(sub)}
                                                className="px-2 py-1 text-xs sm:text-sm bg-gray-200 dark:bg-gray-600 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setSubjectToDelete(sub.subjectcode);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="px-2 py-1 text-xs sm:text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="p-6 text-center text-gray-500 dark:text-gray-400">
                                    Select course and semester.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmDeleteModal
                show={showDeleteModal}
                title="Confirm Deletion"
                message="Are you sure you want to delete this subject? This action cannot be undone."
                loading={loading}
                onCancel={() => {
                    setShowDeleteModal(false);
                    setSubjectToDelete(null);
                }}
                onConfirm={handleDelete}
            />
        </div>
    );
};

export default Subjects;