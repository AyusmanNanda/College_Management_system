import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";
import {
  Sun,
  Moon,
  LayoutDashboard,
  ClipboardCheck,
  GraduationCap,
  User,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/student/dashboard",
  },
  {
    name: "Attendance",
    icon: ClipboardCheck,
    path: "/student/attendance",
  },
  {
    name: "Marksheet",
    icon: GraduationCap,
    path: "/student/marksheet",
  },
  {
    name: "Account",
    icon: User,
    children: [
      { name: "My Profile", path: "/student/profile" },
    ],
  },
];

const StudentLayout = () => {
  const BASE_URL = api.defaults.baseURL;
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [openSections, setOpenSections] = useState([]);

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  const showSidebarText = !collapsed || mobileSidebarOpen;

  /* ================= THEME ================= */
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  /* ================= FETCH STUDENT ================= */
  useEffect(() => {
    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    const fetchStudent = async () => {
      try {
        const res = await api.get("/api/student/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data || {});
      } catch (err) {
        console.error(err);
      }
    };

    fetchStudent();
  }, [token, navigate]);

  /* ================= NAV CLOSE MOBILE ================= */
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  /* ================= SECTION CONTROL ================= */
  useEffect(() => {
    const active = menuItems.find((item) =>
      item.children?.some((child) => location.pathname === child.path)
    );

    if (active) {
      setOpenSections([active.name]);
    } else {
      setOpenSections([]);
    }
  }, [location.pathname]);

  const toggleSection = (name) => {
    setOpenSections((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name]
    );
  };

  const hasActiveChild = (children = []) =>
    children.some((c) => location.pathname === c.path);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  const profileImg = useMemo(() => {
    let url = "/uploads/students/default.png";

    if (user?.profilepic) {
      url = `/uploads/students/${user.profilepic}`;
    }

    return `${BASE_URL}${url}`;
  }, [BASE_URL, user]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100">

      {/* Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[295px] flex-col border-r bg-white dark:bg-gray-900 transition-all
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
        ${collapsed ? "lg:w-[86px]" : "lg:w-[295px]"}`}
      >

        {/* Profile */}
        <div className="border-b p-4">
          <div className="flex items-center gap-3">
            <img
              src={profileImg}
              alt="student"
              className="h-12 w-12 rounded-full object-cover"
            />

            {showSidebarText && (
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {user?.firstname} {user?.lastname}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.rollnumber}
                </p>
              </div>
            )}

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="ml-auto lg:hidden"
            >
              <X />
            </button>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">

          {menuItems.map((item) => {
            const Icon = item.icon;

            if (item.children) {
              const isOpen = openSections.includes(item.name);

              return (
                <div key={item.name}>
                  <button
                    onClick={() => toggleSection(item.name)}
                    className="flex w-full justify-between px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <div className="flex gap-3 items-center">
                      <Icon size={18} />
                      {showSidebarText && item.name}
                    </div>
                    {showSidebarText && (
                      <ChevronRight
                        className={`${isOpen ? "rotate-90" : ""}`}
                      />
                    )}
                  </button>

                  {isOpen && (
                    <div className="ml-6 space-y-1">
                      {item.children.map((sub) => (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          className="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg
                ${active
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon size={18} />
                {showSidebarText && item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className={`${collapsed ? "lg:ml-[86px]" : "lg:ml-[295px]"}`}>

        {/* Header */}
        <header className="h-[70px] flex justify-between items-center px-6 bg-white dark:bg-gray-900 border-b text-gray-900 dark:text-gray-100">

          <div className="flex items-center gap-3">
            <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden">
              <Menu />
            </button>

            <button onClick={() => setCollapsed((p) => !p)} className="hidden lg:block">
              <Menu />
            </button>

            <h1 className="font-semibold">Student Panel</h1>
          </div>

          <div className="flex gap-4 items-center">
            <button onClick={toggleTheme}>
              {theme === "dark" ? <Sun /> : <Moon />}
            </button>

            <button onClick={handleLogout} className="text-red-600">
              Logout
            </button>
          </div>

        </header>

        {/* Content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default StudentLayout;
