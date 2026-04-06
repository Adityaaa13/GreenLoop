import { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Fix for default Leaflet icon not showing in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Component to dynamically update map center
function ChangeView({ center, zoom }) {
    const map = useMap();
    map.setView(center, zoom);
    return null;
}

const SubmitReport = () => {
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState(null);
    const [locationError, setLocationError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const fileRefCamera = useRef(null);
    const fileRefGallery = useRef(null);

    useEffect(() => {
        getLocation();
        // Pre-warm AI service to prevent free tier cold starts
        api.get("/system/wakeup").catch(() => {});
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
                setLocationError("Unable to retrieve your location. Please enable GPS permissions.");
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
        setSuccessMessage("");
        const formData = new FormData();
        formData.append("image", image);
        formData.append("description", description);
        formData.append("lat", location.lat);
        formData.append("lng", location.lng);

        try {
            const { data } = await api.post("/reports", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                timeout: 120000, // 2 min timeout for AI processing
            });
            // Reset form
            setImage(null);
            setPreviewUrl(null);
            setDescription("");
            if (fileRefCamera.current) fileRefCamera.current.value = "";
            if (fileRefGallery.current) fileRefGallery.current.value = "";
            setSuccessMessage("Report submitted successfully! Thank you for keeping our community clean.");
        } catch (error) {
            console.error("Error submitting report:", error);
            const errMsg = error.response?.data?.message || "Failed to submit report. Please try again.";
            alert(errMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const defaultCenter = [20.5937, 78.9629]; // Default to center of India if no loc

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Submit New Report</h1>
                    <p className="text-gray-500">Found an illegal dump? Take a photo, and our AI will verify it.</p>
                </div>
                <Link to="/citizen/reports" className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm inline-flex items-center gap-2 w-fit">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    View My Reports
                </Link>
            </div>

            {successMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-full">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <p className="font-medium">{successMessage}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* ── Form Side ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Evidence Photo *</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-emerald-500 transition-colors bg-gray-50/50">
                                <div className="space-y-2 text-center">
                                    {previewUrl ? (
                                        <div className="relative inline-block">
                                            <img src={previewUrl} alt="Preview" className="mx-auto h-48 object-cover rounded-lg shadow-sm" />
                                            <button 
                                                type="button" 
                                                onClick={() => { setPreviewUrl(null); setImage(null); }}
                                                className="absolute -top-3 -right-3 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <svg className="mx-auto h-12 w-12 text-emerald-500/50" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                    <div className="flex justify-center text-sm text-gray-600 mt-4 gap-3">
                                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none px-3 py-1 shadow-sm border border-gray-200 flex items-center gap-1.5 transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            <span>Take Photo</span>
                                            <input ref={fileRefCamera} type="file" className="sr-only" accept="image/*" capture="environment" onChange={handleImageChange} required={!image} />
                                        </label>
                                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none px-3 py-1 shadow-sm border border-gray-200 flex items-center gap-1.5 transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            <span>Gallery</span>
                                            <input ref={fileRefGallery} type="file" className="sr-only" accept="image/*" onChange={handleImageChange} required={!image} />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium">PNG, JPG, WEBP up to 5MB</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
                            <textarea
                                rows="3"
                                className="w-full rounded-xl border-gray-300 border p-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                                placeholder="Describe the type of waste, approximate volume, etc."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || !location || !image}
                            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {submitting ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Analyzing (May take ~60s if AI is asleep)
                                </span>
                            ) : "Submit Report"}
                        </button>
                    </form>
                </div>

                {/* ── Map Side ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col h-[500px] lg:h-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <span className="text-emerald-600">📍</span> Live Location Tracking
                        </h2>
                        {locationError ? (
                            <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span> Error
                            </span>
                        ) : location ? (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Acquired
                            </span>
                        ) : (
                            <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex items-center gap-1">
                                <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Locating
                            </span>
                        )}
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-4">
                        Reports require a precise geolocation tag to be validated by the system.
                    </p>

                    <div className="flex-1 rounded-xl overflow-hidden border border-gray-200 relative shadow-inner z-10 w-full">
                        <MapContainer 
                            center={location ? [location.lat, location.lng] : defaultCenter} 
                            zoom={location ? 15 : 4} 
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {location && (
                                <>
                                    <ChangeView center={[location.lat, location.lng]} zoom={15} />
                                    <Marker position={[location.lat, location.lng]}>
                                        <Popup>
                                            <div className="text-center">
                                                <p className="font-bold text-gray-900">Your current location</p>
                                                <p className="text-xs text-gray-500 mt-1">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                </>
                            )}
                        </MapContainer>
                    </div>

                    {!location && !locationError && (
                        <div className="mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50 text-center">
                            <p className="text-sm text-blue-800 font-medium">Waiting for browser GPS permissions...</p>
                        </div>
                    )}
                    {locationError && (
                        <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100 text-center">
                            <p className="text-sm text-red-800 font-medium">{locationError}</p>
                            <button onClick={getLocation} className="mt-2 text-xs font-bold text-red-700 hover:text-red-900 underline">Try Again</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubmitReport;
