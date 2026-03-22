import React, { useState, useEffect } from "react";
import api from "../../services/api";
import UserManagement from "../../components/admin/UserManagement";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get("/admin/users");
            setUsers(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch users:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
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
                <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
                <p className="text-gray-500 mt-2">Manage Citizens, Workers, and Team Leads.</p>
            </div>

            <UserManagement users={users} refetchUsers={fetchUsers} />
        </div>
    );
};

export default AdminUsers;
