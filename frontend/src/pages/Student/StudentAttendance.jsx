import { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";
import {
  TrendingUp,
  Filter,
  BookOpen,
  Percent,
  AlertCircle,
  ListChecks,
} from "lucide-react";

const StudentAttendance = () => {
  const token = localStorage.getItem("token");

  const [attendance, setAttendance] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");

  const getBadgeStyle = (p) => {
    if (p >= 75)
      return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
    if (p >= 50)
      return "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20";
    return "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20";
  };

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get("/api/student/attendance", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAttendance(res.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAttendance();
  }, [token]);

  /* ================= SUBJECT LIST ================= */
  const subjects = useMemo(() => {
    return [
      ...new Map(
        attendance.map((a) => [
          a.subjectcode,
          { code: a.subjectcode, name: a.subject },
        ])
      ).values(),
    ];
  }, [attendance]);

  const filteredAttendance = selectedSubject
    ? attendance.filter(
        (a) => String(a.subjectcode) === String(selectedSubject)
      )
    : attendance;

  /* ================= SUMMARY ================= */
  const summary = useMemo(() => {
    if (!filteredAttendance.length) return null;

    const totalSubjects = filteredAttendance.length;

    const avg =
      filteredAttendance.reduce((acc, item) => {
        const percent = item.total_classes
          ? (item.attended_classes / item.total_classes) * 100
          : 0;
        return acc + percent;
      }, 0) / totalSubjects;

    const below75 = filteredAttendance.filter((item) => {
      const percent = item.total_classes
        ? (item.attended_classes / item.total_classes) * 100
        : 0;
      return percent < 75;
    }).length;

    return {
      totalSubjects,
      average: avg.toFixed(1),
      below75,
    };
  }, [filteredAttendance]);

  return (
    <div className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">

      {/* PLATFORM HEADER */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-md shadow-indigo-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-tight">My Attendance</h1>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:block">
                Performance Overview
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 space-y-6">

        {/* FILTER CARD */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4 sm:p-6 transition-all">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-indigo-500" />
            <h2 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              Filter Subject
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
            >
              <option value="">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub.code} value={sub.code}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        </section>

        {filteredAttendance.length > 0 ? (
          <div className="space-y-6">

            {/* SUMMARY CARDS */}
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Subjects</p>
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                  <p className="text-xl font-black text-slate-900 dark:text-slate-100">{summary.totalSubjects}</p>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Average %</p>
                    <Percent className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                  <p className="text-xl font-black text-slate-900 dark:text-slate-100">{summary.average}%</p>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Below 75%</p>
                    <AlertCircle className={`w-3.5 h-3.5 ${summary.below75 > 0 ? 'text-red-500' : 'text-indigo-500'}`} />
                  </div>
                  <p className={`text-xl font-black ${summary.below75 > 0 ? "text-red-600" : "text-slate-900 dark:text-slate-100"}`}>
                    {summary.below75}
                  </p>
                </div>
              </div>
            )}

            {/* DATA TABLE */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all">
              <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                <table className="w-full table-fixed">
                  <thead>
                    <tr>
                      <th className="w-[45%] sm:w-[40%] px-4 sm:px-6 py-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Subject Details
                      </th>
                      <th className="w-[30%] px-2 sm:px-4 py-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Classes (P/T)
                      </th>
                      <th className="w-[25%] sm:w-[30%] px-4 sm:px-6 py-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Attendance %
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>

              <div className="w-full">
                <table className="w-full table-fixed">
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredAttendance.map((item, index) => {
                      const percentage = item.total_classes
                        ? (item.attended_classes / item.total_classes) * 100
                        : 0;

                      return (
                        <tr
                          key={index}
                          className={`${
                            index % 2 === 0 ? "bg-transparent" : "bg-slate-50/50 dark:bg-slate-800/20"
                          } hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-colors`}
                        >
                          <td className="w-[45%] sm:w-[40%] px-4 sm:px-6 py-4">
                            <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                              {item.subject}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                              {item.subjectcode}
                            </div>
                          </td>
                          <td className="w-[30%] px-2 sm:px-4 py-4 text-center">
                            <div className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                              {item.attended_classes} / {item.total_classes}
                            </div>
                          </td>
                          <td className="w-[25%] sm:w-[30%] px-4 sm:px-6 py-4 text-center">
                            <span
                              className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-black border ${getBadgeStyle(
                                percentage
                              )}`}
                            >
                              {percentage.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : (
          /* MODERN EMPTY STATE */
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center px-4 shadow-sm">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-4 border border-slate-100 dark:border-slate-800">
              <ListChecks className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Attendance Data</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-xs">
              Your attendance statistics will appear here.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentAttendance;