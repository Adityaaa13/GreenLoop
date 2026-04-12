import React from 'react';
import { Leaf, Target, ShieldCheck, Users } from 'lucide-react';

const About = () => {
    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-teal-900 to-emerald-950 text-white py-24 lg:py-32">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl"></div>
                
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 mb-8 mx-auto">
                        <Leaf size={16} className="text-teal-400" />
                        <span className="text-sm font-semibold tracking-wide text-teal-100 uppercase">Our Mission</span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-serif font-black tracking-tight mb-8">
                        Building a Cleaner <br className="hidden md:block"/> 
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-300">Future Together</span>
                    </h1>
                    <p className="text-lg lg:text-xl text-teal-100/80 max-w-2xl mx-auto leading-relaxed">
                        GreenLoop bridges the gap between concerned citizens and municipal teams. Using cutting-edge AI and seamless workflows, we ensure no illegal dump is left behind.
                    </p>
                </div>
            </section>

            {/* Core Values Section */}
            <section className="py-24 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-black text-gray-900">Why GreenLoop Exists</h2>
                    <p className="text-gray-500 mt-4 max-w-xl mx-auto">Solving urban waste management requires more than just reports—it requires intelligence, accountability, and action.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:shadow-lg hover:border-teal-100 transition-all group">
                        <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 mb-6 group-hover:scale-110 transition-transform">
                            <Target size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Precision Targeting</h3>
                        <p className="text-gray-600 leading-relaxed">Through GPS integration and rich images, we eliminate the guesswork of reporting. Workers navigate directly to the verified target zone.</p>
                    </div>

                    <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:shadow-lg hover:border-emerald-100 transition-all group delay-100">
                        <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                            <ShieldCheck size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">AI Verification</h3>
                        <p className="text-gray-600 leading-relaxed">Every report and cleanup is validated by bleeding-edge visual AI mapping, preventing fraud and ensuring tasks are actually completed.</p>
                    </div>

                    <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all group delay-200">
                        <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                            <Users size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Community First</h3>
                        <p className="text-gray-600 leading-relaxed">By bringing citizens and government teams onto a single, transparent pipeline, we foster immense trust and significantly faster response times.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
