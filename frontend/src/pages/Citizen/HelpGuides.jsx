import { useState } from "react";

const HelpGuides = () => {
    const [openFaq, setOpenFaq] = useState(0);

    const faqs = [
        {
            q: "What defines 'illegal dumping'?",
            a: "Illegal dumping is the disposal of waste in an unpermitted area. This includes throwing trash, furniture, appliances, or construction debris on public or private property without consent."
        },
        {
            q: "Why does the app need my GPS location?",
            a: "A precise GPS location is required so our team can immediately locate the dump and dispatch workers to clean it up. It also helps in identifying recurring hot-spots."
        },
        {
            q: "How does the AI Validation work?",
            a: "When you upload an image, our AI analyzes it to confirm the presence of waste, estimate its volume, and categorize the type (e.g., electronic vs. organic). This helps us prioritize cleanups automatically."
        },
        {
            q: "What happens if my report is rejected?",
            a: "Reports may be rejected if the image is too blurry, doesn't contain visible waste, or the GPS location is invalid. You can always take a clearer photo and try submitting again."
        }
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-2xl p-8 sm:p-12 text-white shadow-lg text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
                <div className="relative z-10 w-full max-w-2xl mx-auto space-y-4">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm border border-white/20">
                        <svg className="w-8 h-8 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Help & Guides</h1>
                    <p className="text-sm sm:text-base text-emerald-100 font-medium">Everything you need to know about using GreenLoop to keep your community shining.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* ── Guidelines ── */}
                <div className="md:col-span-1 space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <span className="text-emerald-500">📷</span> Photo Guidelines
                    </h2>
                    <div className="space-y-4">
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                            <h3 className="font-bold text-gray-800 mb-1">Make it clear</h3>
                            <p className="text-sm text-gray-500">Ensure the waste is clearly visible in well-lit conditions. Avoid blurry or extremely dark photos.</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                            <h3 className="font-bold text-gray-800 mb-1">Capture context</h3>
                            <p className="text-sm text-gray-500">If possible, include a small portion of the surrounding area (like a sidewalk or tree) to help workers locate the dump easily.</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-400"></div>
                            <h3 className="font-bold text-gray-800 mb-1">Do not trespass</h3>
                            <p className="text-sm text-gray-500">Never cross into private or restricted property to take a photo. Always stay in public, safe areas.</p>
                        </div>
                    </div>

                    <div className="mt-8 bg-emerald-50 rounded-2xl p-6 border border-emerald-100 flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-600 mb-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                        <h3 className="font-bold text-emerald-900 mb-1">Need more help?</h3>
                        <p className="text-sm text-emerald-700 mb-4">Our support team is available 24/7 to assist you.</p>
                        <a href="mailto:support@greenloop.app" className="font-bold text-emerald-600 bg-white px-4 py-2 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors text-sm w-full">Contact Support</a>
                    </div>
                </div>

                {/* ── FAQs ── */}
                <div className="md:col-span-2">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <span className="text-blue-500">❓</span> Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div 
                                key={index} 
                                className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden cursor-pointer ${openFaq === index ? 'border-emerald-300 ring-4 ring-emerald-50' : 'border-gray-100 hover:border-gray-200'}`}
                                onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                            >
                                <div className="px-6 py-5 flex items-center justify-between gap-4">
                                    <h3 className={`font-bold transition-colors ${openFaq === index ? 'text-emerald-700' : 'text-gray-800'}`}>{faq.q}</h3>
                                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openFaq === index ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}>
                                        <svg className={`w-5 h-5 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                                <div 
                                    className={`transition-all duration-300 ease-in-out px-6 text-gray-600 text-sm leading-relaxed overflow-hidden ${openFaq === index ? 'pb-6 opacity-100 max-h-48' : 'max-h-0 opacity-0 pb-0'}`}
                                >
                                    {faq.a}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpGuides;
