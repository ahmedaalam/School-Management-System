import { useCallback, useEffect, useState } from "react";
import { GraduationCap, Plus, Pencil, Trash2, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { ENDPOINTS } from "../api/config";

const GRADES = Array.from({ length: 10 }, (_, i) => `Grade ${i + 1}`);
const EMPTY = { grade: "Grade 1", campus: "", capacity: 40, room: "", status: "Active" };

export default function SetupClassStep({ api, showToast, onDataChange, embedded }) {
  const [items, setItems] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchItems = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [secRes, campRes] = await Promise.all([
        api.get(ENDPOINTS.sections),
        api.get(ENDPOINTS.campuses),
      ]);
      setItems(secRes.data.filter((s) => s.kind === "class"));
      setCampuses(campRes.data);
    } catch {
      showToast("Failed to load classes", "error");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [api, showToast]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openAdd = () => {
    setForm({ ...EMPTY, campus: campuses[0]?._id || "" });
    setEditId(null);
    setModal("form");
  };

  const openEdit = (item) => {
    setForm({
      grade: item.grade,
      campus: item.campus?._id || item.campus,
      capacity: item.capacity,
      room: item.room || "",
      status: item.status,
    });
    setEditId(item._id);
    setModal("form");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.campus) {
      showToast("Please select a campus", "error");
      return;
    }
    const duplicate = items.some(
      (c) =>
        c.grade === form.grade &&
        (c.campus?._id || c.campus) === form.campus &&
        c._id !== editId
    );
    if (duplicate) {
      showToast("This class already exists for the selected campus", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.grade,
        grade: form.grade,
        campus: form.campus,
        capacity: form.capacity,
        room: form.room,
        status: form.status,
        kind: "class",
      };
      if (editId) {
        await api.put(`${ENDPOINTS.sections}/${editId}`, payload);
        showToast("Class updated", "success");
      } else {
        await api.post(ENDPOINTS.sections, payload);
        showToast("Class added", "success");
      }
      setModal(null);
      await fetchItems(true);
      onDataChange?.();
    } catch (err) {
      showToast(err.response?.data?.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`${ENDPOINTS.sections}/${deleteId}`);
      showToast("Class deleted", "success");
      setDeleteId(null);
      await fetchItems(true);
      onDataChange?.();
    } catch {
      showToast("Delete failed", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={embedded ? "" : "tab-view-content"}>
      {!embedded && (
        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="page-title">Classes <span>Management</span></h1>
            <p className="page-subtitle">Create grade-level classes (e.g. Class 9, Class 10) per campus.</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd} disabled={campuses.length === 0}>
            <Plus size={15} /> Add Class
          </button>
        </div>
      )}
      {embedded && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <button className="btn btn-primary" onClick={openAdd} disabled={campuses.length === 0}>
            <Plus size={15} /> Add Class
          </button>
        </div>
      )}

      {campuses.length === 0 && !loading && (
        <div className="setup-alert">
          <AlertCircle size={16} />
          Add at least one campus before creating classes.
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <span className="card-title-icon"><GraduationCap size={15} /></span>
            All Classes ({items.length})
          </span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="empty-state"><Loader2 size={24} className="spin-icon" /> Loading classes…</div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <GraduationCap size={32} style={{ opacity: 0.4, marginBottom: 12 }} />
              <p>No classes yet. Add grade classes like Class 9, Class 10.</p>
              {campuses.length > 0 && (
                <button className="btn btn-primary btn-sm" onClick={openAdd} style={{ marginTop: 12 }}>
                  <Plus size={14} /> Add First Class
                </button>
              )}
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Class</th><th>Campus</th><th>Room</th><th>Capacity</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c._id}>
                    <td><span className="badge badge-indigo">{c.grade}</span></td>
                    <td style={{ fontWeight: 600 }}>{c.campus?.name || "—"}</td>
                    <td>{c.room || "—"}</td>
                    <td>{c.capacity}</td>
                    <td><span className={`status-pill ${c.status.toLowerCase()}`}><span className="pill-dot" />{c.status}</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="icon-btn" onClick={() => openEdit(c)} title="Edit"><Pencil size={14} /></button>
                        <button className="icon-btn danger" onClick={() => setDeleteId(c._id)} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal === "form" && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">
                <span className="modal-title-icon"><GraduationCap size={15} /></span>
                {editId ? "Edit Class" : "Add Class"}
              </span>
              <button className="modal-close" onClick={() => setModal(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Grade / Class</label>
                  <select className="form-input" value={form.grade} onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}>
                    {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Campus</label>
                  <select className="form-input" value={form.campus} onChange={(e) => setForm((f) => ({ ...f, campus: e.target.value }))}>
                    <option value="">Select campus</option>
                    {campuses.map((c) => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Room</label>
                  <input className="form-input" value={form.room} onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))} placeholder="e.g. Block A" />
                </div>
                <div className="form-group">
                  <label className="form-label">Capacity</label>
                  <input type="number" min={1} className="form-input" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: Number(e.target.value) }))} />
                </div>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Status</label>
                  <select className="form-input" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><Loader2 size={14} className="spin-icon" /> Saving…</> : <><CheckCircle2 size={14} /> Save Class</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title"><span className="modal-title-icon"><AlertCircle size={15} /></span>Delete Class</span>
              <button className="modal-close" onClick={() => setDeleteId(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Delete this class? Sections linked to it may be affected.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
