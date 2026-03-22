import React, { useState, useEffect } from "react";
import api from "../../services/api";
import SummaryCards from "../../components/admin/SummaryCards";
import AdminCharts from "../../components/admin/AdminCharts";
import AdminMap from "../../components/admin/AdminMap";
import ActivityFeed from "../../components/admin/ActivityFeed";
import OverdueTasks from "../../components/admin/OverdueTasks";

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAllData = async () => {
        try {
            const [dashRes, repRes] = await Promise.all([
                api.get("/dashboard/admin"),
                api.get("/reports"),
            ]);
            
            setDashboardData(dashRes.data);
            setReports(repRes.data.reports || repRes.data);
            
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch admin overview data:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
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
                <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-gray-500 mt-2">System overview and user management control center.</p>
            </div>

            {/* Top Stats Cards */}
            <SummaryCards data={dashboardData} />

            {/* Charts & Feed Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 mt-8">
                <div className="lg:col-span-2">
                    <AdminCharts 
                        monthlyDumpTrend={dashboardData?.monthlyDumpTrend} 
                        dumpStatusBreakdown={dashboardData?.dumpStatusBreakdown} 
                    />
                </div>
                <div className="lg:col-span-1">
                    <ActivityFeed feed={dashboardData?.activityFeed || []} />
                </div>
            </div>

            {/* Overdue Action Items */}
            <OverdueTasks tasks={dashboardData?.overdueActionItems || []} />

            {/* Global Dump Map */}
            <AdminMap reports={reports} />
        </div>
    );
};

export default AdminDashboard;
