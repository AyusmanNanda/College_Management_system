import { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";
import ConfirmSaveModal from "../Admin/modals/ConfirmSaveModal";
import { 
    ClipboardEdit, 
    Filter, 
    RotateCcw, 
    Save, 
    AlertCircle, 
    ListChecks, 
    CheckCircle2,
    Calendar,
    BookOpen,
    UserCheck,
    Loader2
} from "lucide-react";

// Refined InfoCard to match the new aesthetic
function InfoCard({ label, value, icon: Icon }) {
    return (
        <div className="bg-slate-50/50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4">
            {Icon && (
                <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-indigo-500">
                    <Icon className="w-4 h-4" />
                </div>
            )}
            <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{value || "-"}</p>
            </div>
        </div>
    );
}

export default function FacultyEditAttendance() {
    const token = localStorage.getItem("token");

    // Existing State (Untouched)
    const [assignedSubjects, setAssignedSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [attendanceDates, setAttendanceDates] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [checkedStudents, setCheckedStudents] = useState({});
    const [loadingSubjects, setLoadingSubjects] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [loadingAttendance, setLoadingAttendance] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [warning, setWarning] = useState("");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [savingAttendance, setSavingAttendance] = useState(false);

    // Existing Logic (Untouched)
    const todayDate = useMemo(() => {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, "0");
        const d = String(today.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }, []);

    const handleReset = () => {
        setSelectedSubject("");
        setSelectedDate("");
        setCheckedStudents({});
        setStudents([]);
        setAttendanceDates([]);
        setError("");
        setSuccess("");
    };

    useEffect(() => {
        const fetchAssignedSubjects = async () => {
            try {
                setLoadingSubjects(true);
                setError("");
                const res = await api.get("/api/faculty/assigned-subjects", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAssignedSubjects(res.data || []);
            } catch (err) {
                setAssignedSubjects([]);
                setError("Failed to load assigned subjects.");
            } finally {
                setLoadingSubjects(false);
            }
        };
        if (token) fetchAssignedSubjects();
    }, [token]);

    const selectedSubjectObj = useMemo(() => {
        return assignedSubjects.find((item) => String(item.subjectcode) === String(selectedSubject));
    }, [assignedSubjects, selectedSubject]);

    const selectedCourse = selectedSubjectObj?.courcecode || "";
    const selectedSem = selectedSubjectObj?.semoryear || "";
    const canEdit = selectedDate === todayDate;

    useEffect(() => {
        if (!selectedSubject || !selectedCourse || !selectedSem) {
            setStudents([]);
            setAttendanceDates([]);
            setSelectedDate("");
            setCheckedStudents({});
            return;
        }
        const fetchStudents = async () => {
            try {
                setLoadingStudents(true);
                setError("");
                const res = await api.get(`/api/attendance/students?course=${selectedCourse}&sem=${selectedSem}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setStudents(res.data || []);
            } catch (err) {
                setStudents([]);
                setError("Failed to load students.");
            } finally {
                setLoadingStudents(false);
            }
        };
        fetchStudents();
    }, [selectedCourse, selectedSem, selectedSubject, token]);

    useEffect(() => {
        if (!selectedSubject || !selectedCourse || !selectedSem) {
            setAttendanceDates([]);
            return;
        }
        const fetchDates = async () => {
            try {
                const res = await api.get(`/api/attendance/dates?subjectcode=${selectedSubject}&courcecode=${selectedCourse}&semoryear=${selectedSem}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAttendanceDates((res.data || []).map((item) => item.date));
            } catch (err) {
                setAttendanceDates([]);
            }
        };
        fetchDates();
    }, [selectedSubject, selectedCourse, selectedSem, token]);

    useEffect(() => {
        if (!selectedCourse || !selectedSem || !selectedSubject || !selectedDate || students.length === 0) return;
        const loadAttendance = async () => {
            try {
                setLoadingAttendance(true);
                const res = await api.get(`/api/attendance?subjectcode=${selectedSubject}&date=${selectedDate}&courcecode=${selectedCourse}&semoryear=${selectedSem}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const map = {};
                students.forEach((s) => map[Number(s.student_id)] = false);
                (res.data || []).forEach((record) => {
                    map[Number(record.student_id)] = Number(record.present) === 1;
                });
                setCheckedStudents(map);
            } catch (err) {
                setError("Failed to load attendance.");
            } finally {
                setLoadingAttendance(false);
            }
        };
        loadAttendance();
    }, [selectedCourse, selectedSem, selectedSubject, selectedDate, students, token]);

    useEffect(() => {
        if (!selectedDate) { setWarning(""); return; }
        if (selectedDate !== todayDate) {
            setWarning("Attendance can only be edited on today's date.");
            const timer = setTimeout(() => setWarning(""), 3000);
            return () => clearTimeout(timer);
        }
        setWarning("");
    }, [selectedDate, todayDate]);

    const toggleStudent = (id) => {
        if (!canEdit) return;
        setCheckedStudents((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const updateAttendance = async () => {
        setShowConfirmModal(false);
        try {
            setSavingAttendance(true);
            const records = students.map((student) => ({
                student_id: student.student_id,
                present: checkedStudents[student.student_id] ? 1 : 0,
            }));
            await api.post("/api/attendance", {
                subjectcode: selectedSubject,
                date: selectedDate,
                courcecode: selectedCourse,
                semoryear: Number(selectedSem),
                records,
            }, { headers: { Authorization: `Bearer ${token}` } });
            setSuccess("Attendance updated successfully.");
            setTimeout(() => handleReset(), 1500);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to update attendance.");
        } finally {
            setSavingAttendance(false);
        }
    };

    const isReady = selectedSubject && selectedCourse && selectedSem && selectedDate;

    return (
        <div className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">
            
            {/* FIXED HEADER - CHANGED FROM sticky TO relative SO IT SCROLLS UP */}
            <header className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-md shadow-indigo-500/20">
                            <ClipboardEdit className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight leading-tight">Faculty Portal</h1>
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:block">Edit Attendance Record</p>
                        </div>
                    </div>
                    <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
                        <RotateCcw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Reset Form</span>
                    </button>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 space-y-6 pb-24">
                
                {/* NOTIFICATIONS */}
                {(error || success || warning) && (
                    <div className="space-y-3 animate-in slide-in-from-top-2">
                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm font-semibold">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}
                        {success && (
                            <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                <p>{success}</p>
                            </div>
                        )}
                        {warning && (
                            <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl text-amber-700 dark:text-amber-400 text-sm font-semibold">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p>{warning}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* FILTER CARD */}
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4 sm:p-6 transition-all">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="w-4 h-4 text-indigo-500" />
                        <h2 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Selection Filters</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Subject</label>
                            <select 
                                value={selectedSubject} 
                                onChange={(e) => { setSelectedSubject(e.target.value); setSelectedDate(""); setCheckedStudents({}); setError(""); setSuccess(""); }}
                                disabled={loadingSubjects}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer disabled:opacity-50"
                            >
                                <option value="">{loadingSubjects ? "Loading..." : "Choose Subject"}</option>
                                {assignedSubjects.map((sub, idx) => (
                                    <option key={`${sub.subjectcode}-${idx}`} value={sub.subjectcode}>{sub.subjectname}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Date</label>
                            <select 
                                value={selectedDate} 
                                onChange={(e) => { setSelectedDate(e.target.value); setError(""); setSuccess(""); }}
                                disabled={!selectedSubject}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer disabled:opacity-50"
                            >
                                <option value="">Select Date</option>
                                {attendanceDates.map((date, idx) => (
                                    <option key={`${date}-${idx}`} value={date}>{date}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </section>

                {/* INFO CARDS GRID */}
                {selectedSubjectObj && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-500">
                        <InfoCard label="Course Code" value={selectedCourse} icon={BookOpen} />
                        <InfoCard label="Sem / Year" value={selectedSem} icon={RotateCcw} />
                        <InfoCard label="Status" value={canEdit ? "Editing Enabled" : "Read Only"} icon={Calendar} />
                    </div>
                )}

                {/* ATTENDANCE TABLE */}
                {isReady ? (
                    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                            <table className="w-full table-fixed">
                                <thead>
                                    <tr>
                                        <th className="w-[35%] sm:w-[25%] px-4 sm:px-6 py-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Roll No</th>
                                        <th className="w-[45%] sm:w-[50%] px-2 sm:px-4 py-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
                                        <th className="w-[20%] sm:w-[25%] px-4 sm:px-6 py-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Present</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>

                        <div className="w-full">
                            <table className="w-full table-fixed">
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                    {loadingStudents || loadingAttendance ? (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center gap-2 text-slate-500">
                                                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                                                    <p className="text-sm font-medium tracking-tight">Syncing records...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : students.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-12 text-center text-slate-500 text-sm">No students enrolled.</td>
                                        </tr>
                                    ) : (
                                        students.map((student, idx) => (
                                            <tr 
                                                key={student.student_id} 
                                                className={`${idx % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/30 dark:bg-slate-800/10'} hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-colors cursor-pointer`}
                                                onClick={() => toggleStudent(student.student_id)}
                                            >
                                                <td className="w-[35%] sm:w-[25%] px-4 sm:px-6 py-4">
                                                    <div className="text-[11px] sm:text-xs font-mono font-bold text-slate-600 dark:text-slate-400 truncate">{student.rollnumber}</div>
                                                </td>
                                                <td className="w-[45%] sm:w-[50%] px-2 sm:px-4 py-4">
                                                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                                                        {student.firstname} {student.lastname}
                                                    </div>
                                                </td>
                                                <td className="w-[20%] sm:w-[25%] px-4 sm:px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        checked={!!checkedStudents[student.student_id]}
                                                        onChange={() => toggleStudent(student.student_id)}
                                                        disabled={!canEdit}
                                                        className="h-5 w-5 rounded border-slate-300 dark:border-slate-600 text-indigo-600 bg-white dark:bg-slate-900 focus:ring-indigo-500 disabled:opacity-40 transition-colors cursor-pointer"
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center px-4 shadow-sm">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-4 border border-slate-100 dark:border-slate-800">
                            <ListChecks className="w-8 h-8 text-indigo-500" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Fetch Records</h2>
                        <p className="text-sm text-slate-500 mt-1 max-w-xs">Select a subject and date to begin editing today&apos;s attendance.</p>
                    </div>
                )}
            </main>

            {/* STICKY BOTTOM ACTION BAR */}
            {isReady && students.length > 0 && (
                <div className="sticky bottom-0 mt-auto w-full z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 p-4 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                        <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-500">
                            {canEdit ? (
                                <>
                                    <UserCheck className="w-4 h-4 text-emerald-500" />
                                    <span>Updating record for {selectedDate}</span>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="w-4 h-4 text-amber-500" />
                                    <span>Historical records are read-only</span>
                                </>
                            )}
                        </div>
                        <div className="flex w-full sm:w-auto items-center justify-end gap-3">
                            <button 
                                onClick={() => setShowConfirmModal(true)}
                                disabled={!canEdit || savingAttendance}
                                className="w-full sm:w-auto px-8 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 disabled:opacity-40 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {savingAttendance ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Update Attendance</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODALS */}
            <ConfirmSaveModal
                show={showConfirmModal}
                title="Confirm Updates"
                message={`Are you sure you want to save the modified attendance for ${selectedDate}?`}
                confirmText="Yes, Update"
                loading={savingAttendance}
                onCancel={() => setShowConfirmModal(false)}
                onConfirm={updateAttendance}
            />
        </div>
    );
}