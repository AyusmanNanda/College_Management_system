import { useEffect, useState } from "react";
import api from "../../utils/api";
import ConfirmDeleteModal from "./modals/ConfirmDeleteModal.jsx";
import Toast from "./Toast.jsx";
import {
    Library,
    PlusCircle,
    Edit2,
    Trash2,
    X,
    CheckCircle2,
    AlertCircle
} from "lucide-react";

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

    const [toast, setToast] = useState(null);

    /* ================= DATA ENGINE ================= */
    const fetchCourses = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const res = await api.get("/api/courses", { headers: { Authorization: `Bearer ${token}` } });
            setCourses(res.data);
            setError("");
        } catch (err) {
            console.error(err);
            setError("Failed to load courses from the server.");
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
            setError("Total semesters/years must be greater than 0.");
            return;
        }

        try {
            setLoading(true);
            if (editingId) {
                await api.put(`/api/courses/${editingId}`, form, { headers: { Authorization: `Bearer ${token}` } });
                setToast({ type: "success", message: "Course updated successfully!" });
            } else {
                await api.post("/api/courses", form, { headers: { Authorization: `Bearer ${token}` } });
                setToast({ type: "success", message: "Course added successfully!" });
            }

            setForm({ course_code: "", course_name: "", sem_or_year: "sem", total_semesters: "" });
            setEditingId(null);
            setError("");
            fetchCourses();
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.message || "Operation failed. Please verify data.";
            setError(errorMessage);
            setToast({ type: "error", message: errorMessage });
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
            await api.delete(`/api/courses/${courseToDelete}`, { headers: { Authorization: `Bearer ${token}` } });
            setToast({ type: "success", message: "Course deleted successfully." });
            fetchCourses();
            setError("");
        } catch (err) {
            console.error(err);
            setError("Dependency conflict: Failed to delete course.");
            setToast({ type: "error", message: "Failed to delete course." });
        } finally {
            setLoading(false);
            setShowDeleteModal(false);
            setCourseToDelete(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans pb-12">

            {/* PLATFORM HEADER - GLASSMORPHISM */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 text-white rounded-lg shadow-md shadow-blue-500/20">
                            <Library className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight leading-tight">Course Management</h1>
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:block">Academic Configuration</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">

                {/* ERROR STATE */}
                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm font-semibold animate-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {/* FORM CARD */}
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4 sm:p-6 transition-all relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-6">
                        {editingId ? <Edit2 className="w-4 h-4 text-blue-500" /> : <PlusCircle className="w-4 h-4 text-blue-500" />}
                        <h2 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                            {editingId ? "Edit Course" : "Add New Course"}
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <InputField name="course_code" value={form.course_code} onChange={handleChange} placeholder="Course Code" />
                        <InputField name="course_name" value={form.course_name} onChange={handleChange} placeholder="Course Name" />

                        <div className="w-full">
                            <select name="sem_or_year" value={form.sem_or_year} onChange={handleChange}
                                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                                <option value="sem">Semester</option>
                                <option value="year">Year</option>
                            </select>
                        </div>

                        <InputField type="number" name="total_semesters" value={form.total_semesters} onChange={handleChange} placeholder="Total" min="1" />

                        {/* ACTION BUTTONS */}
                        <div className="md:col-span-4 flex flex-col sm:flex-row sm:justify-end gap-3 mt-2 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                            {editingId && (
                                <button type="button" onClick={() => { setEditingId(null); setForm({ course_code: "", course_name: "", sem_or_year: "sem", total_semesters: "" }); }}
                                        className="w-full sm:w-auto px-5 py-2.5 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95">
                                    <X className="w-4 h-4" /> Cancel
                                </button>
                            )}
                            <button type="submit" disabled={loading}
                                    className="w-full sm:w-auto px-6 py-2.5 flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-70 disabled:active:scale-100">
                                {editingId ? <CheckCircle2 className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                                {editingId ? "Update Course" : "Add Course"}
                            </button>
                        </div>
                    </form>
                </section>

                {/* DATA TABLE CARD - ZERO HORIZONTAL SCROLL ON MOBILE */}
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                        <table className="w-full table-fixed">
                            <thead>
                            <tr>
                                <th className="w-[30%] sm:w-[15%] px-4 sm:px-6 py-3.5 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Code</th>
                                <th className="w-[45%] sm:w-[35%] px-2 sm:px-4 py-3.5 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Course Name</th>
                                <th className="hidden sm:table-cell sm:w-[15%] px-4 py-3.5 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                                <th className="hidden sm:table-cell sm:w-[15%] px-4 py-3.5 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                                <th className="w-[25%] sm:w-[20%] px-4 sm:px-6 py-3.5 text-right sm:text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                            </thead>
                        </table>
                    </div>

                    <div className="w-full">
                        <table className="w-full table-fixed">
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {courses.length > 0 ? courses.map((course, idx) => (
                                <tr key={course.id} className={`${idx % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/50 dark:bg-slate-800/20'} hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-colors`}>
                                    <td className="w-[30%] sm:w-[15%] px-4 sm:px-6 py-4">
                                        <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{course.course_code}</div>
                                    </td>
                                    <td className="w-[45%] sm:w-[35%] px-2 sm:px-4 py-4">
                                        <div className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 truncate" title={course.course_name}>{course.course_name}</div>
                                    </td>
                                    <td className="hidden sm:table-cell sm:w-[15%] px-4 py-4 text-center">
                                            <span className="inline-flex items-center px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-600 dark:text-slate-400 capitalize tracking-wider">
                                                {course.sem_or_year}
                                            </span>
                                    </td>
                                    <td className="hidden sm:table-cell sm:w-[15%] px-4 py-4 text-center">
                                        <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{course.total_semesters}</div>
                                    </td>
                                    <td className="w-[25%] sm:w-[20%] px-4 sm:px-6 py-3 text-right sm:text-center">
                                        <div className="flex items-center justify-end sm:justify-center gap-1 sm:gap-2">
                                            <button onClick={() => handleEdit(course)}
                                                    className="p-2 sm:px-3 sm:py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 rounded-lg transition-colors flex items-center justify-center"
                                                    title="Edit Course">
                                                <Edit2 className="w-4 h-4" />
                                                <span className="hidden xl:inline text-xs font-bold ml-2">Edit</span>
                                            </button>
                                            <button onClick={() => { setCourseToDelete(course.id); setShowDeleteModal(true); }}
                                                    className="p-2 sm:px-3 sm:py-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors flex items-center justify-center"
                                                    title="Delete Course">
                                                <Trash2 className="w-4 h-4" />
                                                <span className="hidden xl:inline text-xs font-bold ml-2">Delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                                        No courses found.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            <ConfirmDeleteModal
                show={showDeleteModal}
                title="Confirm Deletion"
                message="Are you sure you want to delete this course? This action cannot be undone."
                loading={loading}
                onCancel={() => { setShowDeleteModal(false); setCourseToDelete(null); }}
                onConfirm={handleDelete}
            />

            {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
};

/* ================= COMPONENT: INPUT FIELD ================= */
const InputField = ({ type = "text", name, value, onChange, placeholder, min }) => (
    <div className="w-full">
        <input
            type={type} name={name} value={value} onChange={onChange} required min={min} placeholder={placeholder}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
    </div>
);

export default Courses;