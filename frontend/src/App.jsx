import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import PublicLayout from "./layouts/PublicLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/Landing";
import About from "./pages/Public/About";
import Contact from "./pages/Public/Contact";
import CitizenDashboard from "./pages/Citizen/CitizenDashboard";
import SubmitReport from "./pages/Citizen/SubmitReport";
import MyReports from "./pages/Citizen/MyReports";
import CommunityStats from "./pages/Citizen/CommunityStats";
import HelpGuides from "./pages/Citizen/HelpGuides";
import TeamLeadDashboard from "./pages/TeamLead/TeamLeadDashboard";
import WorkerDashboard from "./pages/Worker/WorkerDashboard";
import WorkerPreviousTasks from "./pages/Worker/PreviousTasks";
import TeamLeadPreviousTasks from "./pages/TeamLead/PreviousTasks";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminTeams from "./pages/Admin/AdminTeams";
import AdminReports from "./pages/Admin/AdminReports";
import TaskAssignment from "./pages/TeamLead/TaskAssignment";
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
              path="/citizen/submit"
              element={
                <ProtectedRoute allowedRoles={["citizen"]}>
                  <SubmitReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citizen/reports"
              element={
                <ProtectedRoute allowedRoles={["citizen"]}>
                  <MyReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citizen/stats"
              element={
                <ProtectedRoute allowedRoles={["citizen"]}>
                  <CommunityStats />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citizen/help"
              element={
                <ProtectedRoute allowedRoles={["citizen"]}>
                  <HelpGuides />
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
              path="/team-lead/assign"
              element={
                <ProtectedRoute allowedRoles={["team_lead"]}>
                  <TaskAssignment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/team-lead/history"
              element={
                <ProtectedRoute allowedRoles={["team_lead"]}>
                  <TeamLeadPreviousTasks />
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
              path="/worker/history"
              element={
                <ProtectedRoute allowedRoles={["worker"]}>
                  <WorkerPreviousTasks />
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
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/teams"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminTeams />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminReports />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Public Layout and Catch-all */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
