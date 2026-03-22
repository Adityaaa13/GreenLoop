const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/roleAuth");
const dashboardController = require("../controllers/dashboardController");

// All dashboard routes require authentication
router.use(auth);

// GET /api/dashboard/admin
router.get(
    "/admin",
    authorizeRoles("admin"),
    dashboardController.getAdminDashboard
);

// GET /api/dashboard/team-lead
router.get(
    "/team-lead",
    authorizeRoles("team_lead"),
    dashboardController.getTeamLeadDashboard
);

// GET /api/dashboard/team-lead/workers
router.get(
    "/team-lead/workers",
    authorizeRoles("team_lead"),
    dashboardController.getTeamWorkers
);

// GET /api/dashboard/worker
router.get(
    "/worker",
    authorizeRoles("worker"),
    dashboardController.getWorkerDashboard
);

// GET /api/dashboard/citizen
router.get(
    "/citizen",
    authorizeRoles("citizen"),
    dashboardController.getCitizenDashboard
);

module.exports = router;
