import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPin } from "lucide-react";

// Fix for default Leaflet marker icon issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const AdminMap = ({ reports }) => {
    // Filter only verified dumps spanning valid GPS logic
    const mappedReports = reports.filter(r => 
        r.gps && r.gps.lat && r.gps.lng && r.status === "verified_dump"
    );

    // Default center (San Francisco roughly, or use dynamic bound later)
    const defaultCenter = [37.7749, -122.4194]; 
    const mapCenter = mappedReports.length > 0 ? [mappedReports[0].gps.lat, mappedReports[0].gps.lng] : defaultCenter;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden z-10 relative">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <MapPin size={20} className="text-blue-600" />
                    Global Reports Map
                </h3>
            </div>
            
            <div className="h-96 w-full relative z-0">
                <MapContainer center={mapCenter} zoom={12} scrollWheelZoom={false} className="h-full w-full">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {mappedReports.map((report) => (
                        <Marker key={report._id} position={[report.gps.lat, report.gps.lng]}>
                            <Popup>
                                <div className="p-1 space-y-2">
                                    <img 
                                        src={report.imageUrl} 
                                        alt="Dump" 
                                        className="w-full h-24 object-cover rounded-md"
                                    />
                                    <div>
                                        <p className="font-bold text-gray-800 capitalize">{report.status.replace("_", " ")}</p>
                                        <p className="text-xs text-gray-500">
                                            <strong>AI Confidence:</strong>{" "}
                                            {report.aiValidation?.confidence 
                                                ? (report.aiValidation.confidence * 100).toFixed(0) + "%" 
                                                : "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
                {mappedReports.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-[1000]">
                        <p className="text-gray-500 font-medium">No map data available.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminMap;
