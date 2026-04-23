import { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";
import {
  TrendingUp,
  Filter,
  BookOpen,
  Percent,
  AlertCircle,
  ListChecks
} from "lucide-react";

const StudentAttendance = () => {
  const token = localStorage.getItem("token");

  const [attendance, setAttendance] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");

  const getStatusColor = (p) => {
    if (p >= 75) return "text-emerald-600";
    if (p >= 50) return "text-yellow-500";
    return "text-red-600";
  };

  const getBadgeStyle = (p) => {
    if (p >= 75)
      return "bg-emerald-50 text-emerald-600 border-emerald-200";
    if (p >= 50)
      return "bg-yellow-50 text-yellow-600 border-yellow-200";
    return "bg-red-50 text-red-600 border-red-200";
  };

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get("/api/student/attendance", {
          headers: { Authorization: `Bearer ${token}` }
        });

        setAttendance(res.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAttendance();
  }, []);

  /* ================= SUBJECT LIST ================= */
  const subjects = useMemo(() => {
    return [
      ...new Map(
        attendance.map((a) => [
          a.subjectcode,
          { code: a.subjectcode, name: a.subject }
        ])
      ).values()
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
      below75
    };
  }, [filteredAttendance]);

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">

      {/* HEADER */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-lg">
            <TrendingUp size={18} />
          </div>
          <div>
            <h1 className="font-bold">My Attendance</h1>
            <p className="text-xs text-gray-500">Performance Overview</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">

        {/* FILTER */}
        <div className="bg-white dark:bg-slate-900 border rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={14} />
            <p className="text-xs font-bold uppercase text-gray-500">
              Filter Subject
            </p>
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-900"
          >
            <option value="">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub.code} value={sub.code}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        {/* SUMMARY */}
        {summary && (
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 border rounded-xl">
              <p className="text-xs text-gray-500">Subjects</p>
              <p className="font-bold text-lg">{summary.totalSubjects}</p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border rounded-xl">
              <p className="text-xs text-gray-500">Average %</p>
              <p className="font-bold text-lg">{summary.average}%</p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border rounded-xl">
              <p className="text-xs text-gray-500">Below 75%</p>
              <p className="font-bold text-lg text-red-600">
                {summary.below75}
              </p>
            </div>
          </div>
        )}

        {/* TABLE */}
        {filteredAttendance.length > 0 ? (
          <div className="bg-white dark:bg-slate-900 border rounded-xl overflow-hidden">

            <div className="border-b px-4 py-3 text-sm font-semibold">
              Attendance Details
            </div>

            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="p-3 text-left">Subject</th>
                  <th className="p-3 text-center">Classes</th>
                  <th className="p-3 text-center">Attendance</th>
                </tr>
              </thead>

              <tbody>
                {filteredAttendance.map((item, index) => {
                  const percentage = item.total_classes
                    ? (item.attended_classes / item.total_classes) * 100
                    : 0;

                  return (
                    <tr
                      key={index}
                      className="border-t hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="p-3 font-medium">
                        {item.subject}
                      </td>

                      <td className="p-3 text-center">
                        {item.attended_classes} / {item.total_classes}
                      </td>

                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-1 rounded border text-xs font-bold ${getBadgeStyle(
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
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border rounded-xl">
            <ListChecks size={40} className="text-indigo-500 mb-3" />
            <p className="font-semibold">No Attendance Data</p>
            <p className="text-sm text-gray-500">
              Your attendance will appear here.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentAttendance;