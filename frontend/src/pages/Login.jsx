import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { Sun, Moon, Eye, EyeOff, GraduationCap, Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import api from "../utils/api";

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from;
    const lastPage = localStorage.getItem("lastPage");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const isElectron =
        typeof navigator !== "undefined" &&
        navigator.userAgent.toLowerCase().includes("electron");
    const isNative = Capacitor.isNativePlatform() || isElectron;

    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) return savedTheme;
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        return prefersDark ? "dark" : "light";
    });

    /* ================= Logic Preservation ================= */
    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        localStorage.setItem("theme", theme);
    }, [theme]);

    useEffect(() => {
        const hidePassword = () => setShowPassword(false);
        document.addEventListener("click", hidePassword);
        return () => document.removeEventListener("click", hidePassword);
    }, []);

    const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

    const loginWithGoogleNative = async () => {
        const platform = isElectron ? "electron" : "android";
        const url = `${import.meta.env.VITE_BACKEND}/api/auth/google-redirect?platform=${platform}`;
        if (isElectron) {
            window.location.href = url;
        } else {
            await Browser.open({ url });
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const response = await api.post("/api/auth/login", { email, password });
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
            if (role === "admin") navigate("/admin/dashboard", { replace: true });
            else if (role === "faculty") navigate("/faculty/dashboard", { replace: true });
            else if (role === "student") navigate("/student/dashboard", { replace: true });
        } catch (err) {
            if (!err.response) setError("Server unreachable. Check your connection.");
            else setError("Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async (credentialResponse) => {
        try {
            const response = await api.post("/api/auth/google", {
                credential: credentialResponse.credential
            });
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
            if (role === "admin") navigate("/admin/dashboard", { replace: true });
            else if (role === "faculty") navigate("/faculty/dashboard", { replace: true });
            else if (role === "student") navigate("/student/dashboard", { replace: true });
        } catch (err) {
            setError(err.response ? "Google login failed" : "Server unreachable.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-500 px-4">

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="absolute top-6 right-6 p-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all active:scale-90"
            >
                {theme === "dark" ? <Sun size={20} className="text-indigo-400" /> : <Moon size={20} className="text-slate-600" />}
            </button>

            {/* Login Card */}
            <div className="w-full max-w-[400px] animate-in fade-in zoom-in-95 duration-700">

                {/* Institutional Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/20 mb-4 animate-bounce-slow">
                        <GraduationCap size={32} />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        College Management System
                    </h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                        Sign in to your account
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-xl transition-all">

                    {error && (
                        <div className="mb-6 p-3 flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg animate-in slide-in-from-top-2">
                            <AlertCircle size={16} className="flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">

                        {/* Email Address */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 px-1">
                                Email Address
                            </label>
                            <div className="relative group">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    placeholder="name@college.edu"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 px-1">
                                Password
                            </label>
                            <div className="relative group">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setShowPassword(!showPassword); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-md shadow-indigo-500/20 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <LogIn size={18} />
                                    Sign In
                                </>
                            )}
                        </button>

                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
                        </div>
                        <div className="relative flex justify-center text-xs font-medium text-slate-400">
                            <span className="bg-white dark:bg-slate-900 px-4">Or sign in with</span>
                        </div>
                    </div>

                    {/* OAuth */}
                    <div className="flex justify-center">
                        {isNative ? (
                            <button
                                onClick={() => { setGoogleLoading(true); loginWithGoogleNative(); }}
                                disabled={googleLoading}
                                className="w-full flex items-center justify-center gap-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-60"
                            >
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-5 h-5" />
                                {googleLoading ? "Connecting..." : "Google"}
                            </button>
                        ) : (
                            <GoogleLogin
                                onSuccess={handleGoogleLogin}
                                onError={() => setError("Google login failed")}
                                theme={theme === "dark" ? "filled_black" : "outline"}
                                shape="pill"
                                width="100%"
                            />
                        )}
                    </div>
                </div>

                {/* Footer Link */}
                <p className="text-center mt-8 text-xs font-medium text-slate-400">
                    © 2026 College Administration System
                </p>
            </div>

            {/* Custom slow bounce animation */}
            <style>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(-5%); }
                    50% { transform: translateY(0); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default Login;