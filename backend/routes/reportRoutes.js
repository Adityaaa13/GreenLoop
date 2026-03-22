const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/roleAuth");
const upload = require("../services/uploadService");
const { createReport, getMyReports, getAllReports } = require("../controllers/reportController");

// 1. Citizen uploads dump image + GPS
// Only citizen role allowed
router.post(
    "/",
    auth,
    authorizeRoles("citizen"),
    upload.single("image"),
    createReport
);

// 2. Citizen fetches their own reports
router.get(
    "/my",
    auth,
    authorizeRoles("citizen"),
    getMyReports
);

// 3. Admin & Team Lead can view reports
router.get(
    "/",
    auth,
    authorizeRoles("admin", "team_lead"),
    getAllReports
);

module.exports = router;
