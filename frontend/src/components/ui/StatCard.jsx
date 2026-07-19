import { cn } from "../../lib/utils";

export default function StatCard({ icon: Icon, label, value, color = "indigo", onClick, trend }) {
  return (
    <div
      className={cn("stat-card", onClick && "stat-card-clickable")}
      onClick={onClick}
    >
      <div className={`stat-icon ${color}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {trend && (
          <div className={`text-[11px] font-semibold mt-0.5 ${trend > 0 ? "text-emerald-500" : "text-red-400"}`}>
            {trend > 0 ? "▲" : "▼"} {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
}
