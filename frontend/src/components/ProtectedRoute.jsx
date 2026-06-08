import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "var(--bg-primary)"
      }}>
        <div className="loading-spinner-lg" />
      </div>
    );
  }

  return token ? children : <Navigate to="/login" replace />;
}
