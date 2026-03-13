import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { token, user } = useAuth();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Redirect to their respective dashboard if they try to access unauthorized routes
        if (user.role === "admin") return <Navigate to="/admin" replace />;
        if (user.role === "team_lead") return <Navigate to="/team-lead" replace />;
        if (user.role === "worker") return <Navigate to="/worker" replace />;
        return <Navigate to="/citizen" replace />;
    }

    return children;
};

export default ProtectedRoute;
