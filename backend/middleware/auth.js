const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token, authorization denied,please try again" });
    }

    try {
        const token = header.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if password was changed after the token was issued
        const user = await User.findById(decoded.id).select("passwordChangedAt");
        if (user && user.passwordChangedAt) {
            const changedTimestamp = Math.floor(user.passwordChangedAt.getTime() / 1000);
            if (decoded.iat < changedTimestamp) {
                return res.status(401).json({ message: "Password was recently changed. Please log in again." });
            }
        }

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token is not valid,please try again" });
    }
};

module.exports = auth;
