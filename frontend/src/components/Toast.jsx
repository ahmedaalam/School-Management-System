import { CheckCircle2, AlertCircle } from "lucide-react";

export default function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span className="toast-icon">
            {t.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          </span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
