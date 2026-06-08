import { useCallback, useEffect, useState } from "react";
import { BookOpen, Plus, Pencil, Trash2, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { ENDPOINTS } from "../api/config";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];
const EMPTY = { name: "", code: "", color: "#6366f1", description: "", credits: 1, status: "Active" };

export default function SubjectsPanel({ api, showToast, onDataChange, embedded }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(ENDPOINTS.subjects);
      setItems(res.data);
      onDataChange?.();
    } catch {
      showToast("Failed to load subjects", "error");
    } finally {
      setLoading(false);
    }
  }, [api, showToast, onDataChange]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal("form"); };
  const openEdit = (item) => {
    setForm({ name: item.name, code: item.code, color: item.color, description: item.description || "", credits: item.credits, status: item.status });
    setEditId(item._id);
    setModal("form");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      showToast("Name and code are required", "error");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await api.put(`${ENDPOINTS.subjects}/${editId}`, form);
        showToast("Subject updated", "success");
      } else {
        await api.post(ENDPOINTS.subjects, form);
        showToast("Subject added", "success");
      }
      setModal(null);
      fetchItems();
    } catch (err) {
      showToast(err.response?.data?.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`${ENDPOINTS.subjects}/${deleteId}`);
      showToast("Subject deleted", "success");
      setDeleteId(null);
      fetchItems();
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
            <h1 className="page-title">Subjects <span>Catalog</span></h1>
            <p className="page-subtitle">Define the curriculum subjects offered across all grades and sections.</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add Subject</button>
        </div>
      )}
      {embedded && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add Subject</button>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <span className="card-title"><span className="card-title-icon"><BookOpen size={15} /></span>All Subjects ({items.length})</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="empty-state"><Loader2 size={24} className="spin-icon" /> Loading subjects…</div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <BookOpen size={32} style={{ opacity: 0.4, marginBottom: 12 }} />
              <p>No subjects defined. Add subjects like Mathematics, Science, English.</p>
              <button className="btn btn-primary btn-sm" onClick={openAdd} style={{ marginTop: 12 }}><Plus size={14} /> Add First Subject</button>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Code</th><th>Subject</th><th>Credits</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s._id}>
                    <td><span className="subject-dot" style={{ background: s.color }} /> <span className="badge badge-indigo">{s.code}</span></td>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td>{s.credits}</td>
                    <td><span className={`status-pill ${s.status.toLowerCase()}`}><span className="pill-dot" />{s.status}</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="icon-btn" onClick={() => openEdit(s)}><Pencil size={14} /></button>
                        <button className="icon-btn danger" onClick={() => setDeleteId(s._id)}><Trash2 size={14} /></button>
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
              <span className="modal-title"><span className="modal-title-icon"><BookOpen size={15} /></span>{editId ? "Edit Subject" : "Add Subject"}</span>
              <button className="modal-close" onClick={() => setModal(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Subject Name</label>
                  <input className="form-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Mathematics" />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject Code</label>
                  <input className="form-input" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. MATH" />
                </div>
                <div className="form-group">
                  <label className="form-label">Credits</label>
                  <input type="number" min={1} className="form-input" value={form.credits} onChange={(e) => setForm((f) => ({ ...f, credits: Number(e.target.value) }))} />
                </div>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Color Tag</label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {COLORS.map((c) => (
                      <button key={c} type="button" onClick={() => setForm((f) => ({ ...f, color: c }))}
                        style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: form.color === c ? "3px solid var(--text-primary)" : "2px solid transparent", cursor: "pointer" }} />
                    ))}
                  </div>
                </div>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Description</label>
                  <input className="form-input" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><Loader2 size={14} className="spin-icon" /> Saving…</> : <><CheckCircle2 size={14} /> Save Subject</>}
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
              <span className="modal-title"><span className="modal-title-icon"><AlertCircle size={15} /></span>Delete Subject</span>
              <button className="modal-close" onClick={() => setDeleteId(null)}><X size={16} /></button>
            </div>
            <div className="modal-body"><p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Delete this subject from the catalog?</p></div>
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
