import { School, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BRAND } from "../config/brand";
import ThemeToggle from "./ThemeToggle";

export default function SetupLayout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="setup-page">
      <header className="setup-page-header">
        <div className="setup-page-brand">
          <div className="setup-brand-icon"><School size={18} /></div>
          <span className="setup-brand-name">{BRAND.fullName}</span>
        </div>
        <div className="header-actions">
          <ThemeToggle />
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}
