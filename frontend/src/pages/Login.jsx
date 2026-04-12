import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { Mail, Lock, ArrowRight, Leaf, ShieldCheck, Zap } from "lucide-react";

const Login = () => {
    const { login, loading } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
            else navigate("/citizen"); 
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a192f] relative overflow-hidden font-sans">
            {/* Dynamic Glassmorphism Backgrounds */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/20 rounded-full mix-blend-overlay filter blur-[128px] opacity-30"></div>

            <div className="w-full max-w-6xl mx-auto p-6 z-10 flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-24">
                
                {/* Right Side: Brand & Value Prop */}
                <div className="w-full lg:w-1/2 text-white space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
                    <Link to="/" className="inline-flex items-center gap-2 group mb-4">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all shadow-[0_0_15px_rgba(20,184,166,0.5)]">
                            <Leaf size={24} className="text-teal-300" />
                        </div>
                        <span className="text-3xl font-black tracking-tight">GreenLoop</span>
                    </Link>

                    <h1 className="text-5xl lg:text-6xl font-black leading-tight">
                        Welcome <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-300">Back.</span>
                    </h1>
                    
                    <p className="text-lg text-teal-100/70 leading-relaxed max-w-md font-medium">
                        Log in to track your reports, assign new tasks, or submit cleanup evidence. The city depends on you.
                    </p>

                    <div className="space-y-6 pt-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10"><ShieldCheck size={20} className="text-teal-400" /></div>
                            <p className="text-sm font-semibold text-teal-50">Secure Enclave Access</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10"><Zap size={20} className="text-amber-400" /></div>
                            <p className="text-sm font-semibold text-teal-50">Real-time Task Updates</p>
                        </div>
                    </div>
                </div>

                {/* Left Side: Glass Form */}
                <div className="w-full lg:w-[480px] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 sm:p-10 rounded-[2rem] shadow-2xl relative overflow-hidden">
                        
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

                        <div className="relative z-10">
                            <h2 className="text-3xl font-black text-white mb-2">Sign In</h2>
                            <p className="text-teal-100/60 font-medium mb-8">Access your GreenLoop dashboard.</p>

                            {error && (
                                <div className="bg-rose-500/20 border border-rose-500/50 text-rose-200 text-sm font-semibold px-4 py-3 rounded-xl mb-6 flex items-center gap-3 backdrop-blur-md">
                                    <ShieldCheck size={18} className="shrink-0" />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail size={18} className="text-teal-200/50 group-focus-within:text-teal-300 transition-colors" />
                                    </div>
                                    <input type="email" name="email" value={form.email} onChange={handleChange} required
                                        className="w-full bg-white/5 border border-white/10 text-white placeholder-teal-100/30 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 transition-all backdrop-blur-sm peer" placeholder="Email Address" />
                                </div>

                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock size={18} className="text-teal-200/50 group-focus-within:text-teal-300 transition-colors" />
                                    </div>
                                    <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6}
                                        className="w-full bg-white/5 border border-white/10 text-white placeholder-teal-100/30 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 transition-all backdrop-blur-sm peer" placeholder="Password" />
                                </div>
                                
                                <div className="flex justify-end px-1 mt-2">
                                    <a href="#" className="text-sm font-medium text-teal-300 hover:text-white transition-colors">Forgot password?</a>
                                </div>

                                <button type="submit" disabled={loading}
                                    className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-[#0a192f] font-black text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2 group">
                                    {loading ? "Signing in..." : "Sign In"}
                                    {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                                </button>
                            </form>

                            <div className="mt-8 text-center text-sm font-medium text-teal-100/50">
                                Don't have an account?{" "}
                                <Link to="/register" className="text-teal-300 hover:text-white transition-colors underline underline-offset-4">Sign up</Link>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;
