import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

/*
  Admin Login Page
  ----------------
  Single admin system
*/

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from;
    const lastPage = localStorage.getItem("lastPage");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await axios.post(
                "http://localhost:5000/api/auth/login",
                { email, password }
            );

            const { token, role } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("role", role);

            // If user tried accessing protected page
            if (from) {
                navigate(from.pathname + (from.search || ""), { replace: true });
                return;
            }

            // If returning user with saved last page
            if (lastPage) {
                navigate(lastPage, { replace: true });
                return;
            }

            // Default dashboard fallback
            if (role === "admin") {
                navigate("/admin/dashboard", { replace: true });
            } else if (role === "faculty") {
                navigate("/faculty/dashboard", { replace: true });
            } else if (role === "student") {
                navigate("/student/dashboard", { replace: true });
            }

        } catch (err) {
            setError("Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">

            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm">

                <h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                    College Login
                </h1>

                {error && (
                    <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">

                    <div>
                        <label className="block mb-2 text-sm text-gray-600">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-gray-900"
                            placeholder="admin@college.com"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm text-gray-600">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-gray-900"
                            placeholder="Enter password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-gray-900 text-white rounded-md hover:bg-black transition"
                    >
                        {loading ? "Signing in..." : "Login"}
                    </button>

                </form>

            </div>

        </div>
    );
};

export default Login;