import React, { useState } from "react";
import { UserPlus, Edit2, Trash2, KeyRound, X } from "lucide-react";
import api from "../../services/api";

const UserManagement = ({ users, refetchUsers }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [isResetting, setIsResetting] = useState(null);
    const [isEditing, setIsEditing] = useState(null);
    const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "worker", teamLeadId: "" });
    const [resetData, setResetData] = useState({ newPassword: "" });
    const [editData, setEditData] = useState({ teamLeadId: "" });
    const [activeTab, setActiveTab] = useState("workers");

    const teamLeads = users.filter((u) => u.role === "team_lead");
    const workers = users.filter((u) => u.role === "worker");
    const citizens = users.filter((u) => u.role === "citizen");

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = formData.role === "team_lead" ? "/admin/create-team-lead" : "/admin/create-worker";
            await api.post(endpoint, formData);
            alert(`${formData.role.replace("_", " ")} created successfully!`);
            setIsCreating(false);
            setFormData({ name: "", email: "", password: "", role: "worker", teamLeadId: "" });
            refetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || "Error creating user");
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete ${name}?`)) {
            try {
                await api.delete(`/admin/delete-user/${id}`);
                alert("User deleted");
                refetchUsers();
            } catch (error) {
                alert(error.response?.data?.message || "Error deleting user");
            }
        }
    };

    const handleResetSubmit = async (e, id) => {
        e.preventDefault();
        try {
            await api.put(`/admin/reset-password/${id}`, { newPassword: resetData.newPassword });
            alert("Password reset successfully!");
            setIsResetting(null);
            setResetData({ newPassword: "" });
        } catch (error) {
            alert(error.response?.data?.message || "Error resetting password");
        }
    };

    const handleEditSubmit = async (e, id) => {
        e.preventDefault();
        try {
            await api.put(`/admin/edit-user/${id}`, { teamLeadId: editData.teamLeadId });
            alert("Worker reassigned successfully!");
            setIsEditing(null);
            refetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || "Error editing user");
        }
    };

    const renderResetRow = (user, colSpan) => {
        if (isResetting !== user._id) return null;
        return (
            <tr className="bg-blue-50/30">
                <td colSpan={colSpan} className="px-6 py-4">
                    <form onSubmit={(e) => handleResetSubmit(e, user._id)} className="flex items-center space-x-4">
                        <input
                            type="text"
                            placeholder={`New password for ${user.name}`}
                            required
                            minLength={6}
                            className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                            value={resetData.newPassword}
                            onChange={e => setResetData({ newPassword: e.target.value })}
                        />
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            Update Password
                        </button>
                        <button type="button" onClick={() => setIsResetting(null)} className="text-gray-500 hover:text-gray-700">
                            Cancel
                        </button>
                    </form>
                </td>
            </tr>
        );
    };

    const renderEditRow = (user, colSpan) => {
        if (isEditing !== user._id || user.role !== 'worker') return null;
        return (
            <tr className="bg-emerald-50/30">
                <td colSpan={colSpan} className="px-6 py-4">
                    <form onSubmit={(e) => handleEditSubmit(e, user._id)} className="flex items-center space-x-4">
                        <select
                            required
                            className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-1"
                            value={editData.teamLeadId}
                            onChange={e => setEditData({ teamLeadId: e.target.value })}
                        >
                            <option value="" disabled>Select New Team Lead</option>
                            {teamLeads.map(lead => (
                                <option key={lead._id} value={lead._id}>{lead.name} ({lead.email})</option>
                            ))}
                        </select>
                        <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            Reassign
                        </button>
                        <button type="button" onClick={() => setIsEditing(null)} className="text-gray-500 hover:text-gray-700 text-sm">
                            Cancel
                        </button>
                    </form>
                </td>
            </tr>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">User Management</h3>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    <UserPlus size={16} />
                    <span>Create User</span>
                </button>
            </div>

            {/* Create User Form Modal / Inline */}
            {isCreating && (
                <div className="p-6 border-b border-gray-100 bg-emerald-50/50">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-emerald-800">New User Account</h4>
                        <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                    </div>
                    <form onSubmit={handleCreateSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Full Name"
                            required
                            className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                        <input
                            type="email"
                            placeholder="Email Address"
                            required
                            className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                        <select
                            className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="worker">Worker</option>
                            <option value="team_lead">Team Lead</option>
                        </select>
                        <input
                            type="password"
                            placeholder="Temporary Password (min 6 chars)"
                            required
                            minLength={6}
                            className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                        {formData.role === "worker" && (
                            <select
                                required
                                className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 md:col-span-2"
                                value={formData.teamLeadId}
                                onChange={e => setFormData({ ...formData, teamLeadId: e.target.value })}
                            >
                                <option value="" disabled>Select Team Lead</option>
                                {teamLeads.map(lead => (
                                    <option key={lead._id} value={lead._id}>{lead.name} ({lead.email})</option>
                                ))}
                            </select>
                        )}
                        <div className="md:col-span-2">
                            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full">
                                Create Account
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Tabs */}
            <div className="px-6 pt-4 border-b border-gray-100 flex space-x-6">
                <button
                    onClick={() => setActiveTab("team_leads")}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "team_leads" ? "border-indigo-600 text-indigo-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                >
                    Team Leads ({teamLeads.length})
                </button>
                <button
                    onClick={() => setActiveTab("workers")}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "workers" ? "border-emerald-600 text-emerald-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                >
                    Workers ({workers.length})
                </button>
                <button
                    onClick={() => setActiveTab("citizens")}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "citizens" ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                >
                    Citizens ({citizens.length})
                </button>
            </div>

            <div className="overflow-x-auto">
                {activeTab === "team_leads" && (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead Info</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Crew ({workers.length})</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {teamLeads.map((user) => {
                                const assignedWorkers = workers.filter(w => w.teamLeadId?._id === user._id || w.teamLeadId === user._id);
                                return (
                                    <React.Fragment key={user._id}>
                                        <tr className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-indigo-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {assignedWorkers.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {assignedWorkers.map(w => (
                                                            <span key={w._id} className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full whitespace-nowrap">
                                                                {w.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400 italic">No workers assigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                                <button onClick={() => { setIsResetting(isResetting === user._id ? null : user._id); setIsEditing(null); }} className="text-blue-600 hover:text-blue-900" title="Force Reset Password"><KeyRound size={18} /></button>
                                                <button onClick={() => handleDelete(user._id, user.name)} className="text-red-600 hover:text-red-900" title="Delete User"><Trash2 size={18} /></button>
                                            </td>
                                        </tr>
                                        {renderResetRow(user, 3)}
                                    </React.Fragment>
                                );
                            })}
                            {teamLeads.length === 0 && <tr><td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">No team leads found.</td></tr>}
                        </tbody>
                    </table>
                )}

                {activeTab === "workers" && (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker Info</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Manager</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {workers.map((user) => (
                                <React.Fragment key={user._id}>
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user.teamLeadId ? (
                                                <span className="bg-indigo-50 text-indigo-700 font-medium px-3 py-1 rounded-full text-xs">
                                                    {user.teamLeadId.name || user.teamLeadId}
                                                </span>
                                            ) : (
                                                <span className="text-red-600 bg-red-50 font-medium px-3 py-1 rounded-full text-xs">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                            <button onClick={() => { setIsEditing(isEditing === user._id ? null : user._id); setIsResetting(null); setEditData({ teamLeadId: user.teamLeadId?._id || user.teamLeadId || "" }); }} className="text-emerald-600 hover:text-emerald-900" title="Reassign Manager"><Edit2 size={18} /></button>
                                            <button onClick={() => { setIsResetting(isResetting === user._id ? null : user._id); setIsEditing(null); }} className="text-blue-600 hover:text-blue-900" title="Force Reset Password"><KeyRound size={18} /></button>
                                            <button onClick={() => handleDelete(user._id, user.name)} className="text-red-600 hover:text-red-900" title="Delete User"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                    {renderEditRow(user, 3)}
                                    {renderResetRow(user, 3)}
                                </React.Fragment>
                            ))}
                            {workers.length === 0 && <tr><td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">No workers found.</td></tr>}
                        </tbody>
                    </table>
                )}

                {activeTab === "citizens" && (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Citizen Info</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {citizens.map((user) => (
                                <React.Fragment key={user._id}>
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                            <button onClick={() => { setIsResetting(isResetting === user._id ? null : user._id); setIsEditing(null); }} className="text-blue-600 hover:text-blue-900" title="Force Reset Password"><KeyRound size={18} /></button>
                                            <button onClick={() => handleDelete(user._id, user.name)} className="text-red-600 hover:text-red-900" title="Delete User"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                    {renderResetRow(user, 2)}
                                </React.Fragment>
                            ))}
                            {citizens.length === 0 && <tr><td colSpan="2" className="px-6 py-4 text-center text-sm text-gray-500">No citizens found.</td></tr>}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default UserManagement;
