import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, X, Leaf } from "lucide-react";

const PublicLayout = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu and scroll to top on route change
    useEffect(() => {
        setMobileMenuOpen(false);
        window.scrollTo(0, 0); 
    }, [location.pathname]);

    const navLinks = [
        { name: "Home", path: "/" },
        { name: "About Us", path: "/about" },
        { name: "Contact", path: "/contact" },
    ];

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50/10">
            {/* Header / Navbar */}
            <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform duration-300">
                            <Leaf size={22} strokeWidth={2.5} />
                        </div>
                        <span className="text-2xl font-black tracking-tight text-gray-900 group-hover:text-teal-700 transition-colors">
                            GreenLoop
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map(link => (
                            <Link 
                                key={link.name}
                                to={link.path} 
                                className={`text-sm font-bold transition-colors hover:text-teal-600 ${location.pathname === link.path ? 'text-teal-600 border-b-2 border-teal-500 pb-0.5' : 'text-gray-500'}`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* CTA Auth Buttons (Desktop) */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link 
                            to="/login"
                            className="text-sm font-bold text-gray-600 hover:text-teal-600 transition-colors px-2"
                        >
                            Log in
                        </Link>
                        <Link 
                            to="/register"
                            className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold px-6 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                        >
                            Sign up
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button 
                        className="md:hidden p-2 text-gray-600"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-sm pt-24 px-6 md:hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <nav className="flex flex-col gap-6 text-center">
                        {navLinks.map(link => (
                            <Link 
                                key={link.name}
                                to={link.path}
                                className={`text-2xl font-black ${location.pathname === link.path ? 'text-teal-600' : 'text-gray-800'}`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="h-px bg-gray-200 w-12 mx-auto my-4"></div>
                        <Link to="/login" className="text-xl font-bold text-gray-600">Log in</Link>
                        <Link to="/register" className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xl font-black py-4 rounded-2xl shadow-lg mt-4 inline-block mx-8">
                            Get Started
                        </Link>
                    </nav>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 w-full"> 
                <Outlet />
            </main>

            {/* Global Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12 px-6 border-t border-gray-800 mt-auto">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <Leaf size={24} className="text-teal-500" />
                            <span className="text-xl font-black text-white">GreenLoop</span>
                        </Link>
                        <p className="text-sm text-gray-500 pr-4 leading-relaxed">
                            Empowering communities to keep their cities clean using AI-verified reporting and transparent task management.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Platform</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/about" className="hover:text-teal-400 transition-colors">How it works</Link></li>
                            <li><Link to="/about" className="hover:text-teal-400 transition-colors">About Us</Link></li>
                            <li><Link to="/login" className="hover:text-teal-400 transition-colors">Citizen Portal</Link></li>
                            <li><Link to="/login" className="hover:text-teal-400 transition-colors">Worker Portal</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Support</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/contact" className="hover:text-teal-400 transition-colors">Help Center</Link></li>
                            <li><Link to="/contact" className="hover:text-teal-400 transition-colors">Contact Us</Link></li>
                            <li><a href="#" className="hover:text-teal-400 transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-teal-400 transition-colors">Privacy Policy</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Connect</h4>
                        <p className="text-sm text-gray-500 mb-4 leading-relaxed">Follow us on social media for updates and community spotlights.</p>
                        <div className="flex gap-3">
                            <a href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all shadow-sm"><span className="text-xs font-bold leading-none">X</span></a>
                            <a href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all shadow-sm"><span className="text-xs font-bold leading-none">in</span></a>
                            <a href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all shadow-sm"><span className="text-xs font-bold leading-none">ig</span></a>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto pt-8 border-t border-gray-800 text-sm text-center md:text-left flex flex-col md:flex-row justify-between items-center text-gray-500">
                    <p>© {new Date().getFullYear()} GreenLoop Inc. All rights reserved.</p>
                    <p className="mt-2 md:mt-0 flex items-center gap-1 font-medium">Made with <span className="text-rose-500 animate-pulse">♥</span> for a cleaner planet</p>
                </div>
            </footer>
        </div>
    );
};

export default PublicLayout;
