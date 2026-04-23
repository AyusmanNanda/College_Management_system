import { useEffect, useState } from "react";
import api from "../../utils/api";
import ConfirmDeleteModal from "./modals/ConfirmDeleteModal.jsx";
import Toast from "./Toast.jsx";

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

    const [toast, setToast] = useState(null);

    const [form, setForm] = useState({
        subjectcode: "",
        subjectname: "",
        subjecttype: "core",
        theorymarks: "",
        practicalmarks: ""
    });

    /* ================= FETCH ================= */

    const fetchCourses = async () => {
        try {
            const res = await api.get(
                "/api/courses",
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
            const res = await api.get(
                `/api/subjects?course_code=${courseCode}&sem=${sem}`,
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

    /* ================= FORM ================= */

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
                await api.put(
                    `/api/subjects/${editingCode}`,
                    {
                        subjectname: form.subjectname,
                        subjecttype: form.subjecttype,
                        theorymarks: form.theorymarks,
                        practicalmarks: form.practicalmarks
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setToast({ type: "success", message: "Subject updated successfully!" });
            } else {
                await api.post(
                    "/api/subjects",
                    {
                        ...form,
                        courcecode: selectedCourse,
                        semoryear: selectedSem
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setToast({ type: "success", message: "Subject added successfully!" });
            }

            resetForm();
            fetchSubjects(selectedCourse, selectedSem);

        } catch (err) {
            const errorMessage = err.response?.data?.message || "Operation failed.";
            setError(errorMessage);
            setToast({ type: "error", message: errorMessage });
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
            await api.delete(
                `/api/subjects/${subjectToDelete}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setToast({ type: "success", message: "Subject deleted successfully." });
            fetchSubjects(selectedCourse, selectedSem);
        } catch {
            setError("Failed to delete subject.");
            setToast({ type: "error", message: "Failed to delete subject." });
        } finally {
            setLoading(false);
            setShowDeleteModal(false);
            setSubjectToDelete(null);
        }
    };

    return (
        <div className="space-y-10">

            {/* HEADER */}
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

            {/* COURSE + SEM */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">

                <select
                    value={selectedCourse}
                    onChange={(e) => {
                        setSelectedCourse(e.target.value);
                        setSelectedSem("");
                        resetForm();
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
                >
                    <option value="">Select Semester</option>
                    {selectedCourseData &&
                        Array.from({ length: selectedCourseData.total_semesters }, (_, i) => i + 1)
                            .map((sem) => (
                                <option key={sem} value={sem}>
                                    {selectedCourseData.sem_or_year === "year"
                                        ? `Year ${sem}`
                                        : `Semester ${sem}`}
                                </option>
                            ))}
                </select>
            </div>

            {/* FORM */}
            {selectedCourse && selectedSem && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide mb-6">
                        {editingCode ? "Edit Subject" : "Add New Subject"}
                    </h3>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
                        {!editingCode && (
                            <input
                                name="subjectcode"
                                placeholder="Subject Code"
                                value={form.subjectcode}
                                onChange={handleFormChange}
                                required
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
                            />
                        )}

                        <input
                            name="subjectname"
                            placeholder="Subject Name"
                            value={form.subjectname}
                            onChange={handleFormChange}
                            required
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
                        />

                        <select
                            name="subjecttype"
                            value={form.subjecttype}
                            onChange={handleFormChange}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
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
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
                        />

                        <input
                            type="number"
                            name="practicalmarks"
                            placeholder="Practical"
                            value={form.practicalmarks}
                            onChange={handleFormChange}
                            required
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
                        />

                        {/* UPDATED: Buttons now stack and span full width on mobile, right-aligned on desktop */}
                        <div className="sm:col-span-2 md:col-span-5 flex flex-col sm:flex-row sm:justify-end gap-3 mt-2 w-full">
                            {editingCode && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="w-full sm:w-auto px-3 py-1.5 sm:px-5 sm:py-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-100 text-gray-800 text-xs sm:text-sm rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto px-3 py-1.5 sm:px-5 sm:py-2 bg-gray-900 text-white text-xs sm:text-sm rounded-md hover:bg-black transition disabled:opacity-60"
                            >
                                {editingCode ? "Update Subject" : "Add Subject"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* SUBJECT LIST TABLE */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
                        <tr>
                            <th className="p-4">Code</th>
                            <th className="p-4">Name</th>

                            {/* Hidden on mobile */}
                            <th className="hidden sm:table-cell p-4">Type</th>
                            <th className="hidden sm:table-cell p-4">Theory</th>
                            <th className="hidden sm:table-cell p-4">Practical</th>

                            <th className="p-4">Actions</th>
                        </tr>
                        </thead>

                        <tbody>
                        {subjects.map((sub) => (
                            <tr
                                key={sub.subjectcode}
                                className="border-t dark:border-gray-700"
                            >
                                <td className="p-4 dark:text-gray-200">
                                    {sub.subjectcode}
                                </td>

                                <td className="p-4 dark:text-gray-200">
                                    {sub.subjectname}
                                </td>

                                {/* Hidden on mobile */}
                                <td className="hidden sm:table-cell p-4 capitalize dark:text-gray-200">
                                    {sub.subjecttype}
                                </td>

                                <td className="hidden sm:table-cell p-4 dark:text-gray-200">
                                    {sub.theorymarks}
                                </td>

                                <td className="hidden sm:table-cell p-4 dark:text-gray-200">
                                    {sub.practicalmarks}
                                </td>

                                <td className="p-4 dark:text-gray-200">
                                    {/* UPDATED: Table buttons span full width on mobile */}
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <button
                                            onClick={() => handleEdit(sub)}
                                            className="w-full sm:w-auto px-2 py-1 text-xs sm:text-sm bg-gray-200 dark:bg-gray-600 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => {
                                                setSubjectToDelete(sub.subjectcode);
                                                setShowDeleteModal(true);
                                            }}
                                            className="w-full sm:w-auto px-2 py-1 text-xs sm:text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                                        >
                                            Delete
                                        </button>
                                    </div>
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
                message="Are you sure you want to delete this subject? This action cannot be undone."
                loading={loading}
                onCancel={() => {
                    setShowDeleteModal(false);
                    setSubjectToDelete(null);
                }}
                onConfirm={handleDelete}
            />

            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default Subjects;