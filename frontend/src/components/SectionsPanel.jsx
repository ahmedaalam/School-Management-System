import { useCallback, useEffect, useState } from "react";
import { Layers, Plus, Pencil, Trash2, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { ENDPOINTS } from "../api/config";

const EMPTY = { name: "", grade: "", campus: "", capacity: 30, room: "", status: "Active" };

export default function SectionsPanel({ api, showToast, onDataChange, embedded }) {
  const [items, setItems] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [classes, setClasses] = useState([]);
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
      const allSections = secRes.data;
      setItems(allSections.filter((s) => s.kind !== "class"));
      setClasses(allSections.filter((s) => s.kind === "class"));
      setCampuses(campRes.data);
    } catch {
      showToast("Failed to load sections", "error");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [api, showToast]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openAdd = () => {
    setForm({ ...EMPTY, campus: campuses[0]?._id || "", grade: classes[0]?.grade || "" });
    setEditId(null);
    setModal("form");
  };

  const openEdit = (item) => {
    setForm({
      name: item.name,
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
    if (!form.name.trim() || !form.campus) {
      showToast("Name and campus are required", "error");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await api.put(`${ENDPOINTS.sections}/${editId}`, form);
        showToast("Section updated", "success");
      } else {
        await api.post(ENDPOINTS.sections, { ...form, kind: "section" });
        showToast("Section added", "success");
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
      showToast("Section deleted", "success");
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
            <h1 className="page-title">Class <span>Sections</span></h1>
            <p className="page-subtitle">Add class sections per grade and campus (e.g. 9-A, 10-B).</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd} disabled={campuses.length === 0 || classes.length === 0}>
            <Plus size={15} /> Add Class Section
          </button>
        </div>
      )}
      {embedded && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <button className="btn btn-primary" onClick={openAdd} disabled={campuses.length === 0 || classes.length === 0}>
            <Plus size={15} /> Add Class Section
          </button>
        </div>
      )}

      {campuses.length === 0 && !loading && (
        <div className="setup-alert">
          <AlertCircle size={16} />
          Add at least one campus before creating class sections.
        </div>
      )}
      {classes.length === 0 && !loading && (
        <div className="setup-alert">
          <AlertCircle size={16} />
          Add at least one class (from the Classes tab) before creating sections.
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <span className="card-title"><span className="card-title-icon"><Layers size={15} /></span>All Class Sections ({items.length})</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="empty-state"><Loader2 size={24} className="spin-icon" /> Loading sections…</div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <Layers size={32} style={{ opacity: 0.4, marginBottom: 12 }} />
              <p>No class sections yet. Create sections like 9-A, 10-B.</p>
              {campuses.length > 0 && (
                <button className="btn btn-primary btn-sm" onClick={openAdd} style={{ marginTop: 12 }}><Plus size={14} /> Add Class Section</button>
              )}
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Section</th><th>Grade</th><th>Campus</th><th>Room</th><th>Capacity</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s._id}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td><span className="badge badge-indigo">{s.grade}</span></td>
                    <td>{s.campus?.name || "—"}</td>
                    <td>{s.room || "—"}</td>
                    <td>{s.capacity}</td>
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
              <span className="modal-title"><span className="modal-title-icon"><Layers size={15} /></span>{editId ? "Edit Class Section" : "Add Class Section"}</span>
              <button className="modal-close" onClick={() => setModal(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Class Section Name</label>
                  <input className="form-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. 9-A" />
                </div>
                <div className="form-group">
                  <label className="form-label">Grade Level</label>
                  <select className="form-input" value={form.grade} onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}>
                    {classes.length === 0 ? (
                      <option value="">No classes created yet</option>
                    ) : (
                      classes.map((c) => <option key={c._id} value={c.grade}>{c.grade}</option>)
                    )}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Campus</label>
                  <select className="form-input" value={form.campus} onChange={(e) => setForm((f) => ({ ...f, campus: e.target.value }))}>
                    <option value="">Select campus</option>
                    {campuses.map((c) => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Room</label>
                  <input className="form-input" value={form.room} onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))} placeholder="e.g. Room 101" />
                </div>
                <div className="form-group">
                  <label className="form-label">Capacity</label>
                  <input type="number" min={1} className="form-input" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><Loader2 size={14} className="spin-icon" /> Saving…</> : <><CheckCircle2 size={14} /> Save Class Section</>}
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
              <span className="modal-title"><span className="modal-title-icon"><AlertCircle size={15} /></span>Delete Section</span>
              <button className="modal-close" onClick={() => setDeleteId(null)}><X size={16} /></button>
            </div>
            <div className="modal-body"><p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Delete this section?</p></div>
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
