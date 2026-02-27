import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../utils/api";
import { Sun, Moon } from "lucide-react";

const AdminLayout = () => {
    const BASE_URL = api.defaults.baseURL;
    const location = useLocation();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [admin, setAdmin] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        if (!token) return;

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
    }, [token]);

    /* ===================== Logout ===================== */

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("lastPage");
        navigate("/", { replace: true });
    };

    /* ===================== Theme Toggle ===================== */

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    /* ===================== Menu ===================== */

    const menuItems = [
        { name: "Dashboard", path: "/admin/dashboard" },
        { name: "Courses", path: "/admin/courses" },
        { name: "Subjects", path: "/admin/subjects" },
        { name: "Faculties", path: "/admin/faculties" },
        { name: "Assign Subjects", path: "/admin/assign-subjects" },
        { name: "Profile", path: "/admin/profile" }
    ];

    return (
        <div className="h-screen flex bg-gray-100 dark:bg-gray-950 overflow-hidden transition-colors">

            {/* Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col z-40 transform transition-transform duration-300
                ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                lg:translate-x-0`}
            >
                {/* Identity */}
                <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-700">

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-md bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center">
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
                                <span className="text-gray-400">
                                    Last login:
                                </span>{" "}
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
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => {
                                    if (window.innerWidth < 1024) {
                                        setIsSidebarOpen(false);
                                    }
                                }}
                                className={`block px-4 py-2 rounded-md text-sm font-medium transition ${
                                    isActive
                                        ? "bg-gray-900 text-white dark:bg-gray-700"
                                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                }`}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Area */}
            <div className="flex-1 min-w-0 flex flex-col lg:ml-64 transition-all duration-300">

                {/* Header */}
                <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 lg:px-8 transition-colors">

                    <div className="flex items-center gap-4">

                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden text-gray-700 dark:text-gray-300 text-xl"
                        >
                            ☰
                        </button>

                        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                            Admin Panel
                        </h1>

                    </div>

                    <div className="flex items-center gap-6">

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-300 group"
                            title="Toggle theme"
                        >
                            {theme === "dark" ? (
                                <Sun
                                    size={20}
                                    className="text-gray-300 transition-transform duration-300 group-hover:rotate-12"
                                />
                            ) : (
                                <Moon
                                    size={20}
                                    className="text-gray-700 transition-transform duration-300 group-hover:-rotate-12"
                                />
                            )}
                        </button>

                        <button
                            onClick={handleLogout}
                            className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline transition"
                        >
                            Logout
                        </button>

                    </div>

                </header>

                {/* Content */}
                <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 lg:p-8 min-h-[80vh] transition-colors">
                        <Outlet />
                    </div>
                </main>

            </div>

        </div>
    );
};

export default AdminLayout;