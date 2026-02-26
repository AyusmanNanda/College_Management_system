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

            if (from) {
                navigate(from.pathname + (from.search || ""), { replace: true });
                return;
            }

            if (lastPage) {
                navigate(lastPage, { replace: true });
                return;
            }

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
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300 px-4 sm:px-6">

            <div className="w-full max-w-md bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-sm">

                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                    College Login
                </h1>

                {error && (
                    <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-md">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">

                    <div>
                        <label className="block mb-2 text-sm text-gray-600 dark:text-gray-300">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 outline-none transition"
                            placeholder="admin@college.com"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm text-gray-600 dark:text-gray-300">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 outline-none transition"
                            placeholder="Enter password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-gray-900 dark:bg-gray-700 text-white rounded-md hover:bg-black dark:hover:bg-gray-600 transition disabled:opacity-60"
                    >
                        {loading ? "Signing in..." : "Login"}
                    </button>

                </form>

            </div>

        </div>
    );
};

export default Login;