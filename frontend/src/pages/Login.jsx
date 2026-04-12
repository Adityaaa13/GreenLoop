import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Login = () => {
    const { login, loading } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const data = await login(form.email, form.password);

            // Wake up AI service early upon successful login
            api.get("/system/wakeup").catch(() => { });

            // Route based on role
            const role = data.user.role;
            if (role === "admin") navigate("/admin");
            else if (role === "worker") navigate("/worker");
            else if (role === "team_lead") navigate("/team-lead");
            else navigate("/citizen"); // default citizen

        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side - Branding/Graphic */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-800 via-teal-900 to-emerald-950 items-center justify-center p-12">
                {/* Decorative background circles */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                    <div className="absolute -top-1/4 -right-1/4 w-3/4 h-3/4 bg-emerald-500/20 rounded-full blur-3xl mix-blend-overlay"></div>
                    <div className="absolute -bottom-1/4 -left-1/4 w-2/3 h-2/3 bg-teal-500/20 rounded-full blur-3xl mix-blend-overlay"></div>
                </div>

                <div className="relative z-10 text-white max-w-lg animate-in fade-in slide-in-from-left-8 duration-1000">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center mb-8 shadow-2xl">
                        <svg className="w-8 h-8 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight tracking-tight">
                        Keep your city <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">beautiful.</span>
                    </h1>
                    <p className="text-emerald-100/80 text-lg font-medium leading-relaxed mb-8">
                        Join thousands of citizens using AI-powered reporting to help city workers identify and clean up illegal dumping faster than ever before.
                    </p>
                    <div className="flex items-center gap-4 text-emerald-200/60 text-sm font-semibold uppercase tracking-widest">
                        <span>Smart</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></span>
                        <span>Efficient</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></span>
                        <span>Clean</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-gray-50/50">
                <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Welcome back</h2>
                        <p className="mt-3 text-gray-500 font-medium">Please enter your details to sign in.</p>
                    </div>

                    {error && (
                        <div className="bg-rose-50 border border-rose-100 text-rose-600 text-sm font-semibold px-4 py-3 rounded-xl flex items-center gap-3">
                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700 pl-1">Email address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                                </div>
                                <input
                                    id="login-email"
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 hover:border-gray-300 transition-all shadow-sm outline-none"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center justify-between pl-1 pr-2">
                                <label className="text-sm font-bold text-gray-700">Password</label>
                                <a href="#" className="text-sm font-bold text-emerald-600 hover:text-emerald-500 transition-colors">Forgot password?</a>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                </div>
                                <input
                                    id="login-password"
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 hover:border-gray-300 transition-all shadow-sm outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            id="login-submit"
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:translate-y-0 mt-6"
                        >
                            {loading ? "Signing in…" : "Sign In"}
                        </button>
                    </form>

                    <div className="text-center pt-4 border-t border-gray-200/60">
                        <p className="text-sm text-gray-500 font-medium">
                            Don't have an account?{" "}
                            <Link to="/register" className="text-emerald-600 font-bold hover:text-emerald-500 hover:underline transition-all">
                                Create one now
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
