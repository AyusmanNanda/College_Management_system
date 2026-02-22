import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";

import AdminLayout from "./pages/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminProfile from "./pages/Admin/AdminProfile";
import Courses from "./pages/Admin/Courses";

import FacultyDashboard from "./pages/Faculty/FacultyDashboard";
import StudentDashboard from "./pages/Student/StudentDashboard";

import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />

                {/* Admin Section */}
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
                </Route>

                {/* Faculty */}
                <Route
                    path="/faculty/dashboard"
                    element={
                        <ProtectedRoute allowedRole="faculty">
                            <FacultyDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Student */}
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