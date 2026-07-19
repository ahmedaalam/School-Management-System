import { useEffect, useState, useCallback } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Users, Search, Plus, Pencil, Trash2,
  X, CheckCircle2, AlertCircle, Mail, User, Loader2,
  BookOpen, Activity, ShieldCheck, LogOut, Phone, Calendar,
  Award, UserX, UserCheck, Filter, LayoutDashboard,
  Settings, School, Shield, ClipboardList, BarChart2, TrendingUp,
  ChevronDown, CheckSquare, XSquare, Clock, Building2, Layers,
  CalendarDays, GraduationCap
} from "lucide-react";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import SetupGuard from "./components/SetupGuard";
import ThemeToggle from "./components/ThemeToggle";
import AdminProfileMenu from "./components/AdminProfileMenu";
import Toast from "./components/Toast";
import useApi from "./hooks/useApi";
import CampusesPanel from "./components/CampusesPanel";
import SubjectsPanel from "./components/SubjectsPanel";
import SectionsPanel from "./components/SectionsPanel";
import SetupClassStep from "./components/SetupClassStep";
import TimetablePanel from "./components/TimetablePanel";
import TeachersPanel from "./components/TeachersPanel";
import ParentsPanel from "./components/ParentsPanel";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SetupPage from "./pages/SetupPage";
import SetupStepPage from "./pages/SetupStepPage";
import SetupStepGuard from "./components/SetupStepGuard";
import { ENDPOINTS } from "./api/config";
import { BRAND } from "./config/brand";
import "./App.css";

const API = ENDPOINTS.users;

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────
function ConfirmModal({ user, onConfirm, onCancel, loading }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">
            <span className="modal-title-icon"><Trash2 size={15} /></span>
            Delete Student
          </span>
          <button className="modal-close" onClick={onCancel}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7 }}>
            Are you sure you want to delete student{" "}
            <strong style={{ color: "var(--text-primary)" }}>{user?.name}</strong> (ID: {user?.studentId || user?._id.slice(-8)})?
            This action cannot be undone.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <><Loader2 size={14} className="spin-icon" /> Deleting…</> : <><Trash2 size={14} /> Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── User Form Modal ──────────────────────────────────────────────────────────
function UserModal({ mode, user, onClose, onSuccess, api }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    grade: "Grade 9",
    status: "Active",
    gender: "Male",
    phone: "",
    dob: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (mode === "edit" && user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        grade: user.grade || "Grade 9",
        status: user.status || "Active",
        gender: user.gender || "Male",
        phone: user.phone || "",
        dob: user.dob || "",
      });
    } else {
      setForm({
        name: "",
        email: "",
        grade: "Grade 9",
        status: "Active",
        gender: "Male",
        phone: "",
        dob: "",
      });
    }
    setErrors({});
  }, [mode, user]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    if (!form.dob.trim()) e.dob = "Date of birth is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      if (mode === "edit") {
        await api.put(`${API}/${user._id}`, form);
        onSuccess("Student updated successfully", "success");
      } else {
        await api.post(API, form);
        onSuccess("Student added successfully", "success");
      }
      onClose();
    } catch (err) {
      onSuccess(err.response?.data?.message || "Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: "520px" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">
            <span className="modal-title-icon">{mode === "edit" ? <Pencil size={15} /> : <Plus size={15} />}</span>
            {mode === "edit" ? "Edit Student Profile" : "Register New Student"}
          </span>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group" style={{ gridColumn: "span 2" }}>
              <label className="form-label">Full Name</label>
              <div className="input-with-icon">
                <span className="input-icon"><User size={15} /></span>
                <input className="form-input" placeholder="e.g. Jane Doe"
                  value={form.name}
                  onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setErrors((er) => ({ ...er, name: "" })); }} />
              </div>
              {errors.name && <p className="field-error"><AlertCircle size={12} />{errors.name}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-with-icon">
                <span className="input-icon"><Mail size={15} /></span>
                <input className="form-input" placeholder="e.g. jane@school.com"
                  value={form.email}
                  onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); setErrors((er) => ({ ...er, email: "" })); }} />
              </div>
              {errors.email && <p className="field-error"><AlertCircle size={12} />{errors.email}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="input-with-icon">
                <span className="input-icon"><Phone size={15} /></span>
                <input className="form-input" placeholder="e.g. +1 555-0100"
                  value={form.phone}
                  onChange={(e) => { setForm((f) => ({ ...f, phone: e.target.value })); setErrors((er) => ({ ...er, phone: "" })); }} />
              </div>
              {errors.phone && <p className="field-error"><AlertCircle size={12} />{errors.phone}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <div className="input-with-icon">
                <span className="input-icon"><Calendar size={15} /></span>
                <input className="form-input" type="date"
                  value={form.dob}
                  onChange={(e) => { setForm((f) => ({ ...f, dob: e.target.value })); setErrors((er) => ({ ...er, dob: "" })); }} />
              </div>
              {errors.dob && <p className="field-error"><AlertCircle size={12} />{errors.dob}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-input" value={form.gender}
                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Grade / Class</label>
              <select className="form-input" value={form.grade}
                onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}>
                <option value="Grade 9">Grade 9</option>
                <option value="Grade 10">Grade 10</option>
                <option value="Grade 11">Grade 11</option>
                <option value="Grade 12">Grade 12</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Graduated">Graduated</option>
              </select>
            </div>
          </div>
          <div className="modal-footer" style={{ gridColumn: "span 2", marginTop: "10px" }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading
                ? <><Loader2 size={14} className="spin-icon" /> Saving…</>
                : mode === "edit" ? <><CheckCircle2 size={14} /> Save Changes</> : <><Plus size={14} /> Add Student</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getInitials(name = "") {
  return name.trim().split(" ").map((w) => w[0]?.toUpperCase()).slice(0, 2).join("");
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard() {
  const { admin, token, logout } = useAuth();
  const navigate = useNavigate();
  const api = useApi();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterGrade, setFilterGrade] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("date-desc");
  const [toasts, setToasts] = useState([]);
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeDrawerStudent, setActiveDrawerStudent] = useState(null);
  const [setupCounts, setSetupCounts] = useState({ campuses: 0, subjects: 0, classes: 0, sections: 0, timetable: 0 });

  // Layout settings
  const [tab, setTab] = useState("dashboard");
  const [settings, setSettings] = useState({
    schoolName: "St. Jude Academy",
    academicYear: "2025-2026",
    tokenExpiry: "7 Days",
  });

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(API);
      setUsers(res.data);
    } catch {
      showToast("Failed to load students", "error");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  const fetchSetupCounts = useCallback(async () => {
    try {
      const [camp, sub, sec, tt] = await Promise.all([
        api.get(ENDPOINTS.campuses),
        api.get(ENDPOINTS.subjects),
        api.get(ENDPOINTS.sections),
        api.get(ENDPOINTS.timetable),
      ]);
      const allSections = sec.data;
      setSetupCounts({
        campuses: camp.data.length,
        subjects: sub.data.length,
        classes: allSections.filter((s) => s.kind === "class").length,
        sections: allSections.filter((s) => s.kind !== "class").length,
        timetable: tt.data.length,
      });
    } catch { /* silent */ }
  }, []); // eslint-disable-line

  useEffect(() => { fetchUsers(); fetchSetupCounts(); }, []); // eslint-disable-line

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`${API}/${deleteTarget._id}`);
      showToast("Student profile deleted successfully", "success");
      if (activeDrawerStudent?._id === deleteTarget._id) {
        setActiveDrawerStudent(null);
      }
      setDeleteTarget(null);
      fetchUsers();
    } catch {
      showToast("Failed to delete student", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleModalSuccess = (msg, type) => {
    showToast(msg, type);
    fetchUsers();
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  // Calculate Metrics
  const totalStudents = users.length;
  const activeStudents = users.filter((u) => u.status === "Active").length;
  const graduatedStudents = users.filter((u) => u.status === "Graduated").length;
  const suspendedStudents = users.filter((u) => u.status === "Suspended").length;

  // Filter and Sort Logic
  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.studentId?.toLowerCase().includes(search.toLowerCase());
    const matchesGrade = filterGrade === "All" || u.grade === filterGrade;
    const matchesStatus = filterStatus === "All" || u.status === filterStatus;
    return matchesSearch && matchesGrade && matchesStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "name-asc") return a.name.localeCompare(b.name);
    if (sortBy === "name-desc") return b.name.localeCompare(a.name);
    if (sortBy === "date-desc") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === "date-asc") return new Date(a.createdAt) - new Date(b.createdAt);
    return 0;
  });

  const resetFilters = () => {
    setSearch("");
    setFilterGrade("All");
    setFilterStatus("All");
    setSortBy("date-desc");
  };

  // ─── Shared analytics helpers ───────────────────────────────────────────────
  const GRADE_POINTS = { "A+": 4.0, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0, "C-": 1.7, "D": 1.0, "F": 0.0 };
  const SUBJECTS = ["math", "science", "english", "history"];

  const calcGPA = (grades = {}) => {
    const vals = SUBJECTS.map((s) => GRADE_POINTS[grades[s]] ?? 0);
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
  };

  const getGPAColor = (gpa) => {
    if (gpa >= 3.7) return "var(--success)";
    if (gpa >= 3.0) return "var(--accent)";
    if (gpa >= 2.0) return "var(--warning)";
    return "var(--danger)";
  };

  // ─── Sub-views Rendering ────────────────────────────────────────────────────

  const renderDashboardView = () => {
    const recentStudents = [...users]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    const grades = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];
    const gradeDistribution = grades.reduce((acc, g) => {
      acc[g] = users.filter((u) => u.grade === g).length;
      return acc;
    }, {});

    // Attendance analytics
    let attPresent = 0, attAbsent = 0, attLate = 0, attTotal = 0;
    users.forEach((u) => {
      (u.attendance || []).forEach((a) => {
        attTotal++;
        if (a.status === "Present") attPresent++;
        else if (a.status === "Absent") attAbsent++;
        else if (a.status === "Late") attLate++;
      });
    });
    const attendanceRate = attTotal > 0 ? Math.round((attPresent / attTotal) * 100) : 0;

    // Academic analytics
    const gpas = users.map((u) => parseFloat(calcGPA(u.grades || {})));
    const avgGPA = users.length > 0 ? (gpas.reduce((a, b) => a + b, 0) / users.length).toFixed(2) : "0.00";
    const honorRoll = users.filter((u) => parseFloat(calcGPA(u.grades || {})) >= 3.5).length;
    const atRisk = users.filter((u) => parseFloat(calcGPA(u.grades || {})) < 2.0).length;

    // Demographics
    const genderDist = { Male: 0, Female: 0, Other: 0 };
    users.forEach((u) => { if (u.gender in genderDist) genderDist[u.gender]++; });

    const statusDist = [
      { label: "Active", count: activeStudents, color: "var(--success)" },
      { label: "Graduated", count: graduatedStudents, color: "var(--accent)" },
      { label: "Suspended", count: suspendedStudents, color: "var(--danger)" },
    ];

    const infraTotal = setupCounts.campuses + setupCounts.subjects + setupCounts.classes + setupCounts.sections + setupCounts.timetable;

    return (
      <div className="tab-view-content">
        <div className="page-header">
          <h1 className="page-title">School <span>Analytics</span></h1>
          <p className="page-subtitle">Welcome back, {admin?.name || "Admin"}. Overall performance and insights across your school.</p>
        </div>

        {/* Key Metrics */}
        <div className="analytics-summary-banner">
          <div className="analytics-summary-item">
            <span className="analytics-summary-value">{totalStudents}</span>
            <span className="analytics-summary-label">Total Students</span>
          </div>
          <div className="analytics-summary-divider" />
          <div className="analytics-summary-item">
            <span className="analytics-summary-value">{infraTotal}</span>
            <span className="analytics-summary-label">Academic Resources</span>
          </div>
          <div className="analytics-summary-divider" />
          <div className="analytics-summary-item">
            <span className="analytics-summary-value" style={{ color: getGPAColor(parseFloat(avgGPA)) }}>{avgGPA}</span>
            <span className="analytics-summary-label">School Avg GPA</span>
          </div>
          <div className="analytics-summary-divider" />
          <div className="analytics-summary-item">
            <span className="analytics-summary-value" style={{ color: "var(--success)" }}>{attendanceRate}%</span>
            <span className="analytics-summary-label">Attendance Rate</span>
          </div>
          <div className="analytics-summary-divider" />
          <div className="analytics-summary-item">
            <span className="analytics-summary-value" style={{ color: "var(--success)" }}>{honorRoll}</span>
            <span className="analytics-summary-label">Honor Roll</span>
          </div>
        </div>

        {/* Infrastructure Stats */}
        <div className="stats-row stats-row-infra" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "14px", marginBottom: "14px" }}>
          <div className="stat-card stat-card-clickable" onClick={() => setTab("campuses")}>
            <div className="stat-icon purple"><Building2 size={20} /></div>
            <div><div className="stat-value">{setupCounts.campuses}</div><div className="stat-label">Campuses</div></div>
          </div>
          <div className="stat-card stat-card-clickable" onClick={() => setTab("subjects")}>
            <div className="stat-icon indigo"><BookOpen size={20} /></div>
            <div><div className="stat-value">{setupCounts.subjects}</div><div className="stat-label">Subjects</div></div>
          </div>
          <div className="stat-card stat-card-clickable" onClick={() => setTab("classes")}>
            <div className="stat-icon green"><GraduationCap size={20} /></div>
            <div><div className="stat-value">{setupCounts.classes}</div><div className="stat-label">Classes</div></div>
          </div>
          <div className="stat-card stat-card-clickable" onClick={() => setTab("sections")}>
            <div className="stat-icon blue"><Layers size={20} /></div>
            <div><div className="stat-value">{setupCounts.sections}</div><div className="stat-label">Class Sections</div></div>
          </div>
          <div className="stat-card stat-card-clickable" onClick={() => setTab("timetable")}>
            <div className="stat-icon amber"><CalendarDays size={20} /></div>
            <div><div className="stat-value">{setupCounts.timetable}</div><div className="stat-label">Timetable</div></div>
          </div>
        </div>

        {/* Student Stats */}
        <div className="stats-row" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "24px" }}>
          <div className="stat-card stat-card-clickable" onClick={() => setTab("students")}>
            <div className="stat-icon indigo"><Users size={20} /></div>
            <div><div className="stat-value">{totalStudents}</div><div className="stat-label">Enrolled</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><Activity size={20} /></div>
            <div><div className="stat-value">{activeStudents}</div><div className="stat-label">Active</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue"><UserCheck size={20} /></div>
            <div><div className="stat-value">{graduatedStudents}</div><div className="stat-label">Graduates</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red"><UserX size={20} /></div>
            <div><div className="stat-value">{suspendedStudents}</div><div className="stat-label">Suspended</div></div>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="analytics-grid">
          {/* Academic Performance */}
          <div className="card">
            <div className="card-header">
              <span className="card-title"><span className="card-title-icon"><TrendingUp size={15} /></span>Academic Performance</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setTab("academics")}>View</button>
            </div>
            <div className="card-body">
              <div className="analytics-big-metric">
                <span className="analytics-big-value" style={{ color: getGPAColor(parseFloat(avgGPA)) }}>{avgGPA}</span>
                <span className="analytics-big-label">School Average GPA</span>
              </div>
              <div className="analytics-mini-stats">
                <div className="analytics-mini-stat">
                  <span className="analytics-mini-value" style={{ color: "var(--success)" }}>{honorRoll}</span>
                  <span className="analytics-mini-label">Honor Roll (≥3.5)</span>
                </div>
                <div className="analytics-mini-stat">
                  <span className="analytics-mini-value" style={{ color: "var(--danger)" }}>{atRisk}</span>
                  <span className="analytics-mini-label">At Risk (&lt;2.0)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Overview */}
          <div className="card">
            <div className="card-header">
              <span className="card-title"><span className="card-title-icon"><ClipboardList size={15} /></span>Attendance Overview</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setTab("attendance")}>View</button>
            </div>
            <div className="card-body">
              <div className="analytics-big-metric">
                <span className="analytics-big-value" style={{ color: "var(--success)" }}>{attendanceRate}%</span>
                <span className="analytics-big-label">Overall Attendance Rate</span>
              </div>
              <div className="analytics-bar-list">
                {[
                  { label: "Present", count: attPresent, color: "var(--success)" },
                  { label: "Absent", count: attAbsent, color: "var(--danger)" },
                  { label: "Late", count: attLate, color: "var(--warning)" },
                ].map((item) => (
                  <div key={item.label} className="analytics-bar-row">
                    <span className="analytics-bar-label">{item.label}</span>
                    <div className="analytics-bar-track">
                      <div className="analytics-bar-fill" style={{ width: `${attTotal > 0 ? (item.count / attTotal) * 100 : 0}%`, background: item.color }} />
                    </div>
                    <span className="analytics-bar-count">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Student Status */}
          <div className="card">
            <div className="card-header">
              <span className="card-title"><span className="card-title-icon"><Users size={15} /></span>Student Status</span>
            </div>
            <div className="card-body">
              {statusDist.map((s) => {
                const pct = totalStudents > 0 ? (s.count / totalStudents) * 100 : 0;
                return (
                  <div key={s.label} className="analytics-bar-row" style={{ marginBottom: 14 }}>
                    <span className="analytics-bar-label">{s.label}</span>
                    <div className="analytics-bar-track">
                      <div className="analytics-bar-fill" style={{ width: `${pct}%`, background: s.color }} />
                    </div>
                    <span className="analytics-bar-count">{s.count}</span>
                  </div>
                );
              })}
              <div className="analytics-mini-stats" style={{ marginTop: 8 }}>
                {Object.entries(genderDist).map(([g, count]) => (
                  <div key={g} className="analytics-mini-stat">
                    <span className="analytics-mini-value">{count}</span>
                    <span className="analytics-mini-label">{g}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enrollment by Grade */}
          <div className="card">
            <div className="card-header">
              <span className="card-title"><span className="card-title-icon"><Award size={15} /></span>Enrollment by Grade</span>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {grades.map((grade) => {
                const count = gradeDistribution[grade] || 0;
                const percent = totalStudents > 0 ? (count / totalStudents) * 100 : 0;
                return (
                  <div key={grade}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 500, marginBottom: 6 }}>
                      <span>{grade}</span>
                      <span style={{ color: "var(--text-muted)" }}>{count} ({Math.round(percent)}%)</span>
                    </div>
                    <div className="analytics-bar-track" style={{ height: 8 }}>
                      <div className="analytics-bar-fill" style={{ width: `${percent}%`, background: "var(--accent)", height: "100%", borderRadius: 99 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="content-grid" style={{ gridTemplateColumns: "1fr", gap: "20px", marginTop: 20 }}>
          {/* Recent Registrations */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <span className="card-title-icon"><Activity size={15} /></span>
                Recent Registrations
              </span>
              {users.length > 0 && (
                <button className="btn btn-ghost btn-sm" onClick={() => setTab("students")}>View All</button>
              )}
            </div>
            <div className="card-body">
              {recentStudents.length === 0 ? (
                <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
                  No recent student enrollments.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {recentStudents.map((st) => (
                    <div key={st._id} className="student-row-item" onClick={() => { setActiveDrawerStudent(st); setTab("students"); }} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", cursor: "pointer", transition: "var(--transition)" }}>
                      <div className="avatar" style={{ width: "32px", height: "32px", fontSize: "11px" }}>{getInitials(st.name)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: "13.5px" }}>{st.name}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{st.email}</div>
                      </div>
                      <span className="badge badge-indigo">{st.grade || "N/A"}</span>
                      <span className={`status-pill ${(st.status || "Active").toLowerCase()}`} style={{ fontSize: "10px", padding: "2px 6px" }}>
                        <span className="pill-dot"></span>
                        {st.status || "Active"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  };

  const renderStudentsView = () => {
    return (
      <div className="tab-view-content">
        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="page-title">Students <span>Directory</span></h1>
            <p className="page-subtitle">View list of all enrolled students, search, edit details, or remove profiles.</p>
          </div>
        </div>

        {/* Student list table */}
        <div className="card">
          {/* Filter controls */}
          <div className="table-filters" style={{ padding: "16px 20px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", borderBottom: "1px solid var(--border)", background: "var(--bg-primary)" }}>
            <div className="input-with-icon" style={{ flex: 1, minWidth: "180px" }}>
              <span className="input-icon"><Search size={15} /></span>
              <input id="search-input" className="form-input" placeholder="Search by name, email or ID…"
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <select className="form-input" style={{ width: "auto", minWidth: "110px" }} value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}>
              <option value="All">All Grades</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>

            <select className="form-input" style={{ width: "auto", minWidth: "120px" }} value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Graduated">Graduated</option>
            </select>

            <select className="form-input" style={{ width: "auto", minWidth: "130px" }} value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}>
              <option value="date-desc">Newest Added</option>
              <option value="date-asc">Oldest Added</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
            </select>

            {(search || filterGrade !== "All" || filterStatus !== "All") && (
              <button className="btn btn-ghost btn-sm" onClick={resetFilters} title="Reset Filters" style={{ display: "flex", alignItems: "center", padding: "8px 10px" }}>
                <Filter size={13} /> Clear
              </button>
            )}

            <button id="add-user-btn" className="btn btn-primary btn-sm" onClick={() => setModal("add")} style={{ display: "flex", alignItems: "center" }}>
              <Plus size={14} /> Add
            </button>
          </div>

          <div className="table-wrapper">
            {loading ? (
              <div className="loading-container"><div className="loading-spinner-lg" /><span>Loading student records…</span></div>
            ) : sorted.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><Users size={24} /></div>
                <div className="empty-title">{search || filterGrade !== "All" || filterStatus !== "All" ? "No results found" : "No student records"}</div>
                <div className="empty-desc">
                  {search || filterGrade !== "All" || filterStatus !== "All"
                    ? "Try clearing filters to see more results"
                    : "Use the Quick Register form or click Add to register students"}
                </div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Student</th>
                    <th>Grade</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((user) => (
                    <tr key={user._id} className="student-row" onClick={() => setActiveDrawerStudent(user)} style={{ cursor: "pointer" }}>
                      <td>
                        <span className="row-num" style={{ fontStyle: "normal", fontSize: "11px", padding: "2px 6px", width: "auto", height: "auto" }}>
                          {user.studentId || "PENDING"}
                        </span>
                      </td>
                      <td>
                        <div className="user-cell">
                          <div className="avatar">{getInitials(user.name)}</div>
                          <div>
                            <div className="user-name">{user.name}</div>
                            <div className="user-id">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-indigo">{user.grade || "N/A"}</span>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontSize: "12.5px" }}>{user.phone || "N/A"}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-pill ${(user.status || "Active").toLowerCase()}`}>
                          <span className="pill-dot"></span>
                          {user.status || "Active"}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="actions-cell">
                          <button className="btn-icon edit" title="Edit Profile" onClick={() => { setEditTarget(user); setModal("edit"); }}>
                            <Pencil size={15} />
                          </button>
                          <button className="btn-icon delete" title="Delete Profile" onClick={() => setDeleteTarget(user)}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ─── Academics View ─────────────────────────────────────────────────────────
  const GRADE_OPTS = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];
  const SUBJECT_LABELS = { math: "Mathematics", science: "Science", english: "English", history: "History" };
  const SUBJECT_COLORS = { math: "#6366f1", science: "#10b981", english: "#f59e0b", history: "#8b5cf6" };

  const [academicsSelected, setAcademicsSelected] = useState(null);
  const [academicsEditing, setAcademicsEditing] = useState(false);
  const [academicsForm, setAcademicsForm] = useState({});
  const [academicsSaving, setAcademicsSaving] = useState(false);

  const renderAcademicsView = () => {
    const student = academicsSelected
      ? users.find(u => u._id === academicsSelected)
      : null;
    const gpa = student ? parseFloat(calcGPA(student.grades)) : null;

    // Class GPA average
    const classGPAs = users.map(u => parseFloat(calcGPA(u.grades || {})));
    const avgGPA = classGPAs.length ? (classGPAs.reduce((a, b) => a + b, 0) / classGPAs.length).toFixed(2) : "0.00";
    const topStudents = [...users].sort((a, b) => parseFloat(calcGPA(b.grades || {})) - parseFloat(calcGPA(a.grades || {}))).slice(0, 3);

    const handleSaveGrades = async () => {
      if (!student) return;
      setAcademicsSaving(true);
      try {
        await api.put(`${API}/${student._id}`, { ...student, grades: academicsForm });
        showToast("Grade report updated!", "success");
        await fetchUsers();
        setAcademicsEditing(false);
      } catch {
        showToast("Failed to save grades", "error");
      } finally {
        setAcademicsSaving(false);
      }
    };

    return (
      <div className="tab-view-content">
        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="page-title">Academics <span>& Report Cards</span></h1>
            <p className="page-subtitle">Review and edit subject grades, calculate GPA, and view class performance rankings.</p>
          </div>
        </div>

        {/* Summary Stat Cards */}
        <div className="stats-row" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: "24px" }}>
          <div className="stat-card">
            <div className="stat-icon indigo"><BarChart2 size={20} /></div>
            <div><div className="stat-value">{avgGPA}</div><div className="stat-label">Class Avg GPA</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><TrendingUp size={20} /></div>
            <div><div className="stat-value">{users.filter(u => parseFloat(calcGPA(u.grades || {})) >= 3.7).length}</div><div className="stat-label">Honor Roll (≥3.7)</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red"><AlertCircle size={20} /></div>
            <div><div className="stat-value">{users.filter(u => parseFloat(calcGPA(u.grades || {})) < 2.0).length}</div><div className="stat-label">At Risk (&lt;2.0 GPA)</div></div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "20px", alignItems: "start" }}>
          {/* Left – student roster */}
          <div className="card">
            <div className="card-header"><span className="card-title"><span className="card-title-icon"><Users size={15} /></span>Students</span></div>
            <div style={{ maxHeight: "460px", overflowY: "auto" }}>
              {users.length === 0 ? (
                <div className="empty-state"><div className="empty-desc">No students found.</div></div>
              ) : users.map(u => {
                const sg = parseFloat(calcGPA(u.grades || {}));
                return (
                  <div key={u._id}
                    className="academics-roster-item"
                    style={{ background: academicsSelected === u._id ? "rgba(99,102,241,0.06)" : "transparent" }}
                    onClick={() => { setAcademicsSelected(u._id); setAcademicsEditing(false); setAcademicsForm(u.grades || {}); }}>
                    <div className="avatar" style={{ width: "32px", height: "32px", fontSize: "11px", flexShrink: 0 }}>{getInitials(u.name)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{u.grade || "N/A"}</div>
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: getGPAColor(sg), flexShrink: 0 }}>{sg.toFixed(2)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right – report card */}
          {!student ? (
            <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "340px" }}>
              <div className="empty-state">
                <div className="empty-icon"><BookOpen size={24} /></div>
                <div className="empty-title">Select a Student</div>
                <div className="empty-desc">Click a student on the left to view their report card.</div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-header" style={{ justifyContent: "space-between" }}>
                <span className="card-title"><span className="card-title-icon"><BookOpen size={15} /></span>{student.name}'s Report Card</span>
                {!academicsEditing ? (
                  <button className="btn btn-ghost btn-sm" onClick={() => { setAcademicsEditing(true); setAcademicsForm({ ...student.grades }); }}>
                    <Pencil size={13} /> Edit Grades
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setAcademicsEditing(false)} disabled={academicsSaving}>Cancel</button>
                    <button className="btn btn-primary btn-sm" onClick={handleSaveGrades} disabled={academicsSaving}>
                      {academicsSaving ? <Loader2 size={13} className="spin-icon" /> : <CheckCircle2 size={13} />} Save
                    </button>
                  </div>
                )}
              </div>
              <div className="card-body">
                {/* GPA ring */}
                <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "28px", padding: "16px 20px", background: "var(--bg-primary)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
                  <div className="gpa-ring" style={{ "--gpa-pct": `${(gpa / 4) * 100}%`, "--gpa-color": getGPAColor(gpa) }}>
                    <span className="gpa-ring-val">{gpa.toFixed(2)}</span>
                    <span className="gpa-ring-lbl">GPA</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "16px", color: getGPAColor(gpa), marginBottom: "4px" }}>
                      {gpa >= 3.7 ? "Dean's List" : gpa >= 3.0 ? "Good Standing" : gpa >= 2.0 ? "Satisfactory" : "Academic Probation"}
                    </div>
                    <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "8px" }}>{student.grade} · {student.status}</div>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      <span className={`status-pill ${(student.status || "Active").toLowerCase()}`} style={{ fontSize: "11px", padding: "3px 8px" }}><span className="pill-dot" />{student.status || "Active"}</span>
                      <span className="badge badge-indigo" style={{ fontSize: "11px" }}>{student.grade}</span>
                    </div>
                  </div>
                </div>

                {/* Subject grades */}
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {SUBJECTS.map(sub => {
                    const gradeKey = academicsEditing ? (academicsForm[sub] || "A") : (student.grades?.[sub] || "A");
                    const pts = GRADE_POINTS[gradeKey] ?? 0;
                    const pct = (pts / 4) * 100;
                    return (
                      <div key={sub} className="subject-row">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: SUBJECT_COLORS[sub], flexShrink: 0 }} />
                            <span style={{ fontSize: "13px", fontWeight: 600 }}>{SUBJECT_LABELS[sub]}</span>
                          </div>
                          {academicsEditing ? (
                            <select className="form-input" style={{ width: "80px", padding: "4px 8px", fontSize: "13px", height: "auto" }}
                              value={academicsForm[sub] || "A"}
                              onChange={e => setAcademicsForm(f => ({ ...f, [sub]: e.target.value }))}>
                              {GRADE_OPTS.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                          ) : (
                            <span style={{ fontWeight: 700, fontSize: "14px", color: SUBJECT_COLORS[sub] }}>{gradeKey}</span>
                          )}
                        </div>
                        <div style={{ height: "6px", background: "var(--border)", borderRadius: "99px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: SUBJECT_COLORS[sub], borderRadius: "99px", transition: "width 0.4s ease" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Class leaderboard */}
        <div className="card" style={{ marginTop: "20px" }}>
          <div className="card-header"><span className="card-title"><span className="card-title-icon"><Award size={15} /></span>Top Performers</span></div>
          <div className="card-body" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {topStudents.map((u, i) => {
              const sg = parseFloat(calcGPA(u.grades || {}));
              return (
                <div key={u._id} className="top-performer-card" onClick={() => { setAcademicsSelected(u._id); setAcademicsEditing(false); setAcademicsForm(u.grades || {}); }}>
                  <div className="top-rank" style={{ background: i === 0 ? "#fbbf24" : i === 1 ? "#94a3b8" : "#cd7c3c" }}>#{i + 1}</div>
                  <div className="avatar" style={{ width: "44px", height: "44px", fontSize: "14px", margin: "0 auto 8px" }}>{getInitials(u.name)}</div>
                  <div style={{ fontWeight: 700, fontSize: "13px", textAlign: "center", marginBottom: "4px" }}>{u.name}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center", marginBottom: "8px" }}>{u.grade}</div>
                  <div style={{ fontWeight: 800, fontSize: "18px", color: getGPAColor(sg), textAlign: "center" }}>{sg.toFixed(2)}</div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", textAlign: "center" }}>GPA</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ─── Attendance View ─────────────────────────────────────────────────────────
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendanceSelected, setAttendanceSelected] = useState(null);
  const [attendanceSaving, setAttendanceSaving] = useState(false);
  const [rollCall, setRollCall] = useState({});

  // Build rollcall from current students for a given date
  const buildRollCall = (date, studentList) => {
    const init = {};
    studentList.forEach(u => {
      const entry = (u.attendance || []).find(a => a.date === date);
      init[u._id] = entry?.status || "Present";
    });
    return init;
  };

  useEffect(() => {
    if (users.length > 0) {
      setRollCall(buildRollCall(attendanceDate, users));
    }
  }, [attendanceDate, users]); // eslint-disable-line

  const handleSaveAttendance = async () => {
    setAttendanceSaving(true);
    try {
      for (const u of users) {
        const existingAttendance = (u.attendance || []).filter(a => a.date !== attendanceDate);
        const updated = [...existingAttendance, { date: attendanceDate, status: rollCall[u._id] || "Present" }];
        await api.put(`${API}/${u._id}`, { ...u, attendance: updated });
      }
      showToast("Attendance saved for " + attendanceDate, "success");
      await fetchUsers();
    } catch {
      showToast("Failed to save attendance", "error");
    } finally {
      setAttendanceSaving(false);
    }
  };

  const renderAttendanceView = () => {
    const presentCount = Object.values(rollCall).filter(s => s === "Present").length;
    const absentCount = Object.values(rollCall).filter(s => s === "Absent").length;
    const lateCount = Object.values(rollCall).filter(s => s === "Late").length;
    const attendanceRate = users.length > 0 ? Math.round((presentCount / users.length) * 100) : 0;

    const selectedStudent = attendanceSelected ? users.find(u => u._id === attendanceSelected) : null;
    const studentLog = selectedStudent ? (selectedStudent.attendance || []).sort((a, b) => new Date(b.date) - new Date(a.date)) : [];

    return (
      <div className="tab-view-content">
        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="page-title">Attendance <span>Tracker</span></h1>
            <p className="page-subtitle">Mark daily attendance, view per-student logs, and monitor class attendance rates.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="input-with-icon" style={{ width: "auto" }}>
              <span className="input-icon"><Calendar size={15} /></span>
              <input type="date" className="form-input" style={{ paddingLeft: "38px", width: "170px" }}
                value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={handleSaveAttendance} disabled={attendanceSaving || users.length === 0}>
              {attendanceSaving ? <><Loader2 size={14} className="spin-icon" /> Saving…</> : <><CheckCircle2 size={14} /> Save Attendance</>}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-row" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: "24px" }}>
          <div className="stat-card">
            <div className="stat-icon indigo"><ClipboardList size={20} /></div>
            <div><div className="stat-value">{users.length}</div><div className="stat-label">Total Students</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><CheckSquare size={20} /></div>
            <div><div className="stat-value">{presentCount}</div><div className="stat-label">Present Today</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red"><XSquare size={20} /></div>
            <div><div className="stat-value">{absentCount}</div><div className="stat-label">Absent Today</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple"><Clock size={20} /></div>
            <div><div className="stat-value">{lateCount}</div><div className="stat-label">Late Today</div></div>
          </div>
        </div>

        {/* Attendance Rate Bar */}
        <div className="card" style={{ marginBottom: "20px" }}>
          <div className="card-body" style={{ padding: "16px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px", fontWeight: 600 }}>
              <span>Daily Attendance Rate</span>
              <span style={{ color: attendanceRate >= 80 ? "var(--success)" : attendanceRate >= 60 ? "#f59e0b" : "var(--danger)", fontWeight: 700 }}>{attendanceRate}%</span>
            </div>
            <div style={{ height: "10px", background: "var(--border)", borderRadius: "99px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${attendanceRate}%`, background: attendanceRate >= 80 ? "var(--success)" : attendanceRate >= 60 ? "#f59e0b" : "var(--danger)", borderRadius: "99px", transition: "width 0.4s ease" }} />
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "20px", alignItems: "start" }}>
          {/* Roll-call grid */}
          <div className="card">
            <div className="card-header"><span className="card-title"><span className="card-title-icon"><ClipboardList size={15} /></span>Roll Call — {new Date(attendanceDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span></div>
            {users.length === 0 ? (
              <div className="empty-state"><div className="empty-icon"><Users size={24} /></div><div className="empty-title">No Students</div><div className="empty-desc">Add students to mark attendance.</div></div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Student</th><th>Grade</th><th style={{ textAlign: "center" }}>Status</th></tr></thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} className="student-row" onClick={() => setAttendanceSelected(u._id === attendanceSelected ? null : u._id)} style={{ cursor: "pointer", background: attendanceSelected === u._id ? "rgba(99,102,241,0.04)" : undefined }}>
                        <td>
                          <div className="user-cell">
                            <div className="avatar" style={{ width: "32px", height: "32px", fontSize: "11px" }}>{getInitials(u.name)}</div>
                            <div><div className="user-name">{u.name}</div><div className="user-id">{u.email}</div></div>
                          </div>
                        </td>
                        <td><span className="badge badge-indigo">{u.grade || "N/A"}</span></td>
                        <td onClick={e => e.stopPropagation()}>
                          <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                            {["Present", "Absent", "Late"].map(s => (
                              <button key={s}
                                className={`att-btn att-${s.toLowerCase()} ${rollCall[u._id] === s ? "att-active" : ""}`}
                                onClick={() => setRollCall(r => ({ ...r, [u._id]: s }))}>
                                {s}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Per-student log */}
          <div className="card">
            <div className="card-header"><span className="card-title"><span className="card-title-icon"><Activity size={15} /></span>{selectedStudent ? `${selectedStudent.name}'s Log` : "Attendance Log"}</span></div>
            {!selectedStudent ? (
              <div className="empty-state" style={{ padding: "40px 20px" }}>
                <div className="empty-icon"><User size={22} /></div>
                <div className="empty-title">Select a student</div>
                <div className="empty-desc">Click any row on the left to view their attendance history.</div>
              </div>
            ) : (
              <div style={{ maxHeight: "460px", overflowY: "auto" }}>
                {studentLog.length === 0 ? (
                  <div className="empty-state" style={{ padding: "32px 20px" }}><div className="empty-desc">No attendance records yet.</div></div>
                ) : studentLog.map((entry, i) => (
                  <div key={i} className="att-log-row">
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{new Date(entry.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                    <span className={`att-status-badge att-badge-${entry.status.toLowerCase()}`}>
                      {entry.status === "Present" && <CheckSquare size={12} />}
                      {entry.status === "Absent" && <XSquare size={12} />}
                      {entry.status === "Late" && <Clock size={12} />}
                      {entry.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {selectedStudent && (
              <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", fontSize: "12px", color: "var(--text-muted)" }}>
                {studentLog.filter(e => e.status === "Present").length} Present · {studentLog.filter(e => e.status === "Absent").length} Absent · {studentLog.filter(e => e.status === "Late").length} Late
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSettingsView = () => {
    return (
      <div className="tab-view-content animate-fade-in">
        <div className="page-header">
          <h1 className="page-title">System <span>Settings</span></h1>
          <p className="page-subtitle">Configure regional parameters, institution details, and authentication security.</p>
        </div>

        <div className="content-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* Institution settings */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <span className="card-title-icon"><School size={15} /></span>
                Institution Profile
              </span>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Institution Name</label>
                <input className="form-input" value={settings.schoolName}
                  onChange={(e) => setSettings((s) => ({ ...s, schoolName: e.target.value }))} />
                <span style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                  This updates the institution name in headers and tab displays.
                </span>
              </div>
              <div className="form-group">
                <label className="form-label">Academic Year</label>
                <select className="form-input" value={settings.academicYear}
                  onChange={(e) => setSettings((s) => ({ ...s, academicYear: e.target.value }))}>
                  <option value="2025-2026">2025-2026</option>
                  <option value="2026-2027">2026-2027</option>
                  <option value="2027-2028">2027-2028</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security details */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <span className="card-title-icon"><Shield size={15} /></span>
                Security Configuration
              </span>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Session Token Expiration</label>
                <select className="form-input" value={settings.tokenExpiry}
                  onChange={(e) => setSettings((s) => ({ ...s, tokenExpiry: e.target.value }))}>
                  <option value="24 Hours">24 Hours</option>
                  <option value="7 Days">7 Days (Recommended)</option>
                  <option value="30 Days">30 Days</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Database Connection</label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-primary)", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", fontSize: "13px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--success)" }} />
                  <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Connected to MongoDB Atlas</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn-primary" onClick={() => showToast("Branding settings saved successfully!", "success")}>
            Save Changes
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="app-layout">
      {/* Sidebar Panel */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo"><School size={22} /></div>
          <div className="sidebar-brand-text">
            <div className="sidebar-logo-text sidebar-logo-full">{BRAND.fullName}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">OVERVIEW</div>
          <button className={`nav-item ${tab === "dashboard" ? "active" : ""}`} onClick={() => setTab("dashboard")}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <div className="nav-section-label">ACADEMIC SETUP</div>
          <button className={`nav-item ${tab === "campuses" ? "active" : ""}`} onClick={() => setTab("campuses")}>
            <Building2 size={18} />
            <span>Campuses</span>
          </button>
          <button className={`nav-item ${tab === "subjects" ? "active" : ""}`} onClick={() => setTab("subjects")}>
            <BookOpen size={18} />
            <span>Subjects</span>
          </button>
          <button className={`nav-item ${tab === "classes" ? "active" : ""}`} onClick={() => setTab("classes")}>
            <GraduationCap size={18} />
            <span>Classes</span>
          </button>
          <button className={`nav-item ${tab === "sections" ? "active" : ""}`} onClick={() => setTab("sections")}>
            <Layers size={18} />
            <span>Class Sections</span>
          </button>
          <button className={`nav-item ${tab === "timetable" ? "active" : ""}`} onClick={() => setTab("timetable")}>
            <CalendarDays size={18} />
            <span>Timetable</span>
          </button>

          <div className="nav-section-label">MANAGEMENT</div>
          <button className={`nav-item ${tab === "teachers" ? "active" : ""}`} onClick={() => setTab("teachers")}>
            <Users size={18} />
            <span>Teachers</span>
          </button>
          <button className={`nav-item ${tab === "parents" ? "active" : ""}`} onClick={() => setTab("parents")}>
            <Users size={18} />
            <span>Parents</span>
          </button>
          <button className={`nav-item ${tab === "students" ? "active" : ""}`} onClick={() => setTab("students")}>
            <Users size={18} />
            <span>Students</span>
          </button>
          <button className={`nav-item ${tab === "academics" ? "active" : ""}`} onClick={() => setTab("academics")}>
            <BarChart2 size={18} />
            <span>Academics</span>
          </button>
          <button className={`nav-item ${tab === "attendance" ? "active" : ""}`} onClick={() => setTab("attendance")}>
            <ClipboardList size={18} />
            <span>Attendance</span>
          </button>

          <div className="nav-section-label">SYSTEM</div>
          <button className={`nav-item ${tab === "settings" ? "active" : ""}`} onClick={() => setTab("settings")}>
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-profile">
            <div className="admin-avatar">{getInitials(admin?.name || "A")}</div>
            <div className="admin-details">
              <span className="admin-name">{admin?.name}</span>
              <span className="admin-role">System Admin</span>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm logout-btn sidebar-logout" onClick={handleLogout} style={{ width: "100%", marginTop: "10px", display: "flex", justifyContent: "center" }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="main-workspace">
        <header className="workspace-header">
          <div className="header-actions">
            <ThemeToggle />
            <AdminProfileMenu
              admin={admin}
              token={token}
              onLogout={handleLogout}
              onSettings={() => setTab("settings")}
            />
          </div>
        </header>

        <main className="workspace-body">
          {tab === "dashboard" && renderDashboardView()}
          {tab === "campuses" && <CampusesPanel api={api} showToast={showToast} />}
          {tab === "subjects" && <SubjectsPanel api={api} showToast={showToast} />}
          {tab === "classes" && <SetupClassStep api={api} showToast={showToast} />}
          {tab === "sections" && <SectionsPanel api={api} showToast={showToast} />}
          {tab === "timetable" && <TimetablePanel api={api} showToast={showToast} />}
          {tab === "teachers" && <TeachersPanel />}
          {tab === "parents" && <ParentsPanel />}
          {tab === "students" && renderStudentsView()}
          {tab === "academics" && renderAcademicsView()}
          {tab === "attendance" && renderAttendanceView()}
          {tab === "settings" && renderSettingsView()}
        </main>
      </div>

      {/* Slide-out details drawer */}
      {activeDrawerStudent && (
        <div className="drawer-overlay" onClick={() => setActiveDrawerStudent(null)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <span className="drawer-title">Student Details</span>
              <button className="drawer-close" onClick={() => setActiveDrawerStudent(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="drawer-body">
              <div className="drawer-avatar-section">
                <div className="drawer-big-avatar">{getInitials(activeDrawerStudent.name)}</div>
                <h2>{activeDrawerStudent.name}</h2>
                <div className="drawer-id-badge">{activeDrawerStudent.studentId || "Pending Code"}</div>
                <span className={`status-pill ${(activeDrawerStudent.status || "Active").toLowerCase()}`} style={{ marginTop: "12px", fontSize: "13px", padding: "6px 14px" }}>
                  <span className="pill-dot"></span>
                  {activeDrawerStudent.status || "Active"}
                </span>
              </div>

              <div className="drawer-divider" />

              <div className="drawer-details-grid">
                <div className="detail-item">
                  <div className="detail-label"><Mail size={13} /> Email Address</div>
                  <div className="detail-value">{activeDrawerStudent.email}</div>
                </div>

                <div className="detail-item">
                  <div className="detail-label"><Phone size={13} /> Contact Number</div>
                  <div className="detail-value">{activeDrawerStudent.phone}</div>
                </div>

                <div className="detail-item">
                  <div className="detail-label"><Calendar size={13} /> Date of Birth</div>
                  <div className="detail-value">
                    {activeDrawerStudent.dob ? new Date(activeDrawerStudent.dob).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : "N/A"}
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-label"><User size={13} /> Gender</div>
                  <div className="detail-value">{activeDrawerStudent.gender}</div>
                </div>

                <div className="detail-item">
                  <div className="detail-label"><Award size={13} /> Grade / Class</div>
                  <div className="detail-value">{activeDrawerStudent.grade}</div>
                </div>

                <div className="detail-item">
                  <div className="detail-label"><Activity size={13} /> Enrollment Date</div>
                  <div className="detail-value">
                    {activeDrawerStudent.createdAt ? new Date(activeDrawerStudent.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) : "N/A"}
                  </div>
                </div>
              </div>

              <div className="drawer-footer" style={{ marginTop: "24px", display: "flex", gap: "8px" }}>
                <button className="btn btn-ghost btn-full" onClick={() => { setEditTarget(activeDrawerStudent); setModal("edit"); }}>
                  <Pencil size={14} /> Edit Student Info
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {(modal === "add" || modal === "edit") && (
        <UserModal mode={modal} user={editTarget} api={api}
          onClose={() => { setModal(null); setEditTarget(null); }}
          onSuccess={handleModalSuccess} />
      )}

      {deleteTarget && (
        <ConfirmModal user={deleteTarget} loading={deleteLoading}
          onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      )}

      <Toast toasts={toasts} />
    </div>
  );
}



// ─── Root with Routes ─────────────────────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/setup/:stepKey" element={
        <ProtectedRoute>
          <SetupStepGuard><SetupStepPage /></SetupStepGuard>
        </ProtectedRoute>
      } />
      <Route path="/setup" element={
        <ProtectedRoute><SetupPage /></ProtectedRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute><SetupGuard><Dashboard /></SetupGuard></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}