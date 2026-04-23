import { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";
import ImportAttendanceModal from "./ImportAttendanceModal";
import ConfirmSaveModal from "../Admin/modals/ConfirmSaveModal";
import {
    CheckSquare,
    Filter,
    RotateCcw,
    Save,
    AlertCircle,
    ListChecks,
    CheckCircle2,
    FileUp
} from "lucide-react";

export default function FacultyTakeAttendance() {
  const token = localStorage.getItem("token");

  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [existingDates, setExistingDates] = useState([]);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [markMode, setMarkMode] = useState("present");
  const [checkedStudents, setCheckedStudents] = useState({});

  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [showImportModal, setShowImportModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const todayDate = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

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
        console.error("Assigned subjects fetch error:", err);
        setAssignedSubjects([]);
        setError("Failed to load assigned subjects.");
      } finally {
        setLoadingSubjects(false);
      }
    };
    if (token) fetchAssignedSubjects();
  }, [token]);

  const selectedSubjectObj = useMemo(() => {
    return assignedSubjects.find(
      (item) => String(item.subjectcode) === String(selectedSubject)
    );
  }, [assignedSubjects, selectedSubject]);

  const selectedCourse = selectedSubjectObj?.courcecode || "";
  const selectedSem = selectedSubjectObj?.semoryear || "";

  useEffect(() => {
    if (!selectedCourse || !selectedSem) {
      setStudents([]);
      setCheckedStudents({});
      return;
    }
    const fetchStudents = async () => {
      try {
        setLoadingStudents(true);
        setError("");
        setSuccess("");
        const res = await api.get(
          `/api/attendance/students?course=${selectedCourse}&sem=${selectedSem}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStudents(res.data || []);
        setCheckedStudents({});
      } catch (err) {
        console.error("Students fetch error:", err);
        setStudents([]);
        setError("Failed to load students.");
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [selectedCourse, selectedSem, token]);

  useEffect(() => {
    if (!selectedSubject || !selectedCourse || !selectedSem) {
      setExistingDates([]);
      return;
    }
    const fetchDates = async () => {
      try {
        const res = await api.get(
          `/api/attendance/dates?subjectcode=${selectedSubject}&courcecode=${selectedCourse}&semoryear=${selectedSem}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setExistingDates((res.data || []).map((item) => item.date));
      } catch (err) {
        console.error("Existing dates fetch error:", err);
        setExistingDates([]);
      }
    };
    fetchDates();
  }, [selectedSubject, selectedCourse, selectedSem, token]);

  const toggleStudent = (id) => {
    setCheckedStudents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const saveAttendance = async () => {
    if (!selectedSubject || !selectedCourse || !selectedSem) {
      setError("Please select a subject.");
      return;
    }
    if (existingDates.includes(todayDate)) {
      setError("Today's attendance has already been taken for this subject.");
      setTimeout(() => {
        setSelectedSubject("");
        setMarkMode("present");
        setCheckedStudents({});
        setStudents([]);
        setExistingDates([]);
        setError("");
      }, 1500);
      return;
    }
    try {
      setSavingAttendance(true);
      setShowConfirmModal(false);
      const records = students.map((student) => {
        const isChecked = !!checkedStudents[student.student_id];
        return {
          student_id: student.student_id,
          present: markMode === "present" ? (isChecked ? 1 : 0) : (isChecked ? 0 : 1),
        };
      });
      await api.post(
        "/api/attendance",
        {
          subjectcode: selectedSubject,
          date: todayDate,
          courcecode: selectedCourse,
          semoryear: Number(selectedSem),
          records,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Attendance saved successfully for today.");
      setError("");
      setTimeout(() => {
        setSelectedSubject("");
        setMarkMode("present");
        setCheckedStudents({});
        setStudents([]);
        setExistingDates([]);
        setSuccess("");
      }, 1200);
    } catch (err) {
      console.error("Save attendance error:", err);
      setError(err?.response?.data?.message || "Failed to save attendance.");
    } finally {
      setSavingAttendance(false);
    }
  };

  const isReady = selectedSubject && selectedCourse && selectedSem;
  const isFormReady = isReady && students.length > 0;

  return (
    <div className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">

      {/* ── HEADER — scrolls with page, no sticky ── */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg shadow-md shadow-blue-500/20">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-tight">Log Attendance</h1>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:block">Faculty Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => { setError(""); setSuccess(""); setShowImportModal(true); }}
              disabled={!isReady}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-md transition-colors disabled:opacity-30"
            >
              <FileUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Import Data</span>
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

            <button
              onClick={() => {
                setSelectedSubject("");
                setMarkMode("present");
                setCheckedStudents({});
                setStudents([]);
                setExistingDates([]);
                setError("");
                setSuccess("");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Form</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 space-y-6">

        {/* Error / Success banners */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm font-semibold animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm font-semibold animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p>{success}</p>
          </div>
        )}

        {/* ── STEP 1: ALWAYS VISIBLE — Subject + Mark Mode ── */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4 sm:p-6 transition-all">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-blue-500" />
            <h2 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              Class Parameters
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Subject */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 ml-1 tracking-wider">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setCheckedStudents({});
                  setError("");
                  setSuccess("");
                }}
                disabled={loadingSubjects}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-40"
              >
                <option value="">{loadingSubjects ? "Loading..." : "Subject..."}</option>
                {assignedSubjects.map((sub, index) => (
                  <option key={`${sub.subjectcode}-${index}`} value={sub.subjectcode}>
                    {sub.subjectname}
                  </option>
                ))}
              </select>
            </div>

            {/* Mark Mode */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 ml-1 tracking-wider">
                Attendance Mode
              </label>
              <select
                value={markMode}
                onChange={(e) => setMarkMode(e.target.value)}
                disabled={!selectedSubject}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-semibold text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-40"
              >
                <option value="present">Check = Present</option>
                <option value="absent">Check = Absent</option>
              </select>
            </div>
          </div>
        </section>

        {/* ── STEP 2: APPEARS AFTER SUBJECT IS SELECTED — Course, Semester, Date ── */}
        {selectedSubjectObj && (
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4 sm:p-6 transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              {/* Course */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 ml-1 tracking-wider">
                  Course
                </label>
                <div className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100">
                  {selectedCourse}
                </div>
              </div>

              {/* Semester */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 ml-1 tracking-wider">
                  Semester
                </label>
                <div className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100">
                  Semester {selectedSem}
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 ml-1 tracking-wider">
                  Date
                </label>
                <div className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100">
                  {todayDate}
                </div>
              </div>

            </div>
          </section>
        )}

        {/* ── STEP 3: ATTENDANCE LEDGER ── */}
        {isReady ? (
          loadingStudents ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center px-4 shadow-sm">
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading students...</p>
            </div>
          ) : (
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* Table header */}
              <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                <table className="w-full table-fixed">
                  <thead>
                    <tr>
                      <th className="w-[30%] sm:w-[25%] px-4 sm:px-6 py-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Roll No
                      </th>
                      <th className="w-[50%] sm:w-[50%] px-2 sm:px-4 py-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="w-[20%] sm:w-[25%] px-4 sm:px-6 py-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {markMode === "present" ? "Present" : "Absent"}
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>

              {/* Table body */}
              <div className="w-full">
                <table className="w-full table-fixed">
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                          No students enrolled in this selection.
                        </td>
                      </tr>
                    ) : (
                      students.map((student, idx) => (
                        <tr
                          key={student.student_id}
                          className={`${
                            idx % 2 === 0 ? "bg-transparent" : "bg-slate-50/50 dark:bg-slate-800/20"
                          } hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-colors cursor-pointer`}
                          onClick={() => toggleStudent(student.student_id)}
                        >
                          <td className="w-[30%] sm:w-[25%] px-4 sm:px-6 py-4">
                            <div className="text-[11px] sm:text-xs font-mono font-bold text-slate-600 dark:text-slate-400 truncate">
                              {student.rollnumber}
                            </div>
                          </td>
                          <td className="w-[50%] sm:w-[50%] px-2 sm:px-4 py-4">
                            <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                              {student.firstname} {student.lastname}
                            </div>
                          </td>
                          <td
                            className="w-[20%] sm:w-[25%] px-4 sm:px-6 py-4 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={!!checkedStudents[student.student_id]}
                              onChange={() => toggleStudent(student.student_id)}
                              className="h-5 w-5 rounded border-slate-300 dark:border-slate-600 text-blue-600 bg-white dark:bg-slate-900 focus:ring-blue-500 dark:focus:ring-blue-500/50 cursor-pointer transition-colors"
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center px-4 shadow-sm">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-4 border border-slate-100 dark:border-slate-800">
              <ListChecks className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              Awaiting Configuration
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-xs">
              Select a subject above to load the attendance ledger.
            </p>
          </div>
        )}
      </main>

      {/* ── STICKY BOTTOM ACTION BAR ── */}
      {isFormReady && (
        <div className="sticky bottom-0 mt-auto w-full z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 p-4 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-500">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Recording for {students.length} students
            </div>
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={!isReady || students.length === 0 || savingAttendance}
              className="w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {savingAttendance ? "Processing..." : "Save Attendance"}
            </button>
          </div>
        </div>
      )}

      {/* ── MODALS ── */}
      {showImportModal && (
        <ImportAttendanceModal
          onClose={() => setShowImportModal(false)}
          token={token}
          subjectcode={selectedSubject}
          courcecode={selectedCourse}
          semoryear={selectedSem}
          date={todayDate}
          onImportSuccess={() => {
            setSuccess("Attendance imported successfully.");
            setError("");
            setTimeout(() => {
              setSelectedSubject("");
              setMarkMode("present");
              setCheckedStudents({});
              setStudents([]);
              setExistingDates([]);
              setSuccess("");
              setShowImportModal(false);
            }, 1500);
          }}
        />
      )}

      <ConfirmSaveModal
        show={showConfirmModal}
        title="Confirm Data Sync"
        message="Are you sure you want to save today's attendance for this subject? This action logs data to the central server."
        confirmText="Save Attendance"
        loading={savingAttendance}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={saveAttendance}
      />
    </div>
  );
}