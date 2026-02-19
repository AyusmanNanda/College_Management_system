import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import AdminLayout from "../pages/Admin/AdminLayout";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminProfile from "../pages/Admin/AdminProfile";
import CollegeInfo from "../pages/Admin/CollegeInfo";
import StudentDashboard from "../pages/Student/StudentDashboard";
import FacultyDashboard from "../pages/Faculty/FacultyDashboard";
import Courses from "../pages/Admin/Courses";


const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />

                {/* Admin Routes with Layout */}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="profile" element={<AdminProfile />} />
                    <Route path="college" element={<CollegeInfo />} />
                    <Route path="courses" element={<Courses />} />

                </Route>

                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/faculty/dashboard" element={<FacultyDashboard />} />

            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;
