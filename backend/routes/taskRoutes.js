const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/roleAuth");
const { assignTask } = require("../controllers/taskController");

// POST /api/tasks/assign
// Only 'team_lead' can assign tasks
router.post(
    "/assign",
    auth,
    authorizeRoles("team_lead"),
    assignTask
);

// POST /api/tasks/upload-cleanup
// Only 'worker' can upload
router.post(
    "/upload-cleanup",
    auth,
    authorizeRoles("worker"),
    require("../services/uploadService").single("image"),
    require("../controllers/taskController").uploadCleanup
);

// GET /api/tasks
// Fetch all tasks for Admin monitoring
router.get(
    "/",
    auth,
    authorizeRoles("admin"),
    require("../controllers/taskController").getAllTasks
);

module.exports = router;
