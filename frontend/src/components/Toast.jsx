import { CheckCircle2, XCircle, Info, X } from "lucide-react";

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

export default function Toast({ toasts }) {
  if (!toasts || toasts.length === 0) return null;
  return (
    <div className="toast-container">
      {toasts.map((t) => {
        const Icon = icons[t.type] || Info;
        return (
          <div key={t.id} className={`toast toast-${t.type || "info"}`}>
            <Icon size={16} className="flex-shrink-0" />
            <span className="flex-1 text-sm font-medium">{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
