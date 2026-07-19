import React from "react";
import { cn } from "../lib/utils";
import { BRAND } from "../config/brand";
import {
  LayoutDashboard,
  Users,
  Building2,
  BookOpen,
  Layers,
  CalendarDays,
  GraduationCap,
  LogOut,
  ChevronLeft,
  ChevronRight,
  School,
  BarChart2,
  ClipboardList,
  DollarSign,
  Settings
} from "lucide-react";

export function Sidebar({ collapsed, admin, onLogout, activeTab, onTabChange }) {
  const navItems = [
    { label: "Overview", icon: LayoutDashboard, id: "dashboard", section: "Main" },
    { label: "Students", icon: Users, id: "students", section: "Main" },
    { label: "Teachers", icon: Users, id: "teachers", section: "Main" },
    { label: "Parents", icon: Users, id: "parents", section: "Main" },
    { label: "Academics", icon: BarChart2, id: "academics", section: "Main" },
    { label: "Attendance", icon: ClipboardList, id: "attendance", section: "Main" },
    { label: "Finance", icon: DollarSign, id: "finance", section: "Main" },
    { label: "Campuses", icon: Building2, id: "campuses", section: "Setup" },
    { label: "Subjects", icon: BookOpen, id: "subjects", section: "Setup" },
    { label: "Classes", icon: GraduationCap, id: "classes", section: "Setup" },
    { label: "Sections", icon: Layers, id: "sections", section: "Setup" },
    { label: "Timetable", icon: CalendarDays, id: "timetable", section: "Setup" },
    { label: "Settings", icon: Settings, id: "settings", section: "System" },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col bg-card border-r border-border transition-all duration-300 z-30 h-full",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Brand */}
      <div className="flex h-16 items-center justify-center border-b border-border px-4">
        <div className="flex items-center gap-3 w-full overflow-hidden">
          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8">
            <img src="/favicon.svg" alt="Logo" className="w-full h-full drop-shadow-sm" />
          </div>
          {!collapsed && (
            <div className="flex flex-col justify-center gap-0.5 whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
              <span className="font-bold text-sm tracking-tight text-foreground leading-none">{BRAND.name}</span>
              <span className="text-[10px] font-medium text-muted-foreground leading-none">Smart School Management</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2 px-3 flex flex-col gap-1">
        {navItems.map((item, i) => {
          const showSection = !collapsed && (i === 0 || navItems[i - 1].section !== item.section);
          const isActive = activeTab === item.id;
          
          return (
            <React.Fragment key={item.id}>
              {showSection && (
                <div className={cn("px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", i === 0 ? "pt-1" : "pt-5")}>
                  {item.section}
                </div>
              )}
              <button
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 group w-full text-left",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={18} className={cn("flex-shrink-0", isActive && "text-primary")} />
                {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Footer / Profile */}
      <div className="p-4 border-t border-border">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-xs uppercase">
                {admin?.name?.substring(0, 2) || "AD"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-foreground truncate">{admin?.name || "Admin User"}</span>
                <span className="text-xs text-muted-foreground truncate">{admin?.email || "admin@school.com"}</span>
              </div>
            </div>
            <button onClick={onLogout} className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10" title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button onClick={onLogout} className="w-full flex justify-center p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10" title="Logout">
            <LogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  );
}
