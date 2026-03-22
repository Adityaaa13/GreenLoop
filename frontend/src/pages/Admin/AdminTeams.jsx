import React, { useState, useEffect } from "react";
import api from "../../services/api";
import TeamPerformanceList from "../../components/admin/TeamPerformanceList";

const AdminTeams = () => {
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [userRes, taskRes] = await Promise.all([
                api.get("/admin/users"),
                api.get("/tasks")
            ]);
            
            setUsers(userRes.data);
            setTasks(taskRes.data.tasks || taskRes.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch team tracking data:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
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
                <h1 className="text-3xl font-bold text-gray-800">Team Hierarchy & Tracking</h1>
                <p className="text-gray-500 mt-2">A detailed breakdown of Team Leads, their assigned workers, and overall task progression.</p>
            </div>

            <TeamPerformanceList users={users} tasks={tasks} />
            
            {/* Adding an extra widget here to make it "in detail" as requested */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                    <p className="text-gray-500 text-sm font-medium">Total Team Leads</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{users.filter(u => u.role === 'team_lead').length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                    <p className="text-gray-500 text-sm font-medium">Total Workers</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{users.filter(u => u.role === 'worker').length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                    <p className="text-gray-500 text-sm font-medium">Platform Tasks Active</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{tasks.filter(t => t.status === 'assigned').length}</p>
                </div>
            </div>
        </div>
    );
};

export default AdminTeams;
