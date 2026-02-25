import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";

import AdminLayout from "./pages/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminProfile from "./pages/Admin/AdminProfile";
import Courses from "./pages/Admin/Courses";
import Subjects from "./pages/Admin/Subjects";
import AssignSubjects from "./pages/Admin/AssignSubjects";
import Faculties from "./pages/Admin/Faculties.jsx";

import FacultyDashboard from "./pages/Faculty/FacultyDashboard";
import StudentDashboard from "./pages/Student/StudentDashboard";

import ProtectedRoute from "./routes/ProtectedRoute";

/* ===================== Root Redirect ===================== */

function RootRedirect() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
        return <Login />;
    }

    if (role === "admin") {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (role === "faculty") {
        return <Navigate to="/faculty/dashboard" replace />;
    }

    if (role === "student") {
        return <Navigate to="/student/dashboard" replace />;
    }

    return <Login />;
}

/* ===================== App ===================== */

function App() {
    return (
        <Router>
            <Routes>

                {/* Root Route */}
                <Route path="/" element={<RootRedirect />} />

                {/* ===================== Admin Section ===================== */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRole="admin">
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="profile" element={<AdminProfile />} />
                    <Route path="courses" element={<Courses />} />
                    <Route path="subjects" element={<Subjects />} />
                    <Route path="assign-subjects" element={<AssignSubjects />} />
                    <Route path="faculties" element={<Faculties />} />
                </Route>

                {/* ===================== Faculty ===================== */}
                <Route
                    path="/faculty/dashboard"
                    element={
                        <ProtectedRoute allowedRole="faculty">
                            <FacultyDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* ===================== Student ===================== */}
                <Route
                    path="/student/dashboard"
                    element={
                        <ProtectedRoute allowedRole="student">
                            <StudentDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Optional: Catch All */}
                <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
        </Router>
    );
}

export default App;