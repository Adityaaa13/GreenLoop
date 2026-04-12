import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';

const Contact = () => {
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            setSent(true);
        }, 1500);
    };

    return (
        <div className="bg-gray-50 min-h-screen pt-12 pb-24">
            <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 mt-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    
                    {/* Left: Info */}
                    <div className="space-y-10">
                        <div>
                            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">Let's talk about <br/> making a difference.</h1>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Whether you're a city official looking to implement GreenLoop in your municipality or a citizen running into issues with the platform, we're here to help.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-5">
                                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600 shrink-0">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Email Us</h4>
                                    <p className="text-lg font-semibold text-gray-900">hello@greenloop.app</p>
                                    <p className="text-sm text-gray-500 mt-0.5">We aim to reply within 24 hours.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-5">
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Call Support</h4>
                                    <p className="text-lg font-semibold text-gray-900">7658864572</p>
                                    <p className="text-sm text-gray-500 mt-0.5">Mon-Fri, 9am - 6pm EST</p>
                                </div>
                            </div>
                            
                            
                        </div>
                    </div>

                    {/* Right: Form */}
                    <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden">
                        {/* Decorative background blur */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -z-10 opacity-60 translate-x-1/2 -translate-y-1/2"></div>
                        
                        {sent ? (
                            <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
                                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Send size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-3">Message Sent!</h3>
                                <p className="text-gray-500">Thanks for reaching out. We will get back to you shortly.</p>
                                <button 
                                    onClick={() => setSent(false)}
                                    className="mt-8 text-teal-600 font-bold hover:text-teal-700 underline"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <h3 className="text-2xl font-black text-gray-900 mb-8">Send a Message</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">First Name</label>
                                        <input required type="text" className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none" placeholder="Jane" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Last Name</label>
                                        <input required type="text" className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none" placeholder="Smith" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Email Address</label>
                                    <input required type="email" className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none" placeholder="jane@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">How can we help?</label>
                                    <textarea required rows="4" className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none resize-none" placeholder="Tell us more about your inquiry..."></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting ? "Sending..." : "Send Message"}
                                </button>
                            </form>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Contact;
