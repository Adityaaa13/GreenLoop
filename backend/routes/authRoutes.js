const express = require("express");
const router = express.Router();
const { registerCitizen, login } = require("../controllers/authController");

router.post("/register", registerCitizen);
router.post("/login", login);

module.exports = router;
