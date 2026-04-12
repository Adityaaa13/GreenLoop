import { Link } from "react-router-dom";
import { ArrowRight, Leaf } from "lucide-react";

const Landing = () => {
    return (
        <div className="w-full bg-white font-sans overflow-hidden">
            {/* Main Content (Hero) */}
            <main className="relative flex flex-col lg:flex-row items-center justify-center w-full max-w-7xl mx-auto px-6 py-20 lg:py-32 gap-12 lg:gap-24 min-h-[90vh]">
                
                {/* Background Decor */}
                <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                {/* Left Side: Typography & CTA */}
                <div className="w-full lg:w-1/2 flex flex-col items-start text-left space-y-8 pl-0 lg:pl-10 z-10 animate-in fade-in slide-in-from-left-8 duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold shadow-sm">
                        <Leaf size={16} /> <span>Smart City Cleanups</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-gray-900 leading-[1.15] tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                        A Cleaner City <br />
                        Starts With One Tap
                    </h1>
                    
                    <p className="text-lg text-gray-500 max-w-md leading-relaxed font-medium">
                        Report illegal dumping with a photo. Our AI verifies it, and municipal teams clean it up. It's that simple.
                    </p>
                    
                    <div className="flex items-center gap-4 pt-4 flex-wrap">
                        <Link 
                            to="/register"
                            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-teal-700 hover:to-emerald-700 text-white text-lg font-bold px-8 py-4 rounded-full transition-all hover:scale-105 active:scale-95 shadow-xl group border border-transparent hover:border-teal-400"
                        >
                            Get Started
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link 
                            to="/about"
                            className="inline-flex items-center justify-center px-8 py-4 rounded-full text-gray-700 font-bold hover:bg-gray-100 transition-colors"
                        >
                            Learn More
                        </Link>
                    </div>
                </div>
                
                {/* Right Side: Illustration */}
                <div className="w-full lg:w-1/2 flex justify-center lg:justify-end z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
                    <div className="relative w-full max-w-2xl">
                        <div className="absolute inset-0 bg-gradient-to-tr from-teal-400 to-emerald-300 rounded-3xl transform rotate-3 blur-sm opacity-20"></div>
                        <img 
                            src="/assets/landing-hero.png" 
                            alt="Citizens cleaning up a park" 
                            className="relative w-full h-auto object-cover rounded-3xl shadow-2xl border-4 border-white transform -rotate-2 hover:rotate-0 transition-transform duration-500 bg-gray-50 bg-blend-multiply"
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Landing;
