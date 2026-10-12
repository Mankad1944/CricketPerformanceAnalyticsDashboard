import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PlayerDashboard from "./pages/PlayerDashboard";
import CoachDashboard from "./pages/CoachDashboard";
import AnalystDashboard from "./pages/AnalystDashboard";
import AuthProvider from "./context/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />

          {/* Admin Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Player Dashboard */}
          <Route
            path="/playerDashboard"
            element={
              <ProtectedRoute allowedRole="player">
                <PlayerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Player Dashboard */}
          <Route
            path="/coachDashboard"
            element={
              <ProtectedRoute allowedRole="coach">
                <CoachDashboard />
              </ProtectedRoute>
            }
          />

          {/* Analyst Dashboard */}
          <Route
            path="/analystDashboard"
            element={
              <ProtectedRoute allowedRole="analyst">
                <AnalystDashboard />
              </ProtectedRoute>
            }
          />

        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
