import { Navigate } from "react-router-dom";
import useSetupStatus from "../hooks/useSetupStatus";

export default function SetupGuard({ children }) {
  const { isComplete, loading } = useSetupStatus();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "var(--bg-primary)",
      }}>
        <div className="loading-spinner-lg" />
      </div>
    );
  }

  if (!isComplete) return <Navigate to="/setup" replace />;
  return children;
}
