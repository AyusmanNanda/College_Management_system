import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [admin, setAdmin] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        if (!token) return;

        const fetchAdmin = async () => {
            try {
                const res = await axios.get(
                    "http://localhost:5000/api/admin/profile",
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

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("lastPage");
        navigate("/", { replace: true });
    };

    const menuItems = [
        { name: "Dashboard", path: "/admin/dashboard" },
        { name: "Courses", path: "/admin/courses" },
        { name: "Subjects", path: "/admin/subjects" },
        { name: "Faculties", path: "/admin/faculties" },
        { name: "Assign Subjects", path: "/admin/assign-subjects" },
        { name: "Profile", path: "/admin/profile" }
    ];

    return (
        <div className="h-screen flex bg-gray-100 overflow-hidden">

            {/* Overlay (Mobile only) */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-40 transform transition-transform duration-300
                ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                lg:translate-x-0`}
            >

                {/* Identity */}
                <div className="px-6 py-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-gray-100 overflow-hidden flex items-center justify-center">
                            {admin && (
                                <img
                                    src={`http://localhost:5000${admin.logo}`}
                                    alt="College Logo"
                                    className="h-full w-full object-cover"
                                />
                            )}
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-gray-800">
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
                                    <span className="text-gray-600">
                                        {admin.activestatus ? "Active" : "Inactive"}
                                    </span>
                                </span>
                            </div>

                            <div>
                                <span className="text-gray-400">
                                    Last login:
                                </span>{" "}
                                <span className="text-gray-600 break-words">
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
                                        ? "bg-gray-900 text-white"
                                        : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Area */}
            <div className="flex-1 flex flex-col lg:ml-64 transition-all duration-300">

                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-8">

                    <div className="flex items-center gap-4">

                        {/* Toggle Button */}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="lg:hidden text-gray-700"
                        >
                            ☰
                        </button>

                        <h1 className="text-lg font-semibold text-gray-800">
                            Admin Panel
                        </h1>

                    </div>

                    <button
                        onClick={handleLogout}
                        className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline transition"
                    >
                        Logout
                    </button>
                </header>

                <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                    <div className="bg-white rounded-lg shadow-sm p-6 lg:p-8 min-h-[80vh]">
                        <Outlet />
                    </div>
                </main>

            </div>

        </div>
    );
};

export default AdminLayout;