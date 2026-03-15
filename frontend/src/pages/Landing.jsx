import { Link } from "react-router-dom";

const Landing = () => {
    return (
        <div className="min-h-screen flex flex-col bg-white font-sans">
            {/* Header */}
            <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100 max-w-7xl mx-auto w-full">
                {/* Logo */}
                <div className="flex items-center">
                    <Link to="/" className="text-3xl font-serif text-gray-900 tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                        Greenloop
                    </Link>
                </div>

                {/* Desktop Nav & Auth */}
                <div className="flex items-center gap-6 md:gap-10">
                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#contact" className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">Contact team</a>
                        <a href="#features" className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">Features</a>
                    </nav>
                    <Link 
                        to="/login"
                        className="bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors shadow-sm"
                    >
                        Sign in
                    </Link>
                </div>
            </header>

            {/* Main Content (Hero) */}
            <main className="flex-1 flex flex-col lg:flex-row items-center justify-center w-full max-w-7xl mx-auto px-6 py-12 lg:py-20 gap-12 lg:gap-24">
                
                {/* Left Side: Illustration */}
                <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
                    <div className="relative w-full max-w-2xl">
                        <img 
                            src="/assets/landing-hero.png" 
                            alt="Citizens cleaning up a park" 
                            className="w-full h-auto object-contain drop-shadow-sm border-4 border-blue-400"
                        />
                    </div>
                </div>

                {/* Right Side: Typography & CTA */}
                <div className="w-full lg:w-1/2 flex flex-col items-start text-left space-y-8 pl-0 lg:pl-10">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-gray-900 leading-[1.15] tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                        A Cleaner City <br />
                        Starts With One Tap
                    </h1>
                    
                    <div className="w-full h-px bg-gray-300 max-w-md"></div>
                    
                    <Link 
                        to="/register"
                        className="inline-flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-900 text-white text-lg font-medium px-8 py-4 rounded-full transition-all hover:scale-105 active:scale-95 shadow-md group"
                    >
                        Get Started
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </Link>
                </div>
                
            </main>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-gray-50 mt-auto">
                <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-semibold text-gray-400 tracking-wide uppercase">
                    <a href="#" className="hover:text-gray-900 transition-colors">Team greenloop</a>
                    <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
                    <a href="#" className="hover:text-gray-900 transition-colors">About</a>
                    <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
                    <a href="#" className="hover:text-gray-900 transition-colors">Help</a>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
