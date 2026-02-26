import { useEffect, useState } from "react";
import axios from "axios";

const FacultyDashboard = () => {
  const token = localStorage.getItem("token");

  const [stats, setStats] = useState({
    total_subjects: 0,
    total_students: 0,
    total_classes: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/faculty/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        });

        setStats({
          total_subjects: Number(res.data?.total_subjects ?? res.data?.subjects ?? 0),
          total_students: Number(res.data?.total_students ?? res.data?.students ?? 0),
          total_classes: Number(res.data?.total_classes ?? res.data?.classes ?? 0)
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
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">Faculty Dashboard</h2>
        <p className="text-sm text-gray-500 mt-2">Overview of your faculty workspace.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard title="Total Subjects" value={loading ? "--" : stats.total_subjects} />
        <DashboardCard title="Total Students" value={loading ? "--" : stats.total_students} />
        <DashboardCard title="Total Classes" value={loading ? "--" : stats.total_classes} />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-6">
          System Overview
        </h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>Manage your subjects, students, attendance, and marks.</p>
          <p>Use the sidebar to navigate between sections.</p>
        </div>
      </div>
    </div>
  );
};

const DashboardCard = ({ title, value }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
    <p className="text-xs text-gray-500 uppercase tracking-wide">{title}</p>
    <p className="text-2xl font-semibold text-gray-800 mt-2">{value}</p>
  </div>
);

export default FacultyDashboard;