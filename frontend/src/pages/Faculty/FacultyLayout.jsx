import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";
import {
  Sun,
  Moon,
  LayoutDashboard,
  ClipboardCheck,
  GraduationCap,
  BarChart3,
  User,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/faculty/dashboard",
  },
  {
    name: "Attendance",
    icon: ClipboardCheck,
    children: [
      { name: "Take Attendance", path: "/faculty/take-attendance" },
      { name: "Edit Attendance", path: "/faculty/edit-attendance" },
    ],
  },
  {
    name: "Marks",
    icon: GraduationCap,
    children: [{ name: "Enter Marks", path: "/faculty/enter-marks" }],
  },
  {
    name: "Reports",
    icon: BarChart3,
    children: [
      { name: "Attendance Report", path: "/faculty/attendance-report" },
      { name: "Marks Report", path: "/faculty/marks-report" },
    ],
  },
  {
    name: "Account",
    icon: User,
    children: [{ name: "Profile", path: "/faculty/profile" }],
  },
];

const FacultyLayout = () => {
  const BASE_URL = api.defaults.baseURL;
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [openSections, setOpenSections] = useState([]);
  const [imgBust, setImgBust] = useState(0);

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme;

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  const showSidebarText = true;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    const fetchFacultyProfile = async () => {
      try {
        const res = await api.get("/api/faculty/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data || {});
        setImgBust(Date.now());
      } catch (error) {
        console.error("Failed to fetch faculty profile:", error);
      }
    };

    fetchFacultyProfile();
    window.addEventListener("facultyUserUpdated", fetchFacultyProfile);

    return () => {
      window.removeEventListener("facultyUserUpdated", fetchFacultyProfile);
    };
  }, [token, navigate]);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const activeSection = menuItems.find((item) =>
      item.children?.some((child) => location.pathname === child.path)
    );

    if (activeSection) {
      setOpenSections([activeSection.name]);
    } else {
      setOpenSections([]);
    }
  }, [location.pathname]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  const toggleSection = (sectionName) => {
    setOpenSections((prev) =>
      prev.includes(sectionName)
        ? prev.filter((name) => name !== sectionName)
        : [...prev, sectionName]
    );
  };

  const hasActiveChild = (children = []) =>
    children.some((child) => location.pathname === child.path);

  const lastLoginRaw = user?.lastlogin ?? user?.lastLogin ?? "";

  const lastLogin = (() => {
    if (!lastLoginRaw) return "Not available";
    const d = new Date(lastLoginRaw);
    if (Number.isNaN(d.getTime())) return String(lastLoginRaw);
    return d.toLocaleString();
  })();

  const profileImg = useMemo(() => {
    let url = "/uploads/faculties/default.png";

    if (user?.profilepic) {
      if (String(user.profilepic).startsWith("/uploads/")) {
        url = user.profilepic;
      } else {
        url = `/uploads/faculties/${user.profilepic}`;
      }
    }

    return `${BASE_URL}${url}?v=${imgBust}`;
  }, [BASE_URL, user, imgBust]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 transition-colors">
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
  className={`
    fixed inset-y-0 left-0 z-50 flex h-screen flex-col
    w-[295px] border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900
    transition-transform duration-300
    ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
    ${collapsed ? "lg:-translate-x-full" : "lg:translate-x-0"}
  `}
>
        <div className="border-b border-gray-200 px-4 py-5 dark:border-gray-700">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-300 bg-white dark:border-gray-600">
              <img
                src={profileImg}
                alt="Faculty"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `${BASE_URL}/uploads/faculties/default.png?v=${imgBust}`;
                }}
              />
            </div>

            {showSidebarText && (
              <div className="min-w-0 pt-0.5">
                <p className="truncate text-[14px] font-semibold text-gray-900 dark:text-gray-100">
                  College Faculty
                </p>
                <p className="truncate text-[13px] text-gray-500 dark:text-gray-400">
                  Management System
                </p>
              </div>
            )}

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="ml-auto rounded-md p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          {showSidebarText && (
            <div className="mt-4 space-y-2 text-[13px]">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400">Status:</span>
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Active
                </span>
              </div>

              <div className="leading-5 text-gray-500 dark:text-gray-400">
                <span>Last login: </span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {lastLogin}
                </span>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {menuItems.map((item) => {
            const Icon = item.icon;

            if (item.children) {
              const isOpen = openSections.includes(item.name);
              const sectionHasActiveChild = hasActiveChild(item.children);

              return (
                <div key={item.name}>
                  <button
                    type="button"
                    onClick={() => toggleSection(item.name)}
                    className={`
                      flex w-full items-center rounded-lg px-4 py-2.5 text-[14px] font-medium transition-all duration-200
                      ${
                        sectionHasActiveChild
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                      }
                      ${showSidebarText ? "justify-between" : "lg:justify-center"}
                    `}
                  >
                    <div className={`flex items-center ${showSidebarText ? "gap-3" : ""}`}>
                      <Icon size={18} className="shrink-0" />
                      {showSidebarText && <span>{item.name}</span>}
                    </div>

                    {showSidebarText && (
                      <ChevronRight
                        size={16}
                        className={`shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-90" : ""
                        }`}
                      />
                    )}
                  </button>

                  {showSidebarText && (
                    <div
                      className={`overflow-hidden transition-all duration-200 ${
                        isOpen ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="ml-8 space-y-1">
                        {item.children.map((sub) => {
                          const subActive = location.pathname === sub.path;

                          return (
                            <Link
                              key={sub.path}
                              to={sub.path}
                              className={`
                                block rounded-lg px-3 py-2 text-[14px] transition-all duration-200
                                ${
                                  subActive
                                    ? "bg-black text-white dark:bg-slate-600"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                                }
                              `}
                            >
                              {sub.name}
                            </Link>
                          );
                        })}
                      </div>
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
                className={`
                  flex items-center rounded-lg px-4 py-2.5 text-[14px] font-medium transition-all duration-200
                  ${
                    active
                      ? "bg-black text-white dark:bg-slate-600"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                  }
                  ${showSidebarText ? "gap-3" : "lg:justify-center"}
                `}
              >
                <Icon size={18} className="shrink-0" />
                {showSidebarText && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div
  className={`min-h-screen transition-all duration-300 ${
    collapsed ? "lg:ml-0" : "lg:ml-[295px]"
  }`}
>
        <header className="h-[70px] border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <div className="flex h-full items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="rounded-md p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 lg:hidden"
              >
                <Menu size={20} />
              </button>

              <button
                onClick={() => setCollapsed((prev) => !prev)}
                className="hidden rounded-md p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 lg:inline-flex"
              >
                <Menu size={20} />
              </button>

              <h1 className="text-[18px] font-semibold text-gray-900 dark:text-gray-100 lg:text-[20px]">
                Faculty Panel
              </h1>
            </div>

            <div className="flex items-center gap-4 lg:gap-6">
              <button
                onClick={toggleTheme}
                className="rounded-md p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                title="Toggle theme"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <button
                onClick={handleLogout}
                className="text-[14px] font-semibold text-red-600 hover:text-red-700 lg:text-[15px]"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="p-3 sm:p-4 lg:p-6">
          <div className="w-full overflow-x-auto">
            <div className="min-w-0">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FacultyLayout;