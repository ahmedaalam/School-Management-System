import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { School, LogOut, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { BRAND } from "../config/brand";
import { SETUP_STEPS, isStepDone, getSetupProgress } from "../config/setupSteps";
import useSetupStatus from "../hooks/useSetupStatus";
import useApi from "../hooks/useApi";
import ThemeToggle from "../components/ThemeToggle";
import CampusesPanel from "../components/CampusesPanel";
import SubjectsPanel from "../components/SubjectsPanel";
import SectionsPanel from "../components/SectionsPanel";
import TimetablePanel from "../components/TimetablePanel";
import SetupStudentsStep from "../components/SetupStudentsStep";
import Toast from "../components/Toast";

export default function SetupPage() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const api = useApi();
  const { counts, loading, refresh, isComplete } = useSetupStatus();
  const [activeStep, setActiveStep] = useState("campuses");
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  useEffect(() => {
    if (!loading && isComplete) navigate("/", { replace: true });
  }, [loading, isComplete, navigate]);

  useEffect(() => {
    if (isStepDone(activeStep, counts)) {
      const currentIdx = SETUP_STEPS.findIndex((s) => s.key === activeStep);
      const next = SETUP_STEPS.slice(currentIdx + 1).find((s) => !isStepDone(s.key, counts));
      if (next) setActiveStep(next.key);
    }
  }, [counts, activeStep]);

  const progress = getSetupProgress(counts);

  const handleLogout = () => { logout(); navigate("/login"); };

  const renderStepPanel = () => {
    const props = { api, showToast, onDataChange: refresh, embedded: true };
    switch (activeStep) {
      case "campuses": return <CampusesPanel {...props} />;
      case "subjects": return <SubjectsPanel {...props} />;
      case "sections": return <SectionsPanel {...props} />;
      case "students": return <SetupStudentsStep {...props} />;
      case "timetable": return <TimetablePanel {...props} />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="setup-page-loading">
        <Loader2 size={32} className="spin-icon" />
        <span>Loading setup…</span>
      </div>
    );
  }

  return (
    <div className="setup-page">
      <header className="setup-page-header">
        <div className="setup-page-brand">
          <div className="sidebar-logo"><School size={20} /></div>
          <div>
            <div className="sidebar-logo-text">School<span>MS</span></div>
            <div className="setup-page-brand-sub">{BRAND.fullName} — Initial Setup</div>
          </div>
        </div>
        <div className="header-actions">
          <ThemeToggle />
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      <div className="setup-page-body">
        <aside className="setup-sidebar">
          <div className="setup-welcome">
            <h2>Welcome, {admin?.name?.split(" ")[0] || "Admin"}!</h2>
            <p>Complete these steps to configure your school before accessing the dashboard.</p>
          </div>

          <div className="setup-progress-card">
            <div className="setup-progress-header">
              <span>Setup Progress</span>
              <span className="setup-progress-pct">{progress.percent}%</span>
            </div>
            <div className="setup-progress-track">
              <div className="setup-progress-fill" style={{ width: `${progress.percent}%` }} />
            </div>
            <span className="setup-progress-count">{progress.done} of {progress.total} steps complete</span>
          </div>

          <nav className="setup-steps-nav">
            {SETUP_STEPS.map((step, i) => {
              const done = isStepDone(step.key, counts);
              const active = activeStep === step.key;
              return (
                <button
                  key={step.key}
                  className={`setup-nav-step ${done ? "done" : ""} ${active ? "active" : ""}`}
                  onClick={() => setActiveStep(step.key)}
                >
                  <span className="setup-nav-num">
                    {done ? <CheckCircle2 size={14} /> : i + 1}
                  </span>
                  <step.icon size={16} />
                  <div className="setup-nav-text">
                    <span className="setup-nav-label">{step.label}</span>
                    <span className="setup-nav-desc">{step.desc}</span>
                  </div>
                </button>
              );
            })}
          </nav>

          {isComplete && (
            <button className="btn btn-primary setup-enter-btn" onClick={() => navigate("/")}>
              Enter Dashboard <ArrowRight size={16} />
            </button>
          )}
        </aside>

        <main className="setup-main">
          <div className="setup-main-header">
            <h1>{SETUP_STEPS.find((s) => s.key === activeStep)?.label}</h1>
            <p>{SETUP_STEPS.find((s) => s.key === activeStep)?.desc}</p>
          </div>
          {renderStepPanel()}
        </main>
      </div>

      <Toast toasts={toasts} />
    </div>
  );
}
