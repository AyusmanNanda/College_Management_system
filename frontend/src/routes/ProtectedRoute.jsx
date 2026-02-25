import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRole }) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const location = useLocation();

    if (!token) {
        return (
            <Navigate
                to="/"
                replace
                state={{ from: location }}
            />
        );
    }

    if (allowedRole && role !== allowedRole) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;