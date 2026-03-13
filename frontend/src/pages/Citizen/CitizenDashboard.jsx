import { useState, useEffect, useRef } from "react";
import api from "../../services/api";

const CitizenDashboard = () => {
    // Dashboard Stats
    const [stats, setStats] = useState({ totalSubmitted: 0, verified: 0, rejected: 0, pending: 0 });
    const [reports, setReports] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingReports, setLoadingReports] = useState(true);

    // Form State
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState(null);
    const [locationError, setLocationError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    // Modal State
    const [selectedReport, setSelectedReport] = useState(null);

    const fetchDashboardStats = async () => {
        try {
            const { data } = await api.get("/dashboard/citizen");
            setStats({
                totalSubmitted: data.totalSubmitted,
                verified: data.verified,
                rejected: data.rejected,
                pending: data.pending,
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchMyReports = async () => {
        try {
            const { data } = await api.get("/reports/my");
            setReports(data.reports);
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setLoadingReports(false);
        }
    };

    useEffect(() => {
        fetchDashboardStats();
        fetchMyReports();
        getLocation();
    }, []);

    const getLocation = () => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setLocationError("");
            },
            () => {
                setLocationError("Unable to retrieve your location");
            }
        );
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image) return alert("Please select an image");
        if (!location) return alert("Waiting for GPS location...");

        setSubmitting(true);
        const formData = new FormData();
        formData.append("image", image);
        formData.append("description", description);
        formData.append("lat", location.lat);
        formData.append("lng", location.lng);

        try {
            await api.post("/reports", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            // Reset form
            setImage(null);
            setPreviewUrl(null);
            setDescription("");
            if (fileInputRef.current) fileInputRef.current.value = "";
            
            // Refresh data
            fetchDashboardStats();
            fetchMyReports();
            alert("Report submitted successfully!");
        } catch (error) {
            console.error("Error submitting report:", error);
            alert("Failed to submit report. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending_validation: "bg-yellow-100 text-yellow-800",
            verified_dump: "bg-green-100 text-green-800",
            rejected: "bg-red-100 text-red-800",
        };
        const labels = {
            pending_validation: "Pending",
            verified_dump: "Verified",
            rejected: "Rejected",
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[status] || "bg-gray-100 text-gray-800"}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500">Total Reports</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{loadingStats ? "-" : stats.totalSubmitted}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-green-100">
                    <h3 className="text-sm font-medium text-green-600">Verified Dumps</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{loadingStats ? "-" : stats.verified}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-red-100">
                    <h3 className="text-sm font-medium text-red-600">Rejected</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{loadingStats ? "-" : stats.rejected}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Report Submission Form ── */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Report new dump</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-emerald-500 transition-colors">
                                <div className="space-y-1 text-center">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="mx-auto h-32 object-cover rounded" />
                                    ) : (
                                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                    <div className="flex justify-center text-sm text-gray-600 mt-2">
                                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500">
                                            <span>Upload a file</span>
                                            <input ref={fileInputRef} type="file" className="sr-only" accept="image/*" onChange={handleImageChange} required />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                            <textarea
                                rows="3"
                                className="w-full rounded-lg border-gray-300 border p-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="Describe the waste..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        {/* GPS Location Status */}
                        <div className="bg-gray-50 px-3 py-2 rounded-lg flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">GPS Location</span>
                            {locationError ? (
                                <span className="text-xs text-red-600">{locationError}</span>
                            ) : location ? (
                                <span className="text-xs text-green-600 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    Acquired
                                </span>
                            ) : (
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Locating...
                                </span>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || !location || !image}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-300 disabled:cursor-not-allowed transition-colors"
                        >
                            {submitting ? "Uploading & Analyzing..." : "Submit Report"}
                        </button>
                    </form>
                </div>

                {/* ── Reports Table ── */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800">My Past Reports</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Analysis</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loadingReports ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">Loading reports...</td>
                                    </tr>
                                ) : reports.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No reports submitted yet.</td>
                                    </tr>
                                ) : (
                                    reports.map((report) => (
                                        <tr key={report._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(report.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(report.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {report.aiValidation?.confidence ? `${report.aiValidation.confidence}%` : "-"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {report.aiValidation?.reasoning ? (
                                                    <button
                                                        onClick={() => setSelectedReport(report)}
                                                        className="text-emerald-600 hover:text-emerald-900"
                                                    >
                                                        View Reasoning
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400">N/A</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── AI Reasoning Modal ── */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">AI Analysis</h3>
                            <button onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <img src={selectedReport.imageUrl} alt="Dump" className="w-full h-48 object-cover rounded-lg mb-4" />
                            <div className="mb-4">
                                <span className="text-sm text-gray-500 font-medium">Status:</span>
                                <span className="ml-2">{getStatusBadge(selectedReport.status)}</span>
                            </div>
                            <div>
                                <h4 className="text-sm text-gray-500 font-medium mb-1">Reasoning:</h4>
                                <p className="text-gray-800 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">
                                    {selectedReport.aiValidation?.reasoning}
                                </p>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 text-right">
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CitizenDashboard;
