import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import api from "../../utils/api";

export default function FacultyLayout() {
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme;

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const [user, setUser] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
});



  

 const [imgBust, setImgBust] = useState(
  localStorage.getItem("imgBust") || "0"
);


useEffect(() => {
  const syncAll = () => {
    try {
      setUser(JSON.parse(localStorage.getItem("user") || "{}"));
    } catch {
      setUser({});
    }

    setImgBust(localStorage.getItem("imgBust") || "0");
  };

  syncAll();

  window.addEventListener("facultyUserUpdated", syncAll);
window.addEventListener("storage", syncAll);

  return () => {
    window.removeEventListener("facultyUserUpdated", syncAll);
window.removeEventListener("storage", syncAll);
  };
}, []);


const lastLoginRaw =
    user?.lastlogin || user?.lastLogin || localStorage.getItem("lastlogin");

  const lastLogin = lastLoginRaw
  ? (() => {
      const d = new Date(lastLoginRaw);

      const MM = String(d.getMonth() + 1).padStart(2, "0");
      const DD = String(d.getDate()).padStart(2, "0");
      const YYYY = d.getFullYear();

      let hh = d.getHours();
      const ampm = hh >= 12 ? "PM" : "AM";
      hh = hh % 12 || 12;

      const HH = String(hh).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");

      return `${MM}/${DD}/${YYYY}, ${HH}:${mm} ${ampm}`;
    })()
  : "-";



const profileImg = useMemo(() => {
  let url = "/uploads/faculties/default.png";

  if (user?.profilepic) {
    if (String(user.profilepic).startsWith("/uploads/")) {
      url = user.profilepic;
    } else {
      url = `/uploads/faculties/${user.profilepic}`;
    }
  }

  // ✅ IMPORTANT: add backend baseURL
  return `${api.defaults.baseURL}${url}?v=${imgBust}`;
}, [user, imgBust]);
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-gray-950 overflow-hidden transition-colors">
      <div className="flex w-full">
        {/* Sidebar */}
        <aside className="h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-colors">
          <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center">
  <img
    src={profileImg}
    alt="Profile"
    className="h-full w-full object-cover"
    onError={(e) => {
      e.target.onerror = null;
      e.target.src = `${api.defaults.baseURL}/uploads/faculties/default.png?v=${imgBust}`;
    }}
  />
</div>

              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  College Faculty
                </p>
                <p className="text-xs text-gray-400">Management System</p>
              </div>
            </div>

            <div className="mt-3 text-xs space-y-1 leading-relaxed">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
  <span>Status:</span>

  <span className="inline-flex items-center gap-2 text-gray-800 dark:text-gray-100 font-medium">
    <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
    Active
  </span>
</div>
              <div className="text-gray-500 dark:text-gray-400">
                Last login:{" "}
                <span className="text-gray-800 dark:text-gray-100 font-medium">
                  {lastLogin}
                </span>
              </div>
            </div>
          </div>

          {/* Menu */}
          <nav className="flex-1 px-4 py-6 space-y-2">
  <NavLink
    to="/faculty/dashboard"
    className={({ isActive }) =>
      [
        "block w-full px-4 py-3 rounded-lg font-medium transition text-sm",
        isActive
          ? "bg-slate-900 text-white shadow-sm dark:bg-gray-700"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
      ].join(" ")
    }
  >
    Dashboard
  </NavLink>

  <NavLink
    to="/faculty/profile"
    className={({ isActive }) =>
      [
        "block w-full px-4 py-3 rounded-lg font-medium transition text-sm",
        isActive
          ? "bg-slate-900 text-white shadow-sm dark:bg-gray-700"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
      ].join(" ")
    }
  >
    Profile
  </NavLink>
</nav>
        </aside>

        {/* Main */}
        <section className="flex-1 flex flex-col">
          {/* Top header */}
          <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 lg:px-8 transition-colors">
            <div className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              Faculty Panel
            </div>

            <div className="flex items-center gap-6">
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
                onClick={logout}
                className="text-red-600 font-medium hover:text-red-700 hover:underline transition text-sm"
              >
                Logout
              </button>
            </div>
          </header>

          <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <Outlet />
          </main>
        </section>
      </div>
    </div>
  );
}