import { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";
import ConfirmSaveModal from "./modals/ConfirmSaveModal.jsx";
import Toast from "./Toast.jsx";
import { GraduationCap, Filter, ListChecks, Save, RotateCcw, CheckCircle2, AlertCircle } from "lucide-react";

const EnterMarks = () => {
    const token = localStorage.getItem("token");

    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);

    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedSem, setSelectedSem] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");

    const [subjectDetails, setSubjectDetails] = useState(null);
    const [marks, setMarks] = useState({});

    const [error, setError] = useState("");
    const [toast, setToast] = useState(null);
    const [showSaveModal, setShowSaveModal] = useState(false);

    /* ================= ACTION: RESET ================= */
    const handleReset = () => {
        setSelectedCourse(""); setSelectedSem(""); setSelectedSubject("");
        setStudents([]); setMarks({}); setSubjectDetails(null); setError("");
    };

    /* ================= UX HELPERS (PRESERVED) ================= */
    const preventSymbols = (e) => {
        if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 || (e.keyCode >= 35 && e.keyCode <= 39)) return;
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) e.preventDefault();
    };

    const handleEnterMove = (e) => {
        const table = e.target.closest("table");
        const inputs = Array.from(table.querySelectorAll("input[type='number']"));
        const index = inputs.indexOf(e.target);
        if (e.key === "Enter") {
            e.preventDefault();
            if (inputs[index + 1]) { inputs[index + 1].focus(); inputs[index + 1].select(); }
        }
        if (e.key === "ArrowDown") if (inputs[index + 1]) inputs[index + 1].focus();
        if (e.key === "ArrowUp") if (inputs[index - 1]) inputs[index - 1].focus();
    };

    const handleFocus = (e) => e.target.select();

    /* ================= DATA ENGINE (PRESERVED) ================= */
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await api.get("/api/courses", { headers: { Authorization: `Bearer ${token}` } });
                setCourses(res.data || []);
            } catch { setCourses([]); }
        };
        fetchCourses();
    }, [token]);

    const selectedCourseObj = useMemo(() => courses.find(c => c.course_code === selectedCourse), [courses, selectedCourse]);
    const semLabel = selectedCourseObj?.sem_or_year?.toLowerCase() === "year" ? "Year" : "Semester";
    const semesterOptions = useMemo(() => {
        if (!selectedCourseObj) return [];
        return Array.from({ length: Number(selectedCourseObj.total_semesters) }, (_, i) => i + 1);
    }, [selectedCourseObj]);

    useEffect(() => {
        if (!selectedCourse || !selectedSem) return;
        const loadSubjects = async () => {
            try {
                const res = await api.get(`/api/subjects?course_code=${selectedCourse}&sem=${selectedSem}`, { headers: { Authorization: `Bearer ${token}` } });
                setSubjects(res.data || []);
                setStudents([]); setMarks({}); setSelectedSubject(""); setSubjectDetails(null);
            } catch { setError("Failed to load subjects."); }
        };
        loadSubjects();
    }, [selectedCourse, selectedSem, token]);

    const handleSubjectChange = async (code) => {
        setSelectedSubject(code);
        const subject = subjects.find(s => s.subjectcode === code);
        setSubjectDetails(subject);
        try {
            const res = await api.get(`/api/marks/students?course=${selectedCourse}&sem=${selectedSem}`, { headers: { Authorization: `Bearer ${token}` } });
            setStudents(res.data || []);
        } catch { setError("Failed to load students."); }
    };

    const handleMarkChange = (roll, field, value) => {
        const sanitizedValue = value === "" ? "" : Math.max(0, parseInt(value, 10));
        setMarks(prev => ({ ...prev, [roll]: { ...prev[roll], [field]: sanitizedValue } }));
    };

    const handleOpenModal = () => {
        if (!subjectDetails) return;
        for (const student of students) {
            if ((marks[student.rollnumber]?.theory ?? "") === "") {
                setToast({ type: "error", message: `Missing theory score for ${student.firstname}` });
                return;
            }
        }
        setShowSaveModal(true);
    };

    const saveMarks = async () => {
        try {
            const records = students.map(student => ({
                rollnumber: student.rollnumber,
                theorymarks: marks[student.rollnumber]?.theory || 0,
                practicalmarks: marks[student.rollnumber]?.practical || 0
            }));
            await api.post("/api/marks/save", {
                course: selectedCourse, sem: Number(selectedSem),
                subject: selectedSubject, subjectname: subjectDetails?.subjectname,
                marks: records
            }, { headers: { Authorization: `Bearer ${token}` } });
            setToast({ type: "success", message: "Student marks successfully recorded." });
            setShowSaveModal(false);
        } catch { setToast({ type: "error", message: "Failed to synchronize with server." }); }
    };

    const isFormComplete = selectedCourse && selectedSem && selectedSubject && students.length > 0;
    const hasPractical = subjectDetails?.practicalmarks > 0;

    return (
        <div className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">

            {/* PLATFORM HEADER */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-md shadow-indigo-500/20">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight leading-tight">Marks Entry</h1>
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:block">Faculty Dashboard</p>
                        </div>
                    </div>
                    <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
                        <RotateCcw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Reset Form</span>
                    </button>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 space-y-6">

                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm font-semibold">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {/* FILTER CARD */}
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4 sm:p-6 transition-all">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="w-4 h-4 text-indigo-500" />
                        <h2 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Class Settings</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <select value={selectedCourse} onChange={(e) => { setSelectedCourse(e.target.value); setSelectedSem(""); setError(""); }}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer">
                            <option value="">Select Course...</option>
                            {courses.map(course => <option key={course.id} value={course.course_code}>{course.course_name}</option>)}
                        </select>
                        <select value={selectedSem} disabled={!selectedCourse} onChange={(e) => { setSelectedSem(e.target.value); setSelectedSubject(""); setError(""); }}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm disabled:opacity-50 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer">
                            <option value="">Select {semLabel} {semesterOptions.length > 0 ? '...' : ''}</option>
                            {semesterOptions.map(num => <option key={num} value={num}>{semLabel} {num}</option>)}
                        </select>
                        <select value={selectedSubject} disabled={!selectedSem} onChange={(e) => { handleSubjectChange(e.target.value); setError(""); }}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm disabled:opacity-50 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer">
                            <option value="">Select Subject...</option>
                            {subjects.map(sub => <option key={sub.subjectcode} value={sub.subjectcode}>{sub.subjectname}</option>)}
                        </select>
                    </div>
                </section>

                {selectedSubject && students.length > 0 ? (
                    /* DATA TABLE - ANIMATION REMOVED */
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all">

                        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                            <table className="w-full table-fixed">
                                <thead>
                                <tr>
                                    <th className={`${hasPractical ? 'w-[40%]' : 'w-[50%]'} px-4 sm:px-6 py-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider`}>Student Profile</th>
                                    <th className={`${hasPractical ? 'w-[25%]' : 'w-[30%]'} px-2 sm:px-4 py-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider`}>Theory</th>
                                    {hasPractical && <th className="w-[25%] px-2 sm:px-4 py-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Pract.</th>}
                                    <th className="hidden sm:table-cell w-[10%] px-4 py-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                                </tr>
                                </thead>
                            </table>
                        </div>

                        <div className="w-full">
                            <table className="w-full table-fixed">
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {students.map((student, idx) => {
                                    const theoryVal = marks[student.rollnumber]?.theory;
                                    const practicalVal = marks[student.rollnumber]?.practical;
                                    const total = (Number(theoryVal) || 0) + (Number(practicalVal) || 0);

                                    const isTheoryErr = Number(theoryVal) > subjectDetails?.theorymarks;
                                    const isPractErr = Number(practicalVal) > subjectDetails?.practicalmarks;

                                    return (
                                        <tr key={student.rollnumber} className={`${idx % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/50 dark:bg-slate-800/20'} hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-colors`}>
                                            <td className={`${hasPractical ? 'w-[40%]' : 'w-[50%]'} px-4 sm:px-6 py-4`}>
                                                <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{student.firstname} {student.lastname}</div>
                                                <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{student.rollnumber}</div>
                                            </td>
                                            <td className={`${hasPractical ? 'w-[25%]' : 'w-[30%]'} px-2 sm:px-4 py-4 text-center align-middle`}>
                                                <input
                                                    type="number"
                                                    value={theoryVal ?? ""}
                                                    onChange={(e) => handleMarkChange(student.rollnumber, "theory", e.target.value)}
                                                    onKeyDown={(e) => { preventSymbols(e); handleEnterMove(e); }}
                                                    onFocus={handleFocus}
                                                    className={`w-full max-w-[70px] sm:max-w-[90px] mx-auto px-2 py-2 bg-white dark:bg-slate-950 border rounded-lg text-sm text-center font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all
                                                        ${isTheoryErr ? 'border-red-500 ring-2 ring-red-500/50 text-red-600' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500'}`}
                                                />
                                            </td>
                                            {hasPractical && (
                                                <td className="w-[25%] px-2 sm:px-4 py-4 text-center align-middle">
                                                    <input
                                                        type="number"
                                                        value={practicalVal ?? ""}
                                                        onChange={(e) => handleMarkChange(student.rollnumber, "practical", e.target.value)}
                                                        onKeyDown={(e) => { preventSymbols(e); handleEnterMove(e); }}
                                                        onFocus={handleFocus}
                                                        className={`w-full max-w-[70px] sm:max-w-[90px] mx-auto px-2 py-2 bg-white dark:bg-slate-950 border rounded-lg text-sm text-center font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all
                                                            ${isPractErr ? 'border-red-500 ring-2 ring-red-500/50 text-red-600' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500'}`}
                                                    />
                                                </td>
                                            )}
                                            <td className="hidden sm:table-cell w-[10%] px-4 py-4 text-center align-middle">
                                                <span className="text-xs font-black text-slate-600 dark:text-slate-400">
                                                    {total}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    /* EMPTY STATE */
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center px-4 shadow-sm">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-4 border border-slate-100 dark:border-slate-800">
                            <ListChecks className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Awaiting Configuration</h2>
                        <p className="text-sm text-slate-500 mt-1 max-w-xs">Select class parameters to load the grading ledger.</p>
                    </div>
                )}
            </main>

            {/* STICKY BOTTOM ACTION BAR */}
            {selectedSubject && students.length > 0 && (
                <div className="sticky bottom-0 mt-auto w-full z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 p-4 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                        <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-500">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            Ready to save {students.length} students
                        </div>
                        <button onClick={handleOpenModal} disabled={!isFormComplete}
                                className="w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
                            <Save className="w-4 h-4" /> Save Marks
                        </button>
                    </div>
                </div>
            )}

            <ConfirmSaveModal show={showSaveModal} title="Confirm Grade Submission" message={`Are you sure you want to save scores for ${subjectDetails?.subjectname}?`} confirmText="Save Marks" onCancel={() => setShowSaveModal(false)} onConfirm={saveMarks} />
            {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
};

export default EnterMarks;