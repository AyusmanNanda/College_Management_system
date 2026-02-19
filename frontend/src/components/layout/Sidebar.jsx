import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ logo, menuItems }) => {
    const location = useLocation();

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">

            <div className="px-6 py-6 border-b border-gray-200 flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-gray-100 overflow-hidden flex items-center justify-center">
                    {logo ? (
                        <img
                            src={logo}
                            alt="Logo"
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
    );
};

export default Sidebar;
