import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  School,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  UserPlus,
  AlertCircle,
  Loader2,
  GraduationCap,
  ShieldCheck,
  Palette,
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import { BRAND } from "../config/brand";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      login(res.data.token, res.data.user || res.data.admin);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: GraduationCap, text: "Complete school administration suite" },
    { icon: ShieldCheck, text: "Secure role-based authentication & logins" },
    { icon: Palette, text: "Clean, responsive UI with dark/light mode" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* ── Left decorative panel ─── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(150deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)",
        }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full opacity-20"
          style={{ background: "rgba(255,255,255,0.3)", filter: "blur(60px)" }}
        />
        <div
          className="absolute bottom-[-60px] right-[-60px] w-64 h-64 rounded-full opacity-15"
          style={{ background: "rgba(255,255,255,0.4)", filter: "blur(50px)" }}
        />

        {/* Brand */}
        <div className="relative z-10 p-10">
          <div className="flex items-center gap-3 mb-16">
            <img src="/favicon.svg" alt="Logo" className="w-10 h-10 drop-shadow-md" />
            <div>
              <div className="text-white font-bold text-lg leading-tight">
                {BRAND.fullName}
              </div>
              <div className="text-white/60 text-xs">
                Smart School Management
              </div>
            </div>
          </div>

          <h2 className="text-white text-4xl font-extrabold leading-tight mb-4">
            Set up your
            <br />
            school in
            <br />
            minutes.
          </h2>
          <p className="text-white/70 text-sm leading-relaxed mb-10">
            Create your admin account and start configuring campuses, academics,
            and student records.
          </p>

          <div className="flex flex-col gap-4">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/15 flex-shrink-0">
                  <Icon size={15} className="text-white" />
                </div>
                <span className="text-white/85 text-sm font-medium">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 p-10">
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} {BRAND.fullName}. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right registration panel ─── */}
      <div
        className="flex-1 flex flex-col"
        style={{ background: "var(--bg-primary)" }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-5">
          <div className="flex lg:hidden items-center gap-2">
            <img src="/favicon.svg" alt="Logo" className="w-5 h-5 drop-shadow-sm" />
            <span
              className="font-bold text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              {BRAND.fullName}
            </span>
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-8 pb-12 pt-4">
          <div className="w-full max-w-md animate-slide-up">
            <div className="mb-6">
              <h1
                className="text-3xl font-extrabold mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                Create account
              </h1>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Set up your admin account to get started
              </p>
            </div>

            {error && (
              <div
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-4 text-sm font-medium"
                style={{
                  background: "var(--danger-bg)",
                  color: "var(--danger-text)",
                  border: "1px solid var(--danger)",
                }}
              >
                <AlertCircle size={15} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Full Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">
                  Full name
                </label>
                <div className="input-with-icon">
                  <span className="input-icon">
                    <User size={15} />
                  </span>
                  <input
                    id="reg-name"
                    className="form-input"
                    type="text"
                    name="name"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">
                  Email address
                </label>
                <div className="input-with-icon">
                  <span className="input-icon">
                    <Mail size={15} />
                  </span>
                  <input
                    id="reg-email"
                    className="form-input"
                    type="email"
                    name="email"
                    placeholder="you@school.edu"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">
                  Password
                </label>
                <div className="input-with-icon relative">
                  <span className="input-icon">
                    <Lock size={15} />
                  </span>
                  <input
                    id="reg-password"
                    className="form-input"
                    type={showPass ? "text" : "password"}
                    name="password"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    style={{ paddingRight: "42px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors"
                    style={{
                      color: "var(--text-muted)",
                      background: "transparent",
                      border: "none",
                    }}
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirm">
                  Confirm password
                </label>
                <div className="input-with-icon">
                  <span className="input-icon">
                    <Lock size={15} />
                  </span>
                  <input
                    id="reg-confirm"
                    className="form-input"
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
                className="btn btn-primary w-full justify-center py-3 text-base mt-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="spin-icon" /> Creating
                    account…
                  </>
                ) : (
                  <>
                    <UserPlus size={16} /> Create Account
                  </>
                )}
              </button>
            </form>

            <p
              className="text-sm text-center mt-6"
              style={{ color: "var(--text-muted)" }}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold hover:underline"
                style={{ color: "var(--accent)" }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
