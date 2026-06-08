import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { getStepByKey, isStepDone } from "../config/setupSteps";
import useSetupStatus from "../hooks/useSetupStatus";
import useApi from "../hooks/useApi";
import SetupLayout from "../components/SetupLayout";
import CampusesPanel from "../components/CampusesPanel";
import SubjectsPanel from "../components/SubjectsPanel";
import SectionsPanel from "../components/SectionsPanel";
import TimetablePanel from "../components/TimetablePanel";
import SetupClassStep from "../components/SetupClassStep";
import Toast from "../components/Toast";

export default function SetupStepPage() {
  const { stepKey } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const { counts, refresh } = useSetupStatus();
  const [toasts, setToasts] = useState([]);

  const step = getStepByKey(stepKey);
  const done = step ? isStepDone(step.key, counts) : false;

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  if (!step) return null;

  const notifySetupChange = useCallback(() => refresh(true), [refresh]);
  const panelProps = { api, showToast, onDataChange: notifySetupChange, embedded: true };

  const renderPanel = () => {
    switch (step.key) {
      case "campuses": return <CampusesPanel {...panelProps} />;
      case "subjects": return <SubjectsPanel {...panelProps} />;
      case "classes": return <SetupClassStep {...panelProps} />;
      case "sections": return <SectionsPanel {...panelProps} />;
      case "timetable": return <TimetablePanel {...panelProps} />;
      default: return null;
    }
  };

  const handleContinue = async () => {
    await refresh(true);
    navigate("/setup");
  };

  return (
    <SetupLayout>
      <div className="setup-step-page">
        <div className="setup-step-container">
          <button type="button" className="setup-back-btn" onClick={() => navigate("/setup")}>
            <ArrowLeft size={16} /> Back to setup
          </button>

          <div className="setup-step-header">
            <div className="setup-step-header-icon">
              <step.icon size={22} />
            </div>
            <div>
              <p className="setup-eyebrow">Setup step</p>
              <h1 className="setup-step-title">{step.label}</h1>
              <p className="setup-step-desc">{step.desc}</p>
            </div>
          </div>

          <div className="setup-step-content">
            {renderPanel()}
          </div>

          <div className="setup-step-footer">
            {done ? (
              <div className="setup-step-done-msg">
                <Check size={16} />
                <span>Step completed</span>
              </div>
            ) : (
              <p className="setup-step-hint">Add at least one record to complete this step.</p>
            )}
            <button
              type="button"
              className="btn btn-primary"
              disabled={!done}
              onClick={handleContinue}
            >
              Continue to setup <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
      <Toast toasts={toasts} />
    </SetupLayout>
  );
}
