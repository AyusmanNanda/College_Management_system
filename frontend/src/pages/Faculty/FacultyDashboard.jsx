import React, { useEffect, useState } from "react";
import api from "../../utils/api";




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
  



 const token = localStorage.getItem("token");
 const [stats, setStats] = useState({
  totalStudents: 0,
  totalFaculty: 0,
  totalSubjects: 0,
});

  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchStats = async () => {
    try {
      const res = await api.get("/api/faculty/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStats({
        totalStudents: res.data.total_students ?? 0,
        totalFaculty: res.data.total_faculty ?? 0,
        totalSubjects: res.data.total_subjects ?? 0,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (token) fetchStats();
}, [token]);






 return (
  <div className="relative">

    

<div>

      <div className="w-[94vw] sm:w-full min-h-[90vh] sm:min-h-[550px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 transition-colors mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100">
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
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 shadow-sm transition-colors col-span-full">
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
    </div>
    </div>
  );
  
}