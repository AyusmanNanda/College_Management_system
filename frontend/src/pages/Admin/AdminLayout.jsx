import { Link, Outlet, useLocation } from "react-router-dom";

/*
  Admin Layout
  ------------
  - Sidebar navigation
  - Main content area
  - Nested route rendering via <Outlet />
*/

const AdminLayout = () => {
    const location = useLocation();

    const menuItems = [
        { name: "Dashboard", path: "/admin/dashboard" },
        { name: "Profile", path: "/admin/profile" },
        { name: "College Info", path: "/admin/college" },
        { name: "Courses", path: "/admin/courses" } // upcoming feature
    ];

    return (
        <div className="min-h-screen flex bg-gray-100">

            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-lg">

                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Admin Panel
                    </h2>
                </div>

                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`block px-4 py-2 rounded-lg transition ${
                                location.pathname === item.path
                                    ? "bg-indigo-600 text-white"
                                    : "text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <Outlet />
            </main>

        </div>
    );
};

export default AdminLayout;
