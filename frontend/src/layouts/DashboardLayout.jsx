import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

export function DashboardLayout({ children, admin, onLogout, sidebarCollapsed, setSidebarCollapsed, activeTab, onTabChange }) {
  // We can manage sidebar collapsed state here or receive it from parent
  const [collapsed, setCollapsed] = useState(sidebarCollapsed || false);

  const toggleSidebar = () => {
    if (setSidebarCollapsed) setSidebarCollapsed(!collapsed);
    setCollapsed(!collapsed);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden text-foreground">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} admin={admin} onLogout={onLogout} activeTab={activeTab} onTabChange={onTabChange} />

      {/* Main Content area */}
      <div className={`flex flex-col flex-1 transition-all duration-300 ease-in-out`}>
        {/* Top Navbar */}
        <TopNav toggleSidebar={toggleSidebar} collapsed={collapsed} admin={admin} onLogout={onLogout} />
        
        {/* Workspace */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
