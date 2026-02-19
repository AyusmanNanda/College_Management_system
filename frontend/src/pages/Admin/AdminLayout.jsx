import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

/*
  Admin Layout
  ------------
  - Single admin system
  - Fetches logo from admin profile
  - Clean sidebar + header layout
  - Logout moved to header (top right)
*/

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [logo, setLogo] = useState(null);

    useEffect(() => {
        const fetchAdmin = async () => {
            try {
                if (!token) return;

                const res = await axios.get(
                    "http://localhost:5000/api/admin/profile",
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                if (res.data?.logo) {
                    setLogo(`http://localhost:5000${res.data.logo}`);
                }

            } catch (error) {
                console.error(error);
            }
        };

        fetchAdmin();
    }, [token]);

    const handleLogout = async () => {
        try {
            await axios.post(
                "http://localhost:5000/api/auth/logout",
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            localStorage.removeItem("token");
            navigate("/");

        } catch (error) {
            console.error(error);
        }
    };

    const menuItems = [
        { name: "Dashboard", path: "/admin/dashboard" },
        { name: "Profile", path: "/admin/profile" }
    ];

    return (
        <div className="min-h-screen flex bg-gray-100">

            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">

                {/* Logo + Title */}
                <div className="px-6 py-6 border-b border-gray-200 flex items-center gap-3">

                    <div className="h-10 w-10 rounded-md bg-gray-100 overflow-hidden flex items-center justify-center">
                        {logo ? (
                            <img
                                src={logo}
                                alt="College Logo"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-gray-500 text-xs font-semibold">
                                CM
                            </span>
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

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
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
            <div className="flex-1 flex flex-col">

                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
                    <h1 className="text-lg font-semibold text-gray-800">
                        Admin Panel
                    </h1>

                    {/* Logout moved here */}
                    {/*<button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition"
                    >
                        Logout
                    </button>*/}
                    <button
                        onClick={handleLogout}
                        className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline transition"
                    >
                        Logout
                    </button>



                </header>

                {/* Content */}
                <main className="flex-1 p-8">
                    <div className="bg-white rounded-lg shadow-sm p-8 min-h-[80vh]">
                        <Outlet />
                    </div>
                </main>

            </div>

        </div>
    );
};

export default AdminLayout;
