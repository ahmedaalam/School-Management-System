import { useCallback, useEffect, useState } from "react";
import { Users, Plus, User, Mail, Phone, Calendar, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { ENDPOINTS } from "../api/config";

const EMPTY = { name: "", email: "", grade: "Grade 9", status: "Active", gender: "Male", phone: "", dob: "" };

export default function SetupStudentsStep({ api, showToast, onDataChange, embedded }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const fetchStudents = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get(ENDPOINTS.users);
      setStudents(res.data);
    } catch {
      showToast("Failed to load students", "error");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [api, showToast]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (!form.dob.trim()) e.dob = "Date of birth is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await api.post(ENDPOINTS.users, form);
      showToast("Student enrolled successfully", "success");
      setForm(EMPTY);
      setErrors({});
      await fetchStudents(true);
      onDataChange?.();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add student", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={embedded ? "" : "tab-view-content"}>
      {!embedded && (
        <div className="page-header">
          <h1 className="page-title">Students <span>Enrollment</span></h1>
          <p className="page-subtitle">Register at least one student to continue setup.</p>
        </div>
      )}

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span className="card-title"><span className="card-title-icon"><Plus size={15} /></span>Register Student</span>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group" style={{ gridColumn: "span 2" }}>
              <label className="form-label">Full Name</label>
              <div className="input-with-icon">
                <span className="input-icon"><User size={15} /></span>
                <input className="form-input" placeholder="e.g. Jane Doe" value={form.name}
                  onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setErrors((er) => ({ ...er, name: "" })); }} />
              </div>
              {errors.name && <p className="field-error"><AlertCircle size={12} />{errors.name}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-with-icon">
                <span className="input-icon"><Mail size={15} /></span>
                <input className="form-input" placeholder="jane@school.com" value={form.email}
                  onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); setErrors((er) => ({ ...er, email: "" })); }} />
              </div>
              {errors.email && <p className="field-error"><AlertCircle size={12} />{errors.email}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <div className="input-with-icon">
                <span className="input-icon"><Phone size={15} /></span>
                <input className="form-input" placeholder="+1 555-0100" value={form.phone}
                  onChange={(e) => { setForm((f) => ({ ...f, phone: e.target.value })); setErrors((er) => ({ ...er, phone: "" })); }} />
              </div>
              {errors.phone && <p className="field-error"><AlertCircle size={12} />{errors.phone}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <div className="input-with-icon">
                <span className="input-icon"><Calendar size={15} /></span>
                <input className="form-input" type="date" value={form.dob}
                  onChange={(e) => { setForm((f) => ({ ...f, dob: e.target.value })); setErrors((er) => ({ ...er, dob: "" })); }} />
              </div>
              {errors.dob && <p className="field-error"><AlertCircle size={12} />{errors.dob}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-input" value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Grade</label>
              <select className="form-input" value={form.grade} onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}>
                {["Grade 9", "Grade 10", "Grade 11", "Grade 12"].map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <><Loader2 size={14} className="spin-icon" /> Enrolling…</> : <><Plus size={14} /> Enroll Student</>}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title"><span className="card-title-icon"><Users size={15} /></span>Enrolled Students ({students.length})</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="empty-state"><Loader2 size={24} className="spin-icon" /> Loading…</div>
          ) : students.length === 0 ? (
            <div className="empty-state"><p>No students enrolled yet. Add at least one to continue.</p></div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Name</th><th>Email</th><th>Grade</th><th>Status</th></tr></thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td>{s.email}</td>
                    <td><span className="badge badge-indigo">{s.grade}</span></td>
                    <td><span className={`status-pill ${(s.status || "Active").toLowerCase()}`}><span className="pill-dot" />{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
