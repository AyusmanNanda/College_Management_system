import React, { useEffect, useState } from "react";
import api from "../../utils/api";

function StatCard({ title, value }) {
  return (
    <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {title}
      </p>
      <p className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-2">
        {value}
      </p>
    </div>
  );
}

export default function StudentDashboard() {

  const token = localStorage.getItem("token");

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await api.get("/api/student/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStudent(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchStudent();
  }, [token]);

  return (
    <div className="w-[94vw] sm:w-full min-h-[90vh] sm:min-h-[550px]
      bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
      rounded-xl shadow-sm p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 mx-auto">

      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Student Dashboard
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Overview of your academic details.
        </p>
      </div>

      {/* Cards (same as faculty style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">

        <StatCard
          title="Name"
          value={
            loading
              ? "--"
              : `${student?.firstname || ""} ${student?.lastname || ""}`
          }
        />

        <StatCard
          title="Roll Number"
          value={loading ? "--" : student?.rollnumber}
        />

        <StatCard
          title="Course"
          value={loading ? "--" : student?.courcecode}
        />

        <StatCard
          title="Semester"
          value={loading ? "--" : student?.semoryear || "N/A"}
        />

      </div>

      {/* Info Section (same style as faculty) */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 shadow-sm col-span-full">

        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide mb-6">
          Student Portal
        </h3>

        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <p>View your attendance records.</p>
          <p>Check your marks and performance.</p>
          <p>Update your profile anytime.</p>
        </div>

      </div>

    </div>
  );
}
