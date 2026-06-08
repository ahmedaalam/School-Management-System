import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  School, Mail, Lock, Eye, EyeOff,
  User, UserPlus, AlertCircle, Loader2,
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import { BRAND } from "../config/brand";
import "../auth.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm]         = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("http://localhost:5000/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      login(res.data.token, res.data.admin);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
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
          <h2 className="auth-tagline">Set up your school in minutes.</h2>
          <p className="auth-desc">
            Create your admin account and start configuring campuses, academics, and student records.
          </p>
          <div className="auth-features">
            {[
              "Complete school administration suite",
              "Secure admin authentication",
              "Dark & light mode support",
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
            <h1 className="auth-title">Create account</h1>
            <p className="auth-subtitle">Set up your admin account</p>
          </div>

          {error && (
            <div className="auth-alert">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-name">Full name</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><User size={16} /></span>
                <input
                  id="reg-name"
                  className="auth-input"
                  type="text"
                  name="name"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-email">Email address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><Mail size={16} /></span>
                <input
                  id="reg-email"
                  className="auth-input"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-password">Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><Lock size={16} /></span>
                <input
                  id="reg-password"
                  className="auth-input"
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
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

            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-confirm">Confirm password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><Lock size={16} /></span>
                <input
                  id="reg-confirm"
                  className="auth-input"
                  type={showPass ? "text" : "password"}
                  name="confirm"
                  placeholder="Repeat your password"
                  value={form.confirm}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              id="register-submit"
              type="submit"
              className="auth-btn"
              disabled={loading}
            >
              {loading
                ? <><Loader2 size={16} className="spin-icon" /> Creating account…</>
                : <><UserPlus size={16} /> Create Account</>}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
