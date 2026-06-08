import { useCallback, useEffect, useState } from "react";
import { GraduationCap, Plus, Loader2, AlertCircle } from "lucide-react";
import { ENDPOINTS } from "../api/config";

const GRADES = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];

export default function SetupClassStep({ api, showToast, onDataChange, embedded }) {
  const [classes, setClasses] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ grade: "Grade 9", campus: "", capacity: 40, room: "" });

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [secRes, campRes] = await Promise.all([
        api.get(ENDPOINTS.sections),
        api.get(ENDPOINTS.campuses),
      ]);
      setClasses(secRes.data.filter((s) => s.kind === "class"));
      setCampuses(campRes.data);
      if (!form.campus && campRes.data[0]) {
        setForm((f) => ({ ...f, campus: campRes.data[0]._id }));
      }
    } catch {
      showToast("Failed to load classes", "error");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [api, showToast]); // eslint-disable-line

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.campus) {
      showToast("Please select a campus", "error");
      return;
    }
    const exists = classes.some((c) => c.grade === form.grade && (c.campus?._id || c.campus) === form.campus);
    if (exists) {
      showToast("This class already exists for the selected campus", "error");
      return;
    }
    setSaving(true);
    try {
      await api.post(ENDPOINTS.sections, {
        name: form.grade,
        grade: form.grade,
        campus: form.campus,
        capacity: form.capacity,
        room: form.room,
        kind: "class",
      });
      showToast("Class added successfully", "success");
      setForm((f) => ({ ...f, room: "" }));
      await fetchData(true);
      onDataChange?.();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add class", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={embedded ? "" : "tab-view-content"}>
      {!embedded && (
        <div className="page-header">
          <h1 className="page-title">Classes <span>Management</span></h1>
          <p className="page-subtitle">Create grade-level classes (e.g. Class 9, Class 10) per campus.</p>
        </div>
      )}

      {campuses.length === 0 && !loading && (
        <div className="setup-alert">
          <AlertCircle size={16} />
          Add at least one campus before creating classes.
        </div>
      )}

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span className="card-title">
            <span className="card-title-icon"><Plus size={15} /></span>
            Add Class
          </span>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Grade / Class</label>
              <select className="form-input" value={form.grade}
                onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}>
                {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Campus</label>
              <select className="form-input" value={form.campus}
                onChange={(e) => setForm((f) => ({ ...f, campus: e.target.value }))}>
                <option value="">Select campus</option>
                {campuses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Room (optional)</label>
              <input className="form-input" value={form.room} placeholder="e.g. Block A"
                onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Capacity</label>
              <input type="number" min={1} className="form-input" value={form.capacity}
                onChange={(e) => setForm((f) => ({ ...f, capacity: Number(e.target.value) }))} />
            </div>
            <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="btn btn-primary" disabled={saving || campuses.length === 0}>
                {saving ? <><Loader2 size={14} className="spin-icon" /> Adding…</> : <><Plus size={14} /> Add Class</>}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <span className="card-title-icon"><GraduationCap size={15} /></span>
            Classes ({classes.length})
          </span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="empty-state"><Loader2 size={24} className="spin-icon" /> Loading classes…</div>
          ) : classes.length === 0 ? (
            <div className="empty-state">
              <p>No classes yet. Add at least one grade class to continue.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Class</th><th>Campus</th><th>Room</th><th>Capacity</th></tr>
              </thead>
              <tbody>
                {classes.map((c) => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 600 }}>{c.grade}</td>
                    <td>{c.campus?.name || "—"}</td>
                    <td>{c.room || "—"}</td>
                    <td>{c.capacity}</td>
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
