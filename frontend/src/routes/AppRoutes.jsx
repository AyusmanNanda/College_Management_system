import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import StudentDashboard from "../pages/Student/StudentDashboard";
import FacultyDashboard from "../pages/Faculty/FacultyDashboard";

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;
