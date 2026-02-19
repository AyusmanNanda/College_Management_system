import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/*
  Admin Login Page
  ----------------
  Single admin system
*/

const Login = () => {
    const navigate = useNavigate();

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

            const { token } = response.data;

            localStorage.setItem("token", token);

            // Redirect to admin dashboard
            navigate("/admin/dashboard");

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
                    Admin Login
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
