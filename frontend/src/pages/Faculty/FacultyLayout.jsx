import React, { useMemo } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

export default function FacultyLayout() {
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const lastLoginRaw =
  user?.lastlogin ||
  user?.lastLogin ||
  localStorage.getItem("lastlogin");

const lastLogin = lastLoginRaw
  ? new Date(lastLoginRaw).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata"
    })
  : "-";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-[280px] bg-white border-r border-gray-200">
          <div className="px-6 py-6">
            <div className="flex items-start gap-3">
              {/* Replace this with your logo image later if needed */}
              <div className="h-11 w-11 rounded-full border border-gray-300 grid place-items-center text-gray-700 font-semibold text-sm">
                CM
              </div>

              <div className="leading-tight">
                <div className="text-[15px] font-semibold text-gray-900">
                  College Faculty
                </div>
                <div className="text-[13px] text-gray-500">
                  Management System
                </div>
              </div>
            </div>

            {/* Status + last login (same like admin) */}
            <div className="mt-6 space-y-2 text-[13px] text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Status:</span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  <span className="font-medium text-gray-700">Active</span>
                </span>
              </div>

              <div className="text-gray-500">
                Last login:{" "}
                <span className="text-gray-700">{lastLogin}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200" />

          {/* Menu */}
          <nav className="px-5 py-6">
            <NavLink
              to="/faculty/dashboard"
              className={({ isActive }) =>
                [
                  "block w-full text-left px-5 py-3 rounded-xl font-medium transition text-[14px]",
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100",
                ].join(" ")
              }
            >
              Dashboard
            </NavLink>
          </nav>
        </aside>

        {/* Main */}
        <section className="flex-1">
          {/* Top header */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
            <div className="text-[20px] font-semibold text-gray-900">
              Faculty Panel
            </div>

            <button
              onClick={logout}
              className="text-red-600 font-medium hover:text-red-700 text-[14px]"
            >
              Logout
            </button>
          </header>

          <main className="px-8 py-8">
            <Outlet />
          </main>
        </section>
      </div>
    </div>
  );
}