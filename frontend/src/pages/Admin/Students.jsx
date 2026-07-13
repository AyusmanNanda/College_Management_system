import { useEffect, useState } from "react";
import api from "../../utils/api";
import StudentProfile from "./StudentProfile";
import ConfirmDeleteModal from "./modals/ConfirmDeleteModal.jsx";
import ImportStudentModal from "./modals/ImportStudentModal.jsx";
import Toast from "./Toast.jsx";
import {
    Users,
    Search,
    Filter,
    Plus,
    UploadCloud,
    Edit2,
    Trash2,
    AlertCircle,
    ListChecks
} from "lucide-react";

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
    const [showImportModal, setShowImportModal] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [toast, setToast] = useState(null);

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

            setToast({ type: "success", message: "Student deleted successfully." });
            fetchStudents();
        } catch (err) {
            console.error(err);
            setError("Failed to delete student.");
            setToast({ type: "error", message: "Failed to delete student." });
        } finally {
            setShowDeleteModal(false);
            setStudentToDelete(null);
        }
    };

    /* ================= FILTER ================= */

    const filteredStudents = students.filter((student) => {
        const fullName = `${student.firstname} ${student.lastname || ""}`;

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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans pb-12">

            {/* PLATFORM HEADER - GLASSMORPHISM */}
            <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 text-white rounded-lg shadow-md shadow-blue-500/20">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight leading-tight">Student Directory</h1>
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:block">User Management</p>
                        </div>
                    </div>

                    {/* GLOBAL ACTIONS */}
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowImportModal(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors active:scale-95">
                            <UploadCloud className="w-4 h-4" />
                            <span className="hidden sm:inline">Import Data</span>
                        </button>
                        <button onClick={() => { setIsNew(true); setSelectedStudent({}); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors shadow-sm shadow-blue-500/20 active:scale-95">
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Add Student</span>
                        </button>
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

                {/* FILTER & SEARCH CARD */}
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4 sm:p-6 transition-all">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="w-4 h-4 text-blue-500" />
                        <h2 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Search & Filter</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-slate-400" />
                            </div>
                            <input type="text" placeholder="Search name or email..." value={search} onChange={(e) => setSearch(e.target.value)}
                                   className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                        </div>

                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                            <option value="">All Statuses</option>
                            <option value="1">Active Students</option>
                            <option value="0">Inactive Students</option>
                        </select>

                        <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                            <option value="">All Courses</option>
                            {courses.map((course) => (
                                <option key={course.id} value={course.course_code}>{course.course_name}</option>
                            ))}
                        </select>
                    </div>
                </section>

                {/* STUDENT DIRECTORY TABLE - ZERO HORIZONTAL SCROLL ON MOBILE */}
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                        <table className="w-full table-fixed">
                            <thead>
                            <tr>
                                <th className="w-[15%] sm:w-[8%] px-2 sm:px-4 py-3.5 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">DP</th>
                                <th className="w-[55%] sm:w-[27%] px-2 sm:px-4 py-3.5 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Student Profile</th>
                                <th className="hidden md:table-cell w-[20%] px-4 py-3.5 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Course Setup</th>
                                <th className="hidden md:table-cell w-[10%] px-2 py-3.5 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Sem</th>
                                <th className="hidden sm:table-cell sm:w-[15%] px-4 py-3.5 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="w-[30%] sm:w-[20%] px-2 sm:px-4 py-3.5 text-right sm:text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                            </thead>
                        </table>
                    </div>

                    <div className="w-full">
                        <table className="w-full table-fixed">
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                                        Loading student registry...
                                    </td>
                                </tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-4 border border-slate-100 dark:border-slate-800">
                                                <ListChecks className="w-8 h-8 text-slate-400" />
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Records Found</h3>
                                            <p className="text-xs text-slate-500 mt-1">Adjust your search or filter parameters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student, idx) => (
                                    <tr key={student.sr_no} className={`${idx % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/50 dark:bg-slate-800/20'} hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-colors`}>
                                        <td className="w-[15%] sm:w-[8%] px-2 sm:px-4 py-3 text-center">
                                            <img
                                                src={student.profilepic ? `${BASE_URL}/uploads/students/${student.profilepic}` : `${BASE_URL}/uploads/students/default.png`}
                                                alt="profile"
                                                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm mx-auto"
                                            />
                                        </td>

                                        <td className="w-[55%] sm:w-[27%] px-2 sm:px-4 py-3">
                                            <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                                                {student.firstname} {student.lastname}
                                            </div>
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate">
                                                {student.rollnumber}
                                            </div>
                                        </td>

                                        <td className="hidden md:table-cell w-[20%] px-4 py-3">
                                            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                                                {student.Courcecode}
                                            </div>
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                                {courses.find((c) => c.course_code === student.Courcecode)?.course_name || "Unknown"}
                                            </div>
                                        </td>

                                        <td className="hidden md:table-cell w-[10%] px-2 py-3 text-center">
                                            <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                                                {student.semoryear}
                                            </div>
                                        </td>

                                        <td className="hidden sm:table-cell sm:w-[15%] px-4 py-3 text-center">
                                            {student.activestatus ? (
                                                <span className="px-2.5 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded uppercase tracking-wider border border-emerald-200 dark:border-emerald-500/20">
                                                        Active
                                                    </span>
                                            ) : (
                                                <span className="px-2.5 py-1 text-[10px] font-bold bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 rounded uppercase tracking-wider border border-red-200 dark:border-red-500/20">
                                                        Inactive
                                                    </span>
                                            )}
                                        </td>

                                        <td className="w-[30%] sm:w-[20%] px-2 sm:px-4 py-3 text-right sm:text-center">
                                            <div className="flex items-center justify-end sm:justify-center gap-1 sm:gap-2">
                                                <button onClick={() => { setIsNew(false); setSelectedStudent(student); }}
                                                        className="p-1.5 sm:px-3 sm:py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 rounded-lg transition-colors flex items-center justify-center"
                                                        title="Edit Student">
                                                    <Edit2 className="w-4 h-4" />
                                                    <span className="hidden xl:inline text-xs font-bold ml-2">Edit</span>
                                                </button>
                                                <button onClick={() => { setStudentToDelete(student.sr_no); setShowDeleteModal(true); }}
                                                        className="p-1.5 sm:px-3 sm:py-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors flex items-center justify-center"
                                                        title="Delete Student">
                                                    <Trash2 className="w-4 h-4" />
                                                    <span className="hidden xl:inline text-xs font-bold ml-2">Delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            {/* MODALS & TOASTS (Logic untouched) */}
            <ConfirmDeleteModal
                show={showDeleteModal}
                title="Authorization Required"
                message="Are you sure you want to delete this student record? This action cannot be reversed."
                loading={loading}
                onCancel={() => { setShowDeleteModal(false); setStudentToDelete(null); }}
                onConfirm={handleDelete}
            />

            {showImportModal && (
                <ImportStudentModal
                    token={token}
                    onClose={() => setShowImportModal(false)}
                    onImportSuccess={() => { fetchStudents(); setToast({ type: "success", message: "Student records imported successfully!" }); }}
                />
            )}

            {selectedStudent !== null && (
                <StudentProfile
                    student={selectedStudent}
                    isNew={isNew}
                    onClose={() => setSelectedStudent(null)}
                    onUpdated={() => { fetchStudents(); setToast({ type: "success", message: "Student profile saved successfully!" }); }}
                />
            )}

            {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
};

export default Students;