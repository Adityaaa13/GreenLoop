const User = require("../models/User");
const bcrypt = require("bcryptjs");

// POST /api/admin/create-team-lead
// Admin creates a team lead
exports.createTeamLead = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const teamLead = await User.create({
            name,
            email,
            password,
            role: "team_lead"
        });

        res.status(201).json({
            message: "Team Lead created successfully",
            user: { id: teamLead._id, name: teamLead.name, email: teamLead.email, role: teamLead.role }
        });
    } catch (error) {
        console.error("Create Team Lead Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// POST /api/admin/create-worker
// Admin creates a worker (requires teamLeadId)
exports.createWorker = async (req, res) => {
    try {
        const { name, email, password, teamLeadId } = req.body;

        if (!name || !email || !password || !teamLeadId) {
            return res.status(400).json({ message: "Name, email, password, and teamLeadId are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Verify team_lead exists
        const teamLead = await User.findById(teamLeadId);
        if (!teamLead || teamLead.role !== "team_lead") {
            return res.status(400).json({ message: "Invalid teamLeadId provided" });
        }

        const worker = await User.create({
            name,
            email,
            password,
            role: "worker",
            teamLeadId
        });

        res.status(201).json({
            message: "Worker created successfully",
            user: { id: worker._id, name: worker.name, email: worker.email, role: worker.role, teamLeadId: worker.teamLeadId }
        });
    } catch (error) {
        console.error("Create Worker Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/admin/delete-user/:id
// Admin deletes or disables a user
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Safety check: prevent admin from deleting themselves
        if (id === req.user.id) {
            return res.status(400).json({ message: "Admin cannot delete their own account" });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Rather than hard-delete, which corrupts historical tasks/reports, soft delete / disable is preferred.
        // However, user specifically asked for "delete user". Let's hard-delete since they wrote "DELETE".
        await User.findByIdAndDelete(id);

        res.status(200).json({ message: "User hard-deleted successfully" });
    } catch (error) {
        console.error("Delete User Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/admin/reset-password/:id
// Admin forces a password reset
exports.resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters" });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // The userSchema has a pre("save") hook that handles bcrypt hashing.
        // We just update the plaintext and call save().
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: error.message });
    }
};
