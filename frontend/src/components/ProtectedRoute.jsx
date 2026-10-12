import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useContext(AuthContext);

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <h1 className="text-blue-400 font-bold text-xl">Loading...</h1>
      </div>
    );
  }

  // If not logged in → go to login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If role is restricted and doesn't match → block access
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
