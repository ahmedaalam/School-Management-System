import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  School, Mail, Lock, Eye, EyeOff,
  LogIn, AlertCircle, Loader2,
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import { BRAND } from "../config/brand";
import "../auth.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm]       = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("http://localhost:5000/auth/login", form);
      login(res.data.token, res.data.admin);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo">
            <School size={28} />
          </div>
          <span className="auth-logo-text auth-logo-full">{BRAND.fullName}</span>
        </div>
        <div className="auth-left-content">
          <h2 className="auth-tagline">Run your entire school from one platform.</h2>
          <p className="auth-desc">{BRAND.description}</p>
          <div className="auth-features">
            {[
              "Campuses, subjects & class sections",
              "Student enrollment & academics",
              "Attendance tracking & timetables",
            ].map((f) => (
              <div className="auth-feature-item" key={f}>
                <div className="auth-feature-dot" />
                {f}
              </div>
            ))}
          </div>
        </div>
        <div className="auth-left-footer">
          © {new Date().getFullYear()} {BRAND.fullName}. All rights reserved.
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-theme-toggle"><ThemeToggle /></div>
        <div className="auth-card">
          <div className="auth-card-header">
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to your admin account</p>
          </div>

          {error && (
            <div className="auth-alert">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-email">Email address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><Mail size={16} /></span>
                <input
                  id="login-email"
                  className="auth-input"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="login-password">Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><Lock size={16} /></span>
                <input
                  id="login-password"
                  className="auth-input"
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="Your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPass((s) => !s)}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              className="auth-btn"
              disabled={loading}
            >
              {loading
                ? <><Loader2 size={16} className="spin-icon" /> Signing in…</>
                : <><LogIn size={16} /> Sign In</>}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
