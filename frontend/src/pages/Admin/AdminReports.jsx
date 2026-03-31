import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";
import VerifiedDumpsTable from "../../components/admin/VerifiedDumpsTable";
import { Search } from "lucide-react";

const VALID_STATUSES = ["pending_validation", "verified_dump", "rejected", "cleanup_assigned", "cleaned"];

const AdminReports = () => {
    const [searchParams] = useSearchParams();
    const initialFilter = searchParams.get("filter") || "";
    const isStatusFilter = VALID_STATUSES.includes(initialFilter);

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(isStatusFilter ? "" : initialFilter);
    const [statusFilter, setStatusFilter] = useState(isStatusFilter ? initialFilter : "");

    // Update filters if URL changes (like when clicking links on Dashboard without reloading)
    useEffect(() => {
        const filter = searchParams.get("filter");
        if (filter) {
            if (VALID_STATUSES.includes(filter)) {
                setStatusFilter(filter);
                setSearchQuery("");
            } else {
                setSearchQuery(filter);
                setStatusFilter("");
            }
        } else if (searchParams.has("filter")) {
            setSearchQuery("");
            setStatusFilter("");
        }
    }, [searchParams]);

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
        let matchesStatus = true;
        let matchesSearch = true;

        if (statusFilter) {
            matchesStatus = r.status === statusFilter;
        }

        if (searchQuery) {
            const s = searchQuery.toLowerCase();
            matchesSearch = (r._id && r._id.toLowerCase().includes(s)) || 
                            (r.citizenId?.name && r.citizenId.name.toLowerCase().includes(s)) ||
                            (r.status && r.status.toLowerCase().includes(s.replace(/\s+/g, '_')));
        }

        return matchesStatus && matchesSearch;
    });

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">System Reports</h1>
                    <p className="text-gray-500 mt-2">View all garbage submissions and their statuses.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white shadow-sm text-gray-700 h-[42px]"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending_validation">Pending Validation</option>
                        <option value="verified_dump">Verified Dump</option>
                        <option value="rejected">Rejected</option>
                        <option value="cleanup_assigned">Cleanup Assigned</option>
                        <option value="cleaned">Cleaned</option>
                    </select>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by ID, Citizen..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 w-full md:w-80 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none bg-white shadow-sm h-[42px]"
                        />
                    </div>
                </div>
            </div>

            <VerifiedDumpsTable reports={filteredReports} />
        </div>
    );
};

export default AdminReports;
