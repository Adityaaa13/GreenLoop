const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/roleAuth");
const { createTeamLead, createWorker, deleteUser, resetPassword } = require("../controllers/adminController");

// All admin routes are protected by auth and authorizeRoles("admin")
router.use(auth, authorizeRoles("admin"));

// POST /api/admin/create-team-lead
router.post("/create-team-lead", createTeamLead);

// POST /api/admin/create-worker
router.post("/create-worker", createWorker);

// DELETE /api/admin/delete-user/:id
router.delete("/delete-user/:id", deleteUser);

// PUT /api/admin/reset-password/:id
router.put("/reset-password/:id", resetPassword);

module.exports = router;
