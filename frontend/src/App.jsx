import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useLocation
} from "react-router-dom";
import { useEffect } from "react";

// Login page
import Login from "./pages/Login";

// Admin pages and layout
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminProfile from "./pages/Admin/AdminProfile";
import Courses from "./pages/Admin/Courses";
import Subjects from "./pages/Admin/Subjects";
import AssignSubjects from "./pages/Admin/AssignSubjects";
import Faculties from "./pages/Admin/Faculties.jsx";

// Faculty layout and dashboard
import FacultyLayout from "./pages/Faculty/FacultyLayout";
import FacultyDashboard from "./pages/Faculty/FacultyDashboard";

// Student dashboard
import StudentDashboard from "./pages/Student/StudentDashboard";

// Route protection (checks login and role)
import ProtectedRoute from "./routes/ProtectedRoute";


/*
This small component keeps track of which page the user visited last.
So when they refresh or login again, they can be sent back to the same page.
*/
const RouteTracker = () => {
    const location = useLocation();
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (token && location.pathname !== "/") {
            localStorage.setItem("lastPage", location.pathname);
        }
    }, [location, token]);

    return null;
};


/*
This handles the root "/" route.
It decides where to send the user depending on:
- if they are logged in
- what their role is
- or what page they last opened
*/
const RootHandler = () => {

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const lastPage = localStorage.getItem("lastPage");

    // If user is not logged in → show login page
    if (!token) {
        return <Login />;
    }

    // If user was already on some page → send them back there
    if (lastPage) {
        return <Navigate to={lastPage} replace />;
    }

    // Otherwise send based on their role
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
};



function App() {

    return (

        <Router>

            {/* This runs silently in background to remember last visited page */}
            <RouteTracker />


            <Routes>

                {/* Root route decides where to go */}
                <Route path="/" element={<RootHandler />} />


                {/* ===================== ADMIN SECTION ===================== */}

                {/* 
                This protects admin routes.
                Only admin role users can access these pages.
                AdminLayout provides sidebar and layout.
                */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRole="admin">
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >

                    {/* Admin dashboard */}
                    <Route path="dashboard" element={<AdminDashboard />} />

                    {/* Admin profile */}
                    <Route path="profile" element={<AdminProfile />} />

                    {/* Course management */}
                    <Route path="courses" element={<Courses />} />

                    {/* Subject management */}
                    <Route path="subjects" element={<Subjects />} />

                    {/* Subject assignment */}
                    <Route path="assign-subjects" element={<AssignSubjects />} />

                    {/* Faculty management */}
                    <Route path="faculties" element={<Faculties />} />

                </Route>



                {/* ===================== FACULTY SECTION ===================== */}

                /*
                This is the faculty section.
                FacultyLayout provides sidebar, header, logout etc.
                FacultyDashboard loads inside that layout.
                */

                <Route
                    path="/faculty"
                    element={
                        <ProtectedRoute allowedRole="faculty">
                            <FacultyLayout />
                        </ProtectedRoute>
                    }
                >

                    {/* Faculty dashboard */}
                    <Route path="dashboard" element={<FacultyDashboard />} />

                </Route>



                {/* ===================== STUDENT SECTION ===================== */}

                {/* Student dashboard */}
                <Route
                    path="/student/dashboard"
                    element={
                        <ProtectedRoute allowedRole="student">
                            <StudentDashboard />
                        </ProtectedRoute>
                    }
                />


                {/* 
                If user tries to open any wrong URL,
                send them back to root.
                */}
                <Route path="*" element={<Navigate to="/" replace />} />


            </Routes>

        </Router>

    );
}

export default App;