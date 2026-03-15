import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const OAuthSuccess = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const role = params.get("role");

        if (!role) {
            navigate("/", { replace: true });
            return;
        }

        // get token from backend cookie
        api.get("/api/auth/session")
            .then((res) => {
                const token = res.data.token;

                localStorage.setItem("token", token);
                localStorage.setItem("role", role);

                if (role === "admin") {
                    navigate("/admin/dashboard", { replace: true });
                }
                else if (role === "faculty") {
                    navigate("/faculty/dashboard", { replace: true });
                }
                else if (role === "student") {
                    navigate("/student/dashboard", { replace: true });
                }
                else {
                    navigate("/", { replace: true });
                }
            })
            .catch(() => {
                navigate("/", { replace: true });
            });

    }, [navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Signing you in...</p>
        </div>
    );
};

export default OAuthSuccess;