import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CitizenDashboard from "./pages/Citizen/CitizenDashboard";
import TeamLeadDashboard from "./pages/TeamLead/TeamLeadDashboard";
import WorkerDashboard from "./pages/Worker/WorkerDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes inside DashboardLayout */}
          <Route element={<DashboardLayout />}>
            <Route
              path="/citizen"
              element={
                <ProtectedRoute allowedRoles={["citizen"]}>
                  <CitizenDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/team-lead"
              element={
                <ProtectedRoute allowedRoles={["team_lead"]}>
                  <TeamLeadDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/worker"
              element={
                <ProtectedRoute allowedRoles={["worker"]}>
                  <WorkerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
