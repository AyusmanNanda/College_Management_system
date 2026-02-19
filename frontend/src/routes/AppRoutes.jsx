import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import StudentDashboard from "../pages/Student/StudentDashboard";
import FacultyDashboard from "../pages/Faculty/FacultyDashboard";
import AdminProfile from "../pages/Admin/AdminProfile";
import CollegeInfo from "../pages/Admin/CollegeInfo";


const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/profile" element={<AdminProfile />} />
                <Route path="/admin/college" element={<CollegeInfo />} />
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;
