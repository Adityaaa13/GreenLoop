// Middleware to restrict access based on roles
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // req.user is set by the `auth` middleware (auth.js)
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Role (${req.user?.role || "unknown"}) is not allowed to access this resource.`,
            });
        }
        next();
    };
};

module.exports = authorizeRoles;
