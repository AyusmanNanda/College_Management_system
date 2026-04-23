import { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";
import { 
  TrendingUp, 
  RotateCcw, 
  Users, 
  Calendar, 
  Percent, 
  AlertCircle, 
  BookOpen, 
  Layers, 
  ClipboardCheck,
  Search
} from "lucide-react";

// Updated Stat Card to be Theme-Aware
function SummaryCard({ label, value, icon: Icon, danger = false }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm transition-colors">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{label}</p>
        <Icon className={`w-3.5 h-3.5 ${danger ? 'text-red-500' : 'text-indigo-600 dark:text-indigo-500'}`} />
      </div>
      <p className={`text-xl font-black ${danger ? "text-red-600 dark:text-red-500" : "text-slate-900 dark:text-white"}`}>
        {value || "-"}
      </p>
    </div>
  );
}

export default function FacultyAttendanceReport() {
  const token = localStorage.getItem("token");

  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState("");

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
    return assignedSubjects.find(
      (item) => String(item.subjectcode) === String(selectedSubject)
    );
  }, [assignedSubjects, selectedSubject]);

  const selectedCourse = selectedSubjectObj?.courcecode || "";
  const selectedSem = selectedSubjectObj?.semoryear || "";

  useEffect(() => {
    if (!selectedSubject || !selectedCourse || !selectedSem) {
      setReportData([]);
      return;
    }
    const fetchReport = async () => {
      try {
        setLoadingReport(true);
        setError("");
        const res = await api.get(
          `/api/attendance/report?course=${selectedCourse}&sem=${selectedSem}&subject=${selectedSubject}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReportData(res.data || []);
      } catch (err) {
        setReportData([]);
        setError("Failed to load attendance report.");
      } finally {
        setLoadingReport(false);
      }
    };
    fetchReport();
  }, [selectedSubject, selectedCourse, selectedSem, token]);

  const summary = useMemo(() => {
    if (reportData.length === 0) return null;
    const totalStudents = reportData.length;
    const totalClasses = reportData[0]?.total_classes || 0;
    const average = reportData.reduce((acc, s) => acc + Number(s.percentage || 0), 0) / totalStudents;
    const below75 = reportData.filter((s) => Number(s.percentage) < 75).length;

    return { totalStudents, totalClasses, average: average.toFixed(1), below75 };
  }, [reportData]);

  const handleReset = () => {
    setSelectedSubject("");
    setReportData([]);
    setError("");
  };

  const isReady = selectedSubject && selectedCourse && selectedSem;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* HEADER SECTION */}
      <header className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl m-4 sm:m-6 p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-indigo-600 text-white rounded-lg shadow-lg shadow-indigo-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">Attendance Analytics</h1>
            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">Subject Insight Portal</p>
          </div>
        </div>
        
        <button onClick={handleReset} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors">
          <RotateCcw className="w-4 h-4" /> <span className="hidden sm:inline">Reset Report</span>
        </button>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 space-y-6 pb-24">
        
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-900/20 rounded-xl text-red-600 dark:text-red-400 text-sm font-semibold">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* SELECTOR CARD */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 transition-colors">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider ml-1">Analytical Context</label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setReportData([]);
              }}
              disabled={loadingSubjects}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all cursor-pointer"
            >
              <option value="">{loadingSubjects ? "Fetching database..." : "Select Subject to Analyze"}</option>
              {assignedSubjects.map((sub, index) => (
                <option key={index} value={sub.subjectcode}>{sub.subjectname}</option>
              ))}
            </select>
          </div>

          {/* CONTEXT CHIPS */}
          {selectedSubjectObj && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95">
              <div className="space-y-1">
                <span className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  <BookOpen className="w-3 h-3 text-indigo-600 dark:text-indigo-500" /> Course
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white uppercase">{selectedCourse}</p>
              </div>
              <div className="space-y-1">
                <span className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  <Layers className="w-3 h-3 text-indigo-600 dark:text-indigo-500" /> Semester / Year
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedSem}</p>
              </div>
              <div className="space-y-1">
                <span className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  <ClipboardCheck className="w-3 h-3 text-indigo-600 dark:text-indigo-500" /> Active Subject
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedSubjectObj?.subjectname}</p>
              </div>
            </div>
          )}
        </section>

        {/* SUMMARY SECTION */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-bottom-4 duration-500">
            <SummaryCard label="Student Strength" value={summary.totalStudents} icon={Users} />
            <SummaryCard label="Total Lectures" value={summary.totalClasses} icon={Calendar} />
            <SummaryCard label="Class Average" value={`${summary.average}%`} icon={Percent} />
            <SummaryCard label="Critical Alerts" value={summary.below75} icon={AlertCircle} danger={summary.below75 > 0} />
          </div>
        )}

        {/* REPORT TABLE */}
        {isReady && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden mt-6 transition-colors">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
              <h2 className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-widest flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-600 dark:text-indigo-500" /> Statistical Breakdown
              </h2>
              <div className="flex gap-12 text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-widest pr-4">
                <span className="hidden sm:inline">P / T Count</span>
                <span>Aggregate %</span>
              </div>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {loadingReport ? (
                <div className="p-20 text-center">
                  <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest">Generating Metrics...</p>
                </div>
              ) : reportData.length === 0 ? (
                <div className="p-20 text-center">
                  <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest">No Statistical Data Found</p>
                </div>
              ) : (
                reportData.map((student) => {
                  const low = Number(student.percentage) < 75;
                  return (
                    <div key={student.rollnumber} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <div>
                        <div className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400">{student.rollnumber}</div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{student.name}</div>
                      </div>
                      
                      <div className="flex gap-12 items-center">
                        <div className="hidden sm:block text-right">
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{student.present_count} <span className="text-slate-400 dark:text-slate-600 mx-1">/</span> {student.total_classes}</p>
                        </div>
                        <div className={`min-w-[80px] text-center px-3 py-1.5 rounded-lg border font-black text-xs ${
                          low 
                          ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-500" 
                          : "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-500"
                        }`}>
                          {student.percentage}%
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!isReady && !loadingSubjects && (
          <div className="flex flex-col items-center justify-center py-24 bg-white/50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center">
            <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-full mb-4">
              <ClipboardCheck className="w-10 h-10 text-slate-300 dark:text-slate-700" />
            </div>
            <h3 className="text-slate-400 dark:text-slate-300 font-bold">Awaiting Selection</h3>
            <p className="text-slate-500 text-xs mt-1">Select a subject above to generate the attendance metrics report.</p>
          </div>
        )}
      </main>
    </div>
  );
}