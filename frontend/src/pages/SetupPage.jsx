import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight, Loader2, Lock, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  SETUP_STEPS,
  isStepDone,
  isStepUnlocked,
  getSetupProgress,
  getStepPath,
} from "../config/setupSteps";
import useSetupStatus from "../hooks/useSetupStatus";
import SetupLayout from "../components/SetupLayout";

export default function SetupPage() {
  const { admin } = useAuth();
  const navigate = useNavigate();
  const { counts, loading, isComplete } = useSetupStatus();

  useEffect(() => {
    if (!loading && isComplete) navigate("/", { replace: true });
  }, [loading, isComplete, navigate]);

  const progress = getSetupProgress(counts);
  const currentStepKey = SETUP_STEPS.find((s) => !isStepDone(s.key, counts))?.key;

  if (loading) {
    return (
      <div className="setup-page-loading">
        <Loader2 size={28} className="spin-icon" />
        <span>Loading setup…</span>
      </div>
    );
  }

  return (
    <SetupLayout>
      <div className="setup-center">
        <div className="setup-card">
          <div className="setup-card-head">
            <p className="setup-eyebrow">Initial configuration</p>
            <h1 className="setup-title">Welcome, {admin?.name?.split(" ")[0] || "Admin"}</h1>
            <p className="setup-subtitle">Complete each step in order to configure your school.</p>
          </div>

          <div className="setup-progress-wrap">
            <div className="setup-progress-meta">
              <span>Setup progress</span>
              <span className="setup-progress-pct">{progress.percent}%</span>
            </div>
            <div className="setup-progress-track">
              <div className="setup-progress-fill" style={{ width: `${progress.percent}%` }} />
            </div>
            <span className="setup-progress-count">{progress.done} of {progress.total} steps completed</span>
          </div>

          <ol className="setup-timeline">
            {SETUP_STEPS.map((step, i) => {
              const done = isStepDone(step.key, counts);
              const unlocked = isStepUnlocked(step.key, counts);
              const locked = !unlocked;
              const isCurrent = step.key === currentStepKey;
              const isLast = i === SETUP_STEPS.length - 1;

              return (
                <li
                  key={step.key}
                  className={`setup-timeline-item ${done ? "complete" : ""} ${isCurrent ? "current" : ""} ${locked ? "locked" : ""}`}
                >
                  {!isLast && <span className="setup-timeline-line" aria-hidden />}
                  <button
                    type="button"
                    className="setup-timeline-row"
                    disabled={locked}
                    onClick={() => !locked && navigate(getStepPath(step.key))}
                  >
                    <span className={`setup-timeline-marker ${done ? "done" : ""} ${isCurrent ? "active" : ""} ${locked ? "locked" : ""}`}>
                      {done ? <Check size={14} strokeWidth={3} /> : locked ? <Lock size={12} /> : i + 1}
                    </span>
                    <span className="setup-timeline-body">
                      <span className="setup-timeline-label">{step.label}</span>
                      <span className="setup-timeline-desc">{step.desc}</span>
                    </span>
                    {done ? (
                      <span className="setup-complete-badge"><Check size={12} /> Done</span>
                    ) : locked ? (
                      <span className="setup-locked-badge"><Lock size={12} /> Locked</span>
                    ) : (
                      <ChevronRight size={16} className="setup-timeline-chevron" />
                    )}
                  </button>
                </li>
              );
            })}
          </ol>

          {isComplete && (
            <button type="button" className="btn btn-primary setup-finish-btn" onClick={() => navigate("/")}>
              Enter Dashboard <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </SetupLayout>
  );
}
