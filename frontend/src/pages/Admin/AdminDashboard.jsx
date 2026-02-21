const AdminDashboard = () => {
    return (
        <div className="space-y-10">

            {/* Page Title */}
            <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                    Admin Dashboard
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                    Overview of your college management system.
                </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-6">

                <DashboardCard title="Total Courses" value="--" />
                <DashboardCard title="Total Faculty" value="--" />
                <DashboardCard title="Total Students" value="--" />

            </div>

            {/* System Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-6">
                    System Overview
                </h3>

                <div className="space-y-2 text-sm text-gray-600">
                    <p>
                        Manage courses, college profile, and administrative settings.
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
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <p className="text-xs text-gray-500 uppercase tracking-wide">
            {title}
        </p>
        <p className="text-2xl font-semibold text-gray-800 mt-2">
            {value}
        </p>
    </div>
);

export default AdminDashboard;