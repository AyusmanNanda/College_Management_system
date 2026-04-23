import { useEffect, useState } from "react";
import api from "../../utils/api";
import {
  LayoutDashboard,
  User,
  GraduationCap,
  BookOpen,
  Activity
} from "lucide-react";

/* ================= CARD ================= */
const DashboardCard = ({ title, value, icon: Icon, loading }) => {
  return (
    <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400">
            {title}
          </p>

          {loading ? (
            <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded mt-2 animate-pulse"></div>
          ) : (
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-2">
              {value || "-"}
            </p>
          )}
        </div>

        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
          <Icon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </div>
      </div>
    </div>
  );
};

export default function StudentDashboard() {

  const token = localStorage.getItem("token");

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await api.get("/api/student/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStudent(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchStudent();
  }, [token]);

  return (
    <div className="pb-12">

      {/* HEADER (same style as admin) */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-md">
              <LayoutDashboard className="w-5 h-5" />
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                Student Dashboard
              </h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest hidden sm:block">
                Academic Overview
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-md">
            <span className="h-2 w-2 bg-emerald-500 rounded-full"></span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              Active
            </span>
          </div>

        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          <DashboardCard
            title="Student Name"
            value={
              loading
                ? ""
                : `${student?.firstname || ""} ${student?.lastname || ""}`
            }
            icon={User}
            loading={loading}
          />

          <DashboardCard
            title="Roll Number"
            value={student?.rollnumber}
            icon={BookOpen}
            loading={loading}
          />

          <DashboardCard
            title="Course"
            value={student?.courcecode}
            icon={GraduationCap}
            loading={loading}
          />

          <DashboardCard
            title="Semester"
            value={student?.semoryear || "N/A"}
            icon={Activity}
            loading={loading}
          />

        </div>

        {/* INFO PANEL (same feature, better UI) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">

          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5 text-slate-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Student Portal
            </h3>
          </div>

          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <p>• View your attendance records</p>
            <p>• Check your marks and performance</p>
            <p>• Update your profile anytime</p>
          </div>

        </div>

      </main>
    </div>
  );
}