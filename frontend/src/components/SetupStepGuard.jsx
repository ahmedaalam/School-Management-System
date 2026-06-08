import { Navigate, useParams } from "react-router-dom";
import useSetupStatus from "../hooks/useSetupStatus";
import { getStepByKey, isStepUnlocked } from "../config/setupSteps";

export default function SetupStepGuard({ children }) {
  const { stepKey } = useParams();
  const { counts, loading, isComplete } = useSetupStatus();

  if (loading) {
    return (
      <div className="setup-page-loading">
        <div className="loading-spinner-lg" />
      </div>
    );
  }

  if (isComplete) return <Navigate to="/setup" replace />;

  const step = getStepByKey(stepKey);
  if (!step) return <Navigate to="/setup" replace />;

  if (!isStepUnlocked(stepKey, counts)) return <Navigate to="/setup" replace />;

  return children;
}
