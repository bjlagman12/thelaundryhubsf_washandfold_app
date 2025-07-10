import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "./LoadingScreen";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/admin" state={{ from: location }} replace />;
  if (!isAdmin) return <div>Access denied. Admins only.</div>;

  return <>{children}</>;
};

export default ProtectedRoute;
