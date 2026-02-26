import { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
    const token = localStorage.getItem("token");

    const [stats, setStats] = useState({
        total_courses: 0,
        total_faculty: 0,
        total_students: 0
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(
                    "http://localhost:5000/api/dashboard",
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                setStats(res.data);
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

            {/* Page Title */}
            <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                    Admin Dashboard
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Overview of your college management system.
                </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                <DashboardCard
                    title="Total Courses"
                    value={loading ? "--" : stats.total_courses}
                />

                <DashboardCard
                    title="Total Faculty"
                    value={loading ? "--" : stats.total_faculty}
                />

                <DashboardCard
                    title="Total Students"
                    value={loading ? "--" : stats.total_students}
                />

            </div>

            {/* System Information */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm transition-colors">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide mb-6">
                    System Overview
                </h3>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <p>
                        Manage courses, faculty, students, and administrative settings.
                    </p>
                    <p>
                        Use the sidebar to navigate between sections.
                    </p>
                </div>
            </div>

        </div>
    );
};

const DashboardCard = ({ title, value }) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm transition-colors">
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {title}
        </p>
        <p className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-2">
            {value}
        </p>
    </div>
);

export default AdminDashboard;