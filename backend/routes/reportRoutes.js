const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/roleAuth");
const upload = require("../services/uploadService");
const { createReport } = require("../controllers/reportController");

// 1. Citizen uploads dump image + GPS
// Only citizen role allowed
router.post(
    "/",
    auth,
    authorizeRoles("citizen"),
    upload.single("image"),
    createReport
);

// 2. Admin monitors reports
// Only admin role allowed
router.get(
    "/",
    auth,
    authorizeRoles("admin"),
    require("../controllers/reportController").getAllReports
);

module.exports = router;
