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

        // Feature 4: Orphaned Worker Protection
        if (user.role === "team_lead") {
            const assignedWorkersCount = await User.countDocuments({ teamLeadId: id });
            if (assignedWorkersCount > 0) {
                return res.status(400).json({ 
                    message: `Cannot delete Team Lead. They currently have ${assignedWorkersCount} assigned worker(s). Please edit those workers to assign them a new Team Lead before deleting.`
                });
            }
        }

        // Hard-delete
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

// GET /api/admin/users
// Admin gets all workers and team leads
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: "admin" } })
            .select("-password")
            .populate("teamLeadId", "name email");
            
        res.status(200).json(users);
    } catch (error) {
        console.error("Get All Users Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/admin/edit-user/:id
// Admin edits user details
exports.editUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, teamLeadId } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: "Email already exists" });
            }
            user.email = email;
        }

        if (name) user.name = name;
        if (role) user.role = role;
        if (teamLeadId !== undefined) user.teamLeadId = teamLeadId;

        await user.save();

        res.status(200).json({
            message: "User updated successfully",
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error("Edit User Error:", error);
        res.status(500).json({ message: error.message });
    }
};
