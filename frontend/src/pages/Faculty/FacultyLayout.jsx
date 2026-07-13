import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";
import useOfflineDetection from "./useOfflineDetection";

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
  LogOut,
  WifiOff,
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
      {
        name: "Take Attendance",
        path: "/faculty/take-attendance",
      },
      {
        name: "Edit Attendance",
        path: "/faculty/edit-attendance",
      },
    ],
  },
  {
    name: "Marks",
    icon: GraduationCap,
    children: [
      {
        name: "Enter Marks",
        path: "/faculty/enter-marks",
      },
    ],
  },
  {
    name: "Reports",
    icon: BarChart3,
    children: [
      {
        name: "Attendance Report",
        path: "/faculty/attendance-report",
      },
      {
        name: "Marks Report",
        path: "/faculty/marks-report",
      },
    ],
  },
  {
    name: "Account",
    icon: User,
    children: [
      {
        name: "Profile",
        path: "/faculty/profile",
      },
    ],
  },
];

const FacultyLayout = () => {
  const BASE_URL = api.defaults.baseURL;
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const isOffline = useOfflineDetection();

  const [user, setUser] = useState(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("facultySidebarOpen");

    return saved !== null
        ? JSON.parse(saved)
        : window.innerWidth >= 1024;
  });

  const [openSections, setOpenSections] = useState({});
  const [checking, setChecking] = useState(false);
  const [retryError, setRetryError] = useState("");
  const [imgBust, setImgBust] = useState(0);

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
  });

  /* ================= THEME ================= */

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  /* ================= SIDEBAR PERSISTENCE ================= */

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      localStorage.setItem(
          "facultySidebarOpen",
          JSON.stringify(isSidebarOpen)
      );
    }
  }, [isSidebarOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        const saved = localStorage.getItem("facultySidebarOpen");

        setIsSidebarOpen(
            saved !== null ? JSON.parse(saved) : true
        );
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /* ================= FETCH FACULTY ================= */

  useEffect(() => {
    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    const fetchFacultyProfile = async () => {
      try {
        const res = await api.get("/api/faculty/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(res.data || {});
        setImgBust(Date.now());
      } catch (error) {
        console.error("Failed to fetch faculty profile:", error);
      }
    };

    fetchFacultyProfile();

    window.addEventListener(
        "facultyUserUpdated",
        fetchFacultyProfile
    );

    return () => {
      window.removeEventListener(
          "facultyUserUpdated",
          fetchFacultyProfile
      );
    };
  }, [token, navigate]);

  /* ================= OFFLINE BODY LOCK ================= */

  useEffect(() => {
    document.body.style.overflow = isOffline ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOffline]);

  useEffect(() => {
    if (!isOffline) {
      setRetryError("");
    }
  }, [isOffline]);

  /* ================= SECTION CONTROL ================= */

  const activeSection = menuItems.find((item) =>
      item.children?.some((child) =>
          location.pathname.startsWith(child.path)
      )
  );

  const toggleSection = (name) => {
    setOpenSections((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  /* ================= ACTIONS ================= */

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  /* ================= FACULTY DATA ================= */

  const lastLoginRaw = user?.lastlogin ?? user?.lastLogin ?? "";

  const lastLogin = useMemo(() => {
    if (!lastLoginRaw) {
      return "N/A";
    }

    const date = new Date(lastLoginRaw);

    return Number.isNaN(date.getTime())
        ? String(lastLoginRaw)
        : date.toLocaleDateString();
  }, [lastLoginRaw]);

  const profileImg = useMemo(() => {
    let url = "/uploads/faculties/default.png";

    if (user?.profilepic) {
      url = String(user.profilepic).startsWith("/uploads/")
          ? user.profilepic
          : `/uploads/faculties/${user.profilepic}`;
    }

    return `${BASE_URL}${url}?v=${imgBust}`;
  }, [BASE_URL, user, imgBust]);

  return (
      <>
        {/* OFFLINE MODAL */}

        {isOffline &&
            createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-md px-4 transition-all">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full animate-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <WifiOff className="w-8 h-8" />
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      Connection Lost
                    </h2>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      We cannot reach the academic server. Please verify your network
                      connection to resume.
                    </p>

                    {retryError && (
                        <p className="text-xs font-semibold text-red-500 mt-3">
                          {retryError}
                        </p>
                    )}

                    <button
                        disabled={checking}
                        onClick={async () => {
                          if (checking) {
                            return;
                          }

                          setChecking(true);
                          setRetryError("");

                          try {
                            await api.get("/api/faculty/profile", {
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                            });

                            setChecking(false);
                            setRetryError("");
                          } catch (error) {
                            setChecking(false);
                            setRetryError("Server is still unreachable.");
                          }
                        }}
                        className="mt-8 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/30 active:scale-95 disabled:opacity-50"
                    >
                      {checking
                          ? "Verifying Connection..."
                          : "Retry Connection"}
                    </button>
                  </div>
                </div>,
                document.body
            )}

        {/* MAIN APPLICATION SHELL */}

        <div className="h-[100dvh] flex bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">

          {/* MOBILE SIDEBAR OVERLAY */}

          {isSidebarOpen && (
              <div
                  className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                  onClick={() => setIsSidebarOpen(false)}
              />
          )}

          {/* SIDEBAR */}

          <aside
              className={`fixed top-0 left-0 h-[100dvh] w-[280px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${
                  isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
          >
            {/* IDENTITY BLOCK */}

            <div className="border-b border-slate-100 dark:border-slate-800/60">
              <div className="px-6 py-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex-shrink-0">
                    <img
                        src={profileImg}
                        alt="Faculty"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                              `${BASE_URL}/uploads/faculties/default.png`;
                        }}
                    />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {user?.name ||
                          user?.fullname ||
                          "Faculty Member"}
                    </h2>

                    <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold truncate">
                      Faculty Portal
                    </p>
                  </div>
                </div>

                {user && (
                    <div className="mt-5 bg-slate-50 dark:bg-slate-950/50 rounded-lg p-3 text-[11px] font-medium border border-slate-100 dark:border-slate-800/60 space-y-2">
                      <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">
                      Status
                    </span>

                        <div className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />

                          <span className="text-slate-700 dark:text-slate-300 font-bold">
                        Online
                      </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">
                      Last Auth
                    </span>

                        <span className="text-slate-700 dark:text-slate-300 font-mono font-bold">
                      {lastLogin}
                    </span>
                      </div>
                    </div>
                )}
              </div>
            </div>

            {/* NAVIGATION MENU */}

            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {menuItems.map((item) => {
                const Icon = item.icon;

                const isOpen =
                    openSections[item.name] ||
                    activeSection?.name === item.name;

                if (item.children) {
                  return (
                      <div key={item.name} className="mb-1">
                        <button
                            onClick={() => toggleSection(item.name)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                                isOpen
                                    ? "text-slate-900 dark:text-white"
                                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon
                                className={`w-5 h-5 ${
                                    isOpen
                                        ? "text-blue-600 dark:text-blue-500"
                                        : ""
                                }`}
                            />

                            {item.name}
                          </div>

                          <ChevronRight
                              className={`w-4 h-4 transition-transform duration-200 ${
                                  isOpen
                                      ? "rotate-90 text-slate-900 dark:text-white"
                                      : ""
                              }`}
                          />
                        </button>

                        <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                isOpen
                                    ? "max-h-48 opacity-100 mt-1"
                                    : "max-h-0 opacity-0"
                            }`}
                        >
                          <div className="ml-5 pl-3 border-l border-slate-200 dark:border-slate-800 space-y-1 py-1">
                            {item.children.map((sub) => {
                              const active =
                                  location.pathname.startsWith(sub.path);

                              return (
                                  <Link
                                      key={sub.path}
                                      to={sub.path}
                                      onClick={() => {
                                        if (window.innerWidth < 1024) {
                                          setIsSidebarOpen(false);
                                        }
                                      }}
                                      className={`block px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
                                          active
                                              ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold"
                                              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                      }`}
                                  >
                                    {sub.name}
                                  </Link>
                              );
                            })}
                          </div>
                        </div>
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
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            isActive
                                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                );
              })}
            </nav>
          </aside>

          {/* CANVAS */}

          <div
              className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ease-in-out ${
                  isSidebarOpen ? "lg:ml-[280px]" : "ml-0"
              }`}
          >
            {/* HEADER */}

            <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
              <div className="flex items-center justify-between px-4 sm:px-8 h-16">
                <div className="flex items-center gap-4">
                  <button
                      onClick={() => setIsSidebarOpen((prev) => !prev)}
                      className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none"
                  >
                    <Menu className="w-5 h-5" />
                  </button>

                  <h1 className="text-sm font-bold text-slate-800 dark:text-slate-200 hidden sm:block">
                    Faculty Panel
                  </h1>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                  <button
                      onClick={toggleTheme}
                      className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg transition-colors focus:outline-none"
                      title="Toggle Theme"
                  >
                    {theme === "dark" ? (
                        <Sun className="w-5 h-5" />
                    ) : (
                        <Moon className="w-5 h-5" />
                    )}
                  </button>

                  <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block mx-1" />

                  <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors focus:outline-none group"
                  >
                    <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />

                    <span className="hidden sm:inline">
                    Sign Out
                  </span>
                  </button>
                </div>
              </div>
            </header>

            {/* RENDER AREA */}

            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-950 relative scroll-smooth">
              <Outlet />
            </main>
          </div>
        </div>
      </>
  );
};

export default FacultyLayout;