import React, { useState, useEffect } from "react";
import api from "../../services/api";
import VerifiedDumpsTable from "../../components/admin/VerifiedDumpsTable";

const AdminReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">System Reports</h1>
                <p className="text-gray-500 mt-2">View all garbage submissions and their statuses.</p>
            </div>

            <VerifiedDumpsTable reports={reports} />
        </div>
    );
};

export default AdminReports;
