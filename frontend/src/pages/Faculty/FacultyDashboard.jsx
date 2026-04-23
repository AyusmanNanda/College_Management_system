import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import {
    LayoutDashboard,
    Users,
    ShieldCheck,
    BookMarked,
    Activity,
    GraduationCap,
    BarChart3,
    ClipboardCheck,
    BookOpen,
    ArrowRight
} from "lucide-react";

const FacultyDashboard = () => {
    const token = localStorage.getItem("token");

    const [stats, setStats] = useState({
        totalStudents: 0,
        totalFaculty: 0,
        totalSubjects: 0,
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get("/api/faculty/dashboard", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setStats({
                    totalStudents: res.data.total_students ?? 0,
                    totalFaculty: res.data.total_faculty ?? 0,
                    totalSubjects: res.data.total_subjects ?? 0,
                });
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchStats();
    }, [token]);

    return (
        <div className="pb-12 font-sans bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">

            {/* HEADER — scrolls with page, no sticky */}
            <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-md shadow-indigo-500/20">
                            <LayoutDashboard className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
                                Faculty Dashboard
                            </h1>
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:block">
                                Academic Management
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-md">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider hidden sm:inline">
                            Faculty Portal Active
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider sm:hidden">
                            Online
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

                {/* METRICS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    <DashboardCard title="Total Students" value={stats.totalStudents} icon={Users} color="blue" loading={loading} />
                    <DashboardCard title="Total Faculty" value={stats.totalFaculty} icon={ShieldCheck} color="indigo" loading={loading} />
                    <DashboardCard title="Total Subjects" value={stats.totalSubjects} icon={BookMarked} color="emerald" loading={loading} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

                    {/* SYSTEM OVERVIEW WIDGET */}
                    <section className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                <Activity className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                                Faculty Control Center
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1">
                            <div className="flex flex-col gap-3 p-5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/60">
                                <GraduationCap className="w-6 h-6 text-blue-500" />
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Academic Records</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        Manage your assigned students and subjects. Ensure all attendance and marks data are synchronized with the central database.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 p-5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/60">
                                <BarChart3 className="w-6 h-6 text-indigo-500" />
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Real-Time Updates</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        Changes made to student attendance or marks reflect instantly. Use the analytics tools to track class performance.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* QUICK ACTIONS LAUNCHPAD */}
                    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                                Quick Launch
                            </h3>
                        </div>

                        <div className="flex flex-col gap-3">
                            <QuickActionLink to="/faculty/students" icon={Users} label="View Students" color="blue" />
                            <QuickActionLink to="/faculty/marks" icon={GraduationCap} label="Manage Marks" color="indigo" />
                            <QuickActionLink to="/faculty/attendance" icon={ClipboardCheck} label="Attendance" color="emerald" />
                            <QuickActionLink to="/faculty/subjects" icon={BookOpen} label="My Subjects" color="slate" />
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
};

/* ================= COMPONENT: DASHBOARD CARD ================= */
const DashboardCard = ({ title, value, icon: Icon, color, loading }) => {
    const colorThemes = {
        blue: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
        indigo: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
        emerald: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    };

    return (
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-default">
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150 duration-500 ${colorThemes[color].split(' ')[0]}`}></div>
            <div className="flex items-center justify-between relative z-10">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{title}</p>
                    {loading ? (
                        <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse mt-2"></div>
                    ) : (
                        <p className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">{value}</p>
                    )}
                </div>
                <div className={`p-4 rounded-xl ${colorThemes[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
};

/* ================= COMPONENT: QUICK ACTION LINK ================= */
const QuickActionLink = ({ to, icon: Icon, label, color }) => {
    const colorThemes = {
        blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 group-hover:bg-blue-500 group-hover:text-white",
        indigo: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 group-hover:bg-indigo-500 group-hover:text-white",
        emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 group-hover:bg-emerald-500 group-hover:text-white",
        slate: "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-600 group-hover:text-white",
    };

    return (
        <Link to={to} className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-950/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all active:scale-95">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${colorThemes[color]}`}>
                    <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {label}
                </span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-1 transition-all" />
        </Link>
    );
};

export default FacultyDashboard;