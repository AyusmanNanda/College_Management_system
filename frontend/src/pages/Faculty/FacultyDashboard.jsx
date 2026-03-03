import React, { useEffect, useState } from "react";

function StatCard({ title, value }) {
  return (
    <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm transition-colors">
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {title}
      </p>
      <p className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-2">
        {value}
      </p>
    </div>
  );
}

export default function FacultyDashboard() {
 const [stats, setStats] = useState({
  totalStudents: 0,
  totalFaculty: 0,
  totalSubjects: 0,
});

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");

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
  totalSubjects: data.total_subjects ?? 0,
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
    <div className="w-full h-[600px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-10 lg:p-12 space-y-10 transition-colors">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Faculty Dashboard
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Overview of your college management system.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        <StatCard
          title="Total Students"
          value={loading ? "--" : stats.totalStudents}
        />
        <StatCard
          title="Total Faculty"
          value={loading ? "--" : stats.totalFaculty}
        />
        <StatCard
          title="Total Subjects"
          value={loading ? "--" : stats.totalSubjects}
        />

        {/* System Information */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 shadow-sm transition-colors col-span-full">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide mb-6">
            System Overview
          </h3>

          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <p>Manage students, faculty tasks, and subjects.</p>
            <p>Use the sidebar to navigate between sections.</p>
          </div>
        </div>

      </div>
    </div>
  );
}