import { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";
import ConfirmSaveModal from "../Admin/modals/ConfirmSaveModal";
import ImportMarksModal from "./ImportMarksModal";
import { 
  ListChecks, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  FileUp, 
  BookOpen,
  ClipboardCheck,
  Calendar,
  Layers
} from "lucide-react";

export default function FacultyEnterMarks() {
  const token = localStorage.getItem("token");

  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [selectedSubject, setSelectedSubject] = useState("");
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    const fetchAssignedSubjects = async () => {
      try {
        setLoadingSubjects(true);
        const res = await api.get("/api/faculty/assigned-subjects", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAssignedSubjects(res.data || []);
      } catch (err) {
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
      setMarks({});
      return;
    }
    const fetchStudents = async () => {
      try {
        setLoadingStudents(true);
        const res = await api.get(
          `/api/marks/students?course=${selectedCourse}&sem=${selectedSem}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStudents(res.data || []);
        const initialMarks = {};
        (res.data || []).forEach((student) => {
          initialMarks[student.rollnumber] = { theory: "", practical: "" };
        });
        setMarks(initialMarks);
      } catch (err) {
        setError("Failed to load students.");
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [selectedCourse, selectedSem, token]);

  const handleMarkChange = (rollnumber, field, value) => {
    setMarks((prev) => ({
      ...prev,
      [rollnumber]: { ...prev[rollnumber], [field]: value },
    }));
  };

  const handleReset = () => {
    setSelectedSubject("");
    setStudents([]);
    setMarks({});
    setError("");
  };

  const isReady = selectedSubject && selectedCourse && selectedSem;

  return (
    <div className="min-h-screen flex flex-col bg-[#05070a] text-slate-100 font-sans">
      
      {/* HEADER */}
      <header className="bg-[#0f111a] border border-slate-800 rounded-xl m-4 sm:m-6 p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-indigo-600 text-white rounded-lg shadow-lg">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Log Marks</h1>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest leading-none">Faculty Portal</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowImportModal(true)}
            disabled={!isReady}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold transition-all rounded-md ${
              isReady ? "text-indigo-400 hover:text-indigo-300" : "text-slate-600 cursor-not-allowed"
            }`}
          >
            <FileUp className="w-4 h-4" /> Import Data
          </button>
          <div className="h-4 w-[1px] bg-slate-800"></div>
          <button onClick={handleReset} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors">
            <RotateCcw className="w-4 h-4" /> Reset Form
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 space-y-4 pb-24">
        
        {/* DROPDOWN CARD */}
        <section className="bg-[#0f111a] border border-slate-800 rounded-2xl shadow-xl p-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Subject Configuration</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-[#05070a] border border-slate-700 rounded-lg px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
            >
              <option value="">{loadingSubjects ? "Fetching..." : "Select Subject"}</option>
              {assignedSubjects.map((sub, index) => (
                <option key={index} value={sub.subjectcode}>{sub.subjectname}</option>
              ))}
            </select>
          </div>
        </section>

        {/* DETAILS INFO CARD (At the bottom of dropdown) */}
        {selectedSubjectObj && (
          <section className="bg-[#0f111a] border border-slate-800 rounded-2xl p-6 grid grid-cols-2 md:grid-cols-5 gap-6 animate-in fade-in zoom-in-95">
            <div className="space-y-1">
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                <BookOpen className="w-3 h-3 text-indigo-500" /> Course
              </span>
              <p className="text-sm font-bold text-white uppercase">{selectedCourse}</p>
            </div>
            <div className="space-y-1">
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                <Layers className="w-3 h-3 text-indigo-500" /> Semester
              </span>
              <p className="text-sm font-bold text-white">{selectedSem}</p>
            </div>
            <div className="space-y-1">
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                <Calendar className="w-3 h-3 text-indigo-500" /> Logging Date
              </span>
              <p className="text-sm font-bold text-white">{new Date().toLocaleDateString()}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Max Theory</span>
              <p className="text-sm font-bold text-white">{selectedSubjectObj?.theorymarks ?? 100}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Max Practical</span>
              <p className="text-sm font-bold text-white">{selectedSubjectObj?.practicalmarks ?? 0}</p>
            </div>
          </section>
        )}

        {/* TABLE SECTION */}
        {isReady && (
          <div className="bg-[#0f111a] border border-slate-800 rounded-2xl shadow-xl overflow-hidden mt-6">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/30">
              <h2 className="text-[11px] font-bold uppercase text-slate-500 tracking-widest flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-indigo-500" /> Student Profile
              </h2>
              <div className="flex gap-12 text-[11px] font-bold uppercase text-slate-500 tracking-widest pr-10">
                <span>Theory</span>
                {Number(selectedSubjectObj?.practicalmarks || 0) > 0 && <span>Practical</span>}
              </div>
            </div>
            
            <div className="divide-y divide-slate-800/50">
              {students.map((student) => (
                <div key={student.rollnumber} className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/20 transition-colors">
                  <div>
                    <div className="text-[11px] font-mono font-bold text-indigo-400">{student.rollnumber}</div>
                    <div className="text-sm font-bold text-white">{student.firstname} {student.lastname}</div>
                  </div>
                  <div className="flex gap-6 items-center">
                    <input
                      type="number"
                      value={marks[student.rollnumber]?.theory || ""}
                      onChange={(e) => handleMarkChange(student.rollnumber, "theory", e.target.value)}
                      className="w-20 px-2 py-2 bg-[#05070a] border border-slate-700 rounded-lg text-sm text-center font-bold text-white outline-none focus:border-indigo-500"
                    />
                    {Number(selectedSubjectObj?.practicalmarks || 0) > 0 && (
                      <input
                        type="number"
                        value={marks[student.rollnumber]?.practical || ""}
                        onChange={(e) => handleMarkChange(student.rollnumber, "practical", e.target.value)}
                        className="w-20 px-2 py-2 bg-[#05070a] border border-slate-700 rounded-lg text-sm text-center font-bold text-white outline-none focus:border-indigo-500"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* FOOTER BAR */}
      {isReady && students.length > 0 && (
        <div className="fixed bottom-0 w-full bg-[#0f111a]/95 backdrop-blur-md border-t border-slate-800 p-4 z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              Roster: {students.length} Students
            </div>
            <button 
              onClick={() => setShowSaveModal(true)}
              className="px-10 py-3 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl transition-all active:scale-95 flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Marks
            </button>
          </div>
        </div>
      )}

      {/* MODALS */}
      <ConfirmSaveModal show={showSaveModal} onCancel={() => setShowSaveModal(false)} onConfirm={() => setShowSaveModal(false)} />
      {showImportModal && (
        <ImportMarksModal 
          token={token} 
          course={selectedCourse} 
          sem={selectedSem} 
          subject={selectedSubject} 
          onClose={() => setShowImportModal(false)} 
        />
      )}
    </div>
  );
}