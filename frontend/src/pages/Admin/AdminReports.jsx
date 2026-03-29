import React, { useState, useEffect } from "react";
import api from "../../services/api";
import VerifiedDumpsTable from "../../components/admin/VerifiedDumpsTable";
import { Search } from "lucide-react";

const AdminReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchReports = async () => {
        try {
            const res = await api.get("/reports");
            setReports(res.data.reports || res.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch reports:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    const filteredReports = reports.filter(r => {
        if (!searchQuery) return true;
        const s = searchQuery.toLowerCase();
        return (r._id && r._id.toLowerCase().includes(s)) || 
               (r.citizenId?.name && r.citizenId.name.toLowerCase().includes(s)) || 
               (r.status && r.status.toLowerCase().includes(s));
    });

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">System Reports</h1>
                    <p className="text-gray-500 mt-2">View all garbage submissions and their statuses.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by ID, Status, Citizen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2.5 w-full md:w-80 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none bg-white shadow-sm"
                    />
                </div>
            </div>

            <VerifiedDumpsTable reports={filteredReports} />
        </div>
    );
};

export default AdminReports;
