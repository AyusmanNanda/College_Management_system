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
    ChevronRight
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

        return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    });

    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }

        localStorage.setItem("theme", theme);
    }, [theme]);

    /* ===================== Fetch Admin ===================== */

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
                if (saved !== null) {
                    setIsSidebarOpen(JSON.parse(saved));
                } else {
                    setIsSidebarOpen(true); // default for desktop
                }
            }
        };

        handleResize();

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    useEffect(() => {

        if (!token) {
            navigate("/", { replace: true });
            return;
        }

        const fetchAdmin = async () => {

            try {

                const res = await api.get(
                    "/api/admin/profile",
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                setAdmin(res.data);

            } catch (error) {
                console.error(error);
            }

        };

        fetchAdmin();

    }, [token, navigate]);

    useEffect(() => {
        if (isOffline) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [isOffline]);

    /* ===================== Logout ===================== */

    const handleLogout = () => {

        localStorage.clear();
        navigate("/", { replace: true });

    };

    /* ===================== Theme ===================== */

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    /* ===================== Sidebar Section Toggle ===================== */

    const toggleSection = (section) => {
        setOpenSections((prev) => ({
            [section]: !prev[section]
        }));
    };

    /* ===================== Menu ===================== */

    const menuItems = [
        {
            name: "Dashboard",
            icon: LayoutDashboard,
            path: "/admin/dashboard"
        },
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
            {isOffline &&
                createPortal(
                    <div className="fixed inset-0 z-[99999] flex items-center justify-center backdrop-blur-sm bg-black/30">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg text-center max-w-sm w-full">

                            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                You're offline
                            </p>

                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Please check your internet connection to continue.
                            </p>

                            {retryError && (
                                <p className="text-xs text-red-500 mt-2">
                                    {retryError}
                                </p>
                            )}

                            <button
                                onClick={async () => {
                                    setChecking(true);
                                    setRetryError("");

                                    try {
                                        await api.get("/api/admin/profile", {
                                            headers: { Authorization: `Bearer ${token}` }
                                        });

                                        setIsOffline(false);
                                        setChecking(false);
                                        setRetryError("");
                                    } catch (err) {
                                        setChecking(false);
                                        setRetryError("Still offline or server unreachable.");
                                    }
                                }}
                                className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-md text-sm"
                            >
                                {checking ? "Checking..." : "Try Again"}
                            </button>

                        </div>
                    </div>,
                    document.body
                )
            }

            <div className="h-screen flex bg-gray-100 dark:bg-gray-950 overflow-hidden transition-colors">

                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/30 z-30 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                <aside
                    className={`fixed top-0 left-0 h-screen
                    w-64
                    bg-white dark:bg-gray-900
                    border-r border-gray-200 dark:border-gray-700
                    flex flex-col z-40
                    transform transition-all duration-300
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
                >

                    {/* Identity */}
                    <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-700">

                        <div className="flex items-center gap-3">

                            <div className="h-10 w-10 rounded-md bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                <img
                                    src={
                                        admin?.logo
                                            ? `${BASE_URL}${admin.logo}`
                                            : `${BASE_URL}/uploads/admin/default.png`
                                    }
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = `${BASE_URL}/uploads/admin/default.png`;
                                    }}
                                    alt="College Logo"
                                    className="h-full w-full object-cover"
                                />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                    College Admin
                                </p>
                                <p className="text-xs text-gray-400">
                                    Management System
                                </p>
                            </div>

                        </div>

                        {admin && (
                            <div className="mt-3 text-xs space-y-1 leading-relaxed">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">Status:</span>
                                    <span className="flex items-center gap-2">
                                        <span
                                            className={`h-2 w-2 rounded-full ${
                                                admin.activestatus
                                                    ? "bg-green-500"
                                                    : "bg-red-500"
                                            }`}
                                        />
                                        <span className="text-gray-600 dark:text-gray-300">
                                            {admin.activestatus ? "Active" : "Inactive"}
                                        </span>
                                    </span>
                                </div>

                                <div>
                                    <span className="text-gray-400">Last login:</span>{" "}
                                    <span className="text-gray-600 dark:text-gray-300 break-words">
                                        {admin.lastlogin
                                            ? new Date(admin.lastlogin).toLocaleString()
                                            : "Not available"}
                                    </span>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

                        {menuItems.map((item) => {

                            const Icon = item.icon;
                            const isOpen =
                                openSections[item.name] ||
                                activeSection?.name === item.name;

                            if (item.children) {
                                return (
                                    <div key={item.name}>
                                        <button
                                            onClick={() => toggleSection(item.name)}
                                            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon size={18} />
                                                {item.name}
                                            </div>

                                            <ChevronRight
                                                size={16}
                                                className={`transition-transform duration-200 text-gray-400 ${
                                                    isOpen ? "rotate-90" : ""
                                                }`}
                                            />
                                        </button>

                                        {isOpen && (
                                            <div className="ml-8 mt-1 space-y-1">
                                                {item.children.map((sub) => {
                                                    const active = location.pathname.startsWith(sub.path);

                                                    return (
                                                        <Link
                                                            key={sub.path}
                                                            to={sub.path}
                                                            onClick={() => {
                                                                setOpenSections({});
                                                                if (window.innerWidth < 1024) {
                                                                    setIsSidebarOpen(false);
                                                                }
                                                            }}
                                                            className={`block px-3 py-1.5 rounded-md text-sm transition-colors ${
                                                                active
                                                                    ? "bg-gray-900 text-white dark:bg-gray-700"
                                                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                            }`}
                                                        >
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
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => {
                                        setOpenSections({});
                                        if (window.innerWidth < 1024) {
                                            setIsSidebarOpen(false);
                                        }
                                    }}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        isActive
                                            ? "bg-gray-900 text-white dark:bg-gray-700"
                                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    }`}
                                >
                                    <Icon size={18} />
                                    {item.name}
                                </Link>
                            );
                        })}

                    </nav>

                </aside>

                <div className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ${isSidebarOpen ? "lg:ml-64" : "ml-0"}`}>

                    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 lg:px-8">

                        <div className="flex items-center gap-4">

                            <button
                                onClick={() => setIsSidebarOpen(prev => !prev)}
                                className="text-gray-700 dark:text-gray-300 text-xl"
                            >
                                ☰
                            </button>

                            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                Admin Panel
                            </h1>

                        </div>

                        <div className="flex items-center gap-6">

                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-300 group"
                                title="Toggle theme"
                            >
                                {theme === "dark" ? (
                                    <Sun size={20} className="text-gray-300 group-hover:rotate-12" />
                                ) : (
                                    <Moon size={20} className="text-gray-700 group-hover:-rotate-12" />
                                )}
                            </button>

                            <button
                                onClick={handleLogout}
                                className="text-sm font-medium text-red-600 hover:text-red-700"
                            >
                                Logout
                            </button>

                        </div>

                    </header>

                    <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 lg:p-8 min-h-[80vh]">
                            <Outlet />
                        </div>
                    </main>

                </div>

            </div>
        </>
    );
};

export default AdminLayout;