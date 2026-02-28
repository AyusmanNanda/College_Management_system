import React, { useEffect, useState } from "react";

function StatCard({ title, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="text-[12px] tracking-wider text-gray-500 uppercase">
        {title}
      </div>
      <div className="mt-3 text-[28px] font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}

export default function FacultyDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    assignedSubjects: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");

        // If token missing, avoid crash
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch("http://localhost:5000/api/dashboard/faculty", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          console.error("Faculty stats API error:", data);
          setLoading(false);
          return;
        }

        setStats({
          totalStudents: data.total_students ?? 0,
          totalFaculty: data.total_faculty ?? 0,
          assignedSubjects: data.assigned_subjects ?? 0,
        });

        setLoading(false);
      } catch (err) {
        console.error("Failed to load faculty dashboard stats:", err);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="p-10">
        <h1 className="text-[28px] font-semibold text-gray-900">
          Faculty Dashboard
        </h1>
        <p className="mt-1 text-[14px] text-gray-500">
          Overview of your college management system.
        </p>

        {/* Cards row */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Students"
            value={loading ? "..." : stats.totalStudents}
          />
          <StatCard
            title="Total Faculties"
            value={loading ? "..." : stats.totalFaculty}
          />
          <StatCard
            title="Assigned Subjects"
            value={loading ? "..." : stats.assignedSubjects}
          />
        </div>

        {/* System overview (NO extra fields) */}
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <div className="text-[13px] font-semibold tracking-wider text-gray-700 uppercase">
            System Overview
          </div>

          <div className="mt-5 text-[14px] text-gray-600 space-y-2">
            <p>Manage students, faculty tasks, and assigned subjects.</p>
            <p>Use the sidebar to navigate between sections.</p>
          </div>
        </div>
      </div>
    </div>
  );
}