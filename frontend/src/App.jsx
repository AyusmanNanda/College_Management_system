import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminProfile from "./pages/Admin/AdminProfile";
import CollegeInfo from "./pages/Admin/CollegeInfo";
import Courses from "./pages/Admin/Courses";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Login />} />

                <Route path="/admin" element={<AdminLayout />}>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="courses" element={<Courses />} />
                    <Route path="profile" element={<AdminProfile />} />
                    <Route path="college" element={<CollegeInfo />} />
                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default App;
