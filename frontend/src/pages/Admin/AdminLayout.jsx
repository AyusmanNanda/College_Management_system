import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import api from "../../utils/api";
import {
    Sun,
    Moon,
    LayoutDashboard,
    BookOpen,
    Users,
    ClipboardCheck,
    GraduationCap,
    BarChart3,
    User,
    ChevronRight,
    Menu,
    LogOut,
    WifiOff
} from "lucide-react";
import useOfflineDetection from "./useOfflineDetection";

const AdminLayout = () => {
    const BASE_URL = api.defaults.baseURL;
    const location = useLocation();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const isOffline = useOfflineDetection();

    const [admin, setAdmin] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        const saved = localStorage.getItem("sidebarOpen");
        return saved !== null ? JSON.parse(saved) : window.innerWidth >= 1024;
    });
    const [openSections, setOpenSections] = useState({});
    const [checking, setChecking] = useState(false);
    const [retryError, setRetryError] = useState("");

    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) return savedTheme;
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    });

    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        localStorage.setItem("theme", theme);
    }, [theme]);

    /* ===================== Layout Mechanics ===================== */
    useEffect(() => {
        if (window.innerWidth >= 1024) {
            localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen));
        }
    }, [isSidebarOpen]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
            } else {
                const saved = localStorage.getItem("sidebarOpen");
                setIsSidebarOpen(saved !== null ? JSON.parse(saved) : true);
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    /* ===================== Fetch Admin ===================== */
    useEffect(() => {
        if (!token) {
            navigate("/", { replace: true });
            return;
        }
        const fetchAdmin = async () => {
            try {
                const res = await api.get("/api/admin/profile", { headers: { Authorization: `Bearer ${token}` } });
                setAdmin(res.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchAdmin();
    }, [token, navigate]);

    useEffect(() => {
        document.body.style.overflow = isOffline ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOffline]);

    /* ===================== Actions ===================== */
    const handleLogout = () => {
        localStorage.clear();
        navigate("/", { replace: true });
    };

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    const toggleSection = (section) => {
        setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    /* ===================== Navigation Menu ===================== */
    const menuItems = [
        { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
        {
            name: "Academic",
            icon: BookOpen,
            children: [
                { name: "Courses", path: "/admin/courses" },
                { name: "Subjects", path: "/admin/subjects" },
                { name: "Assign Subjects", path: "/admin/assign-subjects" }
            ]
        },
        {
            name: "Users",
            icon: Users,
            children: [
                { name: "Students", path: "/admin/students" },
                { name: "Faculties", path: "/admin/faculties" }
            ]
        },
        {
            name: "Attendance",
            icon: ClipboardCheck,
            children: [
                { name: "Take Attendance", path: "/admin/take-attendance" },
                { name: "Edit Attendance", path: "/admin/edit-attendance" }
            ]
        },
        {
            name: "Marks",
            icon: GraduationCap,
            children: [
                { name: "Enter Marks", path: "/admin/enter-marks" },
                { name: "Edit Marks", path: "/admin/edit-marks" }
            ]
        },
        {
            name: "Reports",
            icon: BarChart3,
            children: [
                { name: "Attendance Report", path: "/admin/attendance-report" },
                { name: "Marks Report", path: "/admin/marks-report" },
                { name: "Print Marksheet", path: "/admin/print-marksheet" }
            ]
        },
        {
            name: "Account",
            icon: User,
            children: [
                { name: "Profile", path: "/admin/profile" }
            ]
        }
    ];

    const activeSection = menuItems.find((item) =>
        item.children?.some((c) => location.pathname.startsWith(c.path))
    );

    return (
        <>
            {/* MODERN OFFLINE MODAL */}
            {isOffline && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-md px-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <WifiOff className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Connection Lost</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                            We cannot reach the academic server. Please verify your network connection to resume.
                        </p>
                        {retryError && <p className="text-xs font-semibold text-red-500 mt-3">{retryError}</p>}
                        <button
                            onClick={async () => {
                                setChecking(true);
                                setRetryError("");
                                try {
                                    await api.get("/api/admin/profile", { headers: { Authorization: `Bearer ${token}` } });
                                    setIsOffline(false);
                                    setChecking(false);
                                    setRetryError("");
                                } catch (err) {
                                    setChecking(false);
                                    setRetryError("Server is still unreachable.");
                                }
                            }}
                            className="mt-8 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/30"
                        >
                            {checking ? "Verifying Connection..." : "Retry Connection"}
                        </button>
                    </div>
                </div>,
                document.body
            )}

            <div className="h-screen flex bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">

                {/* MOBILE SIDEBAR OVERLAY */}
                {isSidebarOpen && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                         onClick={() => setIsSidebarOpen(false)} />
                )}

                {/* ENTERPRISE SIDEBAR */}
                <aside className={`fixed top-0 left-0 h-screen w-[280px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>

                    {/* IDENTITY BLOCK */}
                    <div className="px-6 py-8 border-b border-slate-100 dark:border-slate-800/60">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex-shrink-0">
                                <img
                                    src={admin?.logo ? `${BASE_URL}${admin.logo}` : `${BASE_URL}/uploads/admin/default.png`}
                                    onError={(e) => { e.target.onerror = null; e.target.src = `${BASE_URL}/uploads/admin/default.png`; }}
                                    alt="Logo"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">Administrator</h2>
                                <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold truncate">Core Control</p>
                            </div>
                        </div>

                        {admin && (
                            <div className="mt-5 bg-slate-50 dark:bg-slate-950/50 rounded-lg p-3 text-[11px] font-medium border border-slate-100 dark:border-slate-800/60 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">System Status</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className={`h-1.5 w-1.5 rounded-full ${admin.activestatus ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                                        <span className="text-slate-700 dark:text-slate-300">{admin.activestatus ? "Online" : "Offline"}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Last Sync</span>
                                    <span className="text-slate-700 dark:text-slate-300 truncate pl-2">
                                        {admin.lastlogin ? new Date(admin.lastlogin).toLocaleDateString() : "N/A"}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* NAVIGATION MENU */}
                    <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isOpen = openSections[item.name] || activeSection?.name === item.name;

                            if (item.children) {
                                return (
                                    <div key={item.name} className="mb-1">
                                        <button onClick={() => toggleSection(item.name)}
                                                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-xl transition-all ${isOpen ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'}`}>
                                            <div className="flex items-center gap-3">
                                                <Icon className={`w-5 h-5 ${isOpen ? 'text-blue-600 dark:text-blue-500' : ''}`} />
                                                {item.name}
                                            </div>
                                            <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-90 text-slate-900 dark:text-white" : ""}`} />
                                        </button>

                                        {isOpen && (
                                            <div className="ml-5 mt-1 pl-3 border-l border-slate-200 dark:border-slate-800 space-y-1">
                                                {item.children.map((sub) => {
                                                    const active = location.pathname.startsWith(sub.path);
                                                    return (
                                                        <Link key={sub.path} to={sub.path}
                                                              onClick={() => { if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                                                              className={`block px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${active ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}>
                                                            {sub.name}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            const isActive = location.pathname === item.path;
                            return (
                                <Link key={item.path} to={item.path}
                                      onClick={() => { setOpenSections({}); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"}`}>
                                    <Icon className="w-5 h-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* MAIN CANVAS */}
                <div className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? "lg:ml-[280px]" : "ml-0"}`}>

                    {/* GLASSMORPHISM GLOBAL HEADER */}
                    <header className="h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsSidebarOpen(prev => !prev)}
                                    className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none">
                                <Menu className="w-5 h-5" />
                            </button>
                            <h1 className="text-sm font-bold text-slate-800 dark:text-slate-200 hidden sm:block">
                                Academic Management ERP
                            </h1>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4">
                            <button onClick={toggleTheme}
                                    className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none"
                                    title="Toggle Theme">
                                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>

                            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block mx-1"></div>

                            <button onClick={handleLogout}
                                    className="flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors focus:outline-none">
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Terminate Session</span>
                            </button>
                        </div>
                    </header>

                    {/* UNBOXED OUTLET RENDER AREA */}
                    {/* Note: By removing the card wrapper here, child pages can render full-bleed and control their own layouts */}
                    <main className="flex-1 overflow-x-hidden overflow-y-auto scroll-smooth">
                        <Outlet />
                    </main>

                </div>
            </div>
        </>
    );
};

export default AdminLayout;