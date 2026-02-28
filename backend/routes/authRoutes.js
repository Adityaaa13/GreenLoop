const express = require("express");
const router = express.Router();
const { registerCitizens, login } = require("../controllers/authController");

router.post("/register", registerCitizens);
router.post("/login", login);

module.exports = router;
