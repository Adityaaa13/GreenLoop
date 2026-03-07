const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role, isActive: user.isActive },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// POST /api/auth/register
// Citizen registration only
exports.registerCitizens = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exist's" });
        }

        // Force role to citizen
        const user = await User.create({
            name,
            email,
            password,
            role: "citizen"
        });

        res.status(201).json({
            token: generateToken(user),
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/auth/login
// Login for all roles
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: "Account is disabled" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        res.json({
            token: generateToken(user),
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
