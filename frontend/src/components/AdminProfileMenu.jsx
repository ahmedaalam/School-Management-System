import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { User, Settings, LogOut, Mail, Shield, Calendar, X } from "lucide-react";
import { API_BASE } from "../api/config";

function getInitials(name = "") {
  return name.trim().split(" ").map((w) => w[0]?.toUpperCase()).slice(0, 2).join("");
}

export default function AdminProfileMenu({ admin, token, onLogout, onSettings }) {
  const [open, setOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setProfile(res.data))
      .catch(() => setProfile(null));
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const displayName = profile?.name || admin?.name || "Admin";
  const displayEmail = profile?.email || admin?.email || "";
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;

  const handleProfile = () => {
    setOpen(false);
    setShowProfile(true);
  };

  const handleSettings = () => {
    setOpen(false);
    onSettings?.();
  };

  const handleLogout = () => {
    setOpen(false);
    onLogout();
  };

  return (
    <>
      <div className="admin-profile-menu" ref={menuRef}>
        <button
          className={`admin-profile-icon-btn ${open ? "open" : ""}`}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="true"
          title="Account menu"
        >
          <div className="admin-avatar admin-avatar-header">{getInitials(displayName)}</div>
        </button>

        {open && (
          <div className="admin-profile-dropdown">
            <div className="admin-dropdown-header">
              <div className="admin-avatar admin-avatar-lg">{getInitials(displayName)}</div>
              <div className="admin-dropdown-identity">
                <span className="admin-dropdown-name">{displayName}</span>
                <span className="admin-dropdown-email">{displayEmail}</span>
              </div>
            </div>

            <div className="admin-dropdown-divider" />

            <div className="admin-dropdown-menu">
              <button className="admin-dropdown-item" onClick={handleProfile}>
                <User size={16} />
                Profile
              </button>
              <button className="admin-dropdown-item" onClick={handleSettings}>
                <Settings size={16} />
                Settings
              </button>
            </div>

            <div className="admin-dropdown-divider" />

            <button className="admin-dropdown-item danger" onClick={handleLogout}>
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        )}
      </div>

      {showProfile && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">
                <span className="modal-title-icon"><User size={15} /></span>
                My Profile
              </span>
              <button className="modal-close" onClick={() => setShowProfile(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="profile-modal-header">
                <div className="admin-avatar admin-avatar-xl">{getInitials(displayName)}</div>
                <div>
                  <div className="profile-modal-name">{displayName}</div>
                  <div className="profile-modal-role">System Administrator</div>
                </div>
              </div>
              <div className="admin-dropdown-details" style={{ padding: 0, marginTop: 20 }}>
                <div className="admin-detail-row">
                  <Mail size={14} />
                  <div>
                    <span className="admin-detail-label">Email</span>
                    <span className="admin-detail-value">{displayEmail}</span>
                  </div>
                </div>
                <div className="admin-detail-row">
                  <Shield size={14} />
                  <div>
                    <span className="admin-detail-label">Role</span>
                    <span className="admin-detail-value">System Admin</span>
                  </div>
                </div>
                {memberSince && (
                  <div className="admin-detail-row">
                    <Calendar size={14} />
                    <div>
                      <span className="admin-detail-label">Member since</span>
                      <span className="admin-detail-value">{memberSince}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowProfile(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
