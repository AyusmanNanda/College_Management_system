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

function App() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    return (
        <Router>
            <Routes>

                {/* Root Route - Auto Redirect If Logged In */}
                <Route
                    path="/"
                    element={
                        token ? (
                            role === "admin" ? (
                                <Navigate to="/admin/dashboard" />
                            ) : role === "faculty" ? (
                                <Navigate to="/faculty/dashboard" />
                            ) : role === "student" ? (
                                <Navigate to="/student/dashboard" />
                            ) : (
                                <Login />
                            )
                        ) : (
                            <Login />
                        )
                    }
                />

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

                {/* ===================== Faculty Section ===================== */}
                <Route
                    path="/faculty/dashboard"
                    element={
                        <ProtectedRoute allowedRole="faculty">
                            <FacultyDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* ===================== Student Section ===================== */}
                <Route
                    path="/student/dashboard"
                    element={
                        <ProtectedRoute allowedRole="student">
                            <StudentDashboard />
                        </ProtectedRoute>
                    }
                />

            </Routes>
        </Router>
    );
}

export default App;