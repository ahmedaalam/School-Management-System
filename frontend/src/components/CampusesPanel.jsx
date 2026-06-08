import { useCallback, useEffect, useState } from "react";
import { Building2, Plus, Pencil, Trash2, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { ENDPOINTS } from "../api/config";

const EMPTY = { name: "", code: "", address: "", city: "", phone: "", isMain: false, status: "Active" };

export default function CampusesPanel({ api, showToast, onDataChange, embedded }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchItems = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get(ENDPOINTS.campuses);
      setItems(res.data);
    } catch {
      showToast("Failed to load campuses", "error");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [api, showToast]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal("form"); };
  const openEdit = (item) => {
    setForm({ name: item.name, code: item.code, address: item.address, city: item.city, phone: item.phone || "", isMain: item.isMain, status: item.status });
    setEditId(item._id);
    setModal("form");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim() || !form.address.trim() || !form.city.trim()) {
      showToast("Please fill all required fields", "error");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await api.put(`${ENDPOINTS.campuses}/${editId}`, form);
        showToast("Campus updated", "success");
      } else {
        await api.post(ENDPOINTS.campuses, form);
        showToast("Campus added", "success");
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
      await api.delete(`${ENDPOINTS.campuses}/${deleteId}`);
      showToast("Campus deleted", "success");
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
            <h1 className="page-title">Campuses <span>Management</span></h1>
            <p className="page-subtitle">Configure school branches and locations. Add campuses before creating sections.</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add Campus</button>
        </div>
      )}
      {embedded && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add Campus</button>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <span className="card-title"><span className="card-title-icon"><Building2 size={15} /></span>All Campuses ({items.length})</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="empty-state"><Loader2 size={24} className="spin-icon" /> Loading campuses…</div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <Building2 size={32} style={{ opacity: 0.4, marginBottom: 12 }} />
              <p>No campuses yet. Start by adding your main campus.</p>
              <button className="btn btn-primary btn-sm" onClick={openAdd} style={{ marginTop: 12 }}><Plus size={14} /> Add First Campus</button>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Code</th><th>Name</th><th>City</th><th>Phone</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c._id}>
                    <td><span className="badge badge-indigo">{c.code}</span>{c.isMain && <span className="badge badge-green" style={{ marginLeft: 6 }}>Main</span>}</td>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>{c.city}</td>
                    <td>{c.phone || "—"}</td>
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
              <span className="modal-title"><span className="modal-title-icon"><Building2 size={15} /></span>{editId ? "Edit Campus" : "Add Campus"}</span>
              <button className="modal-close" onClick={() => setModal(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Campus Name</label>
                  <input className="form-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Main Campus" />
                </div>
                <div className="form-group">
                  <label className="form-label">Campus Code</label>
                  <input className="form-input" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. MAIN" />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} placeholder="e.g. Springfield" />
                </div>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Address</label>
                  <input className="form-input" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Street address" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+1 555-0100" />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <label className="form-group" style={{ gridColumn: "span 2", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
                  <input type="checkbox" checked={form.isMain} onChange={(e) => setForm((f) => ({ ...f, isMain: e.target.checked }))} />
                  Set as main campus
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><Loader2 size={14} className="spin-icon" /> Saving…</> : <><CheckCircle2 size={14} /> Save Campus</>}
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
              <span className="modal-title"><span className="modal-title-icon"><AlertCircle size={15} /></span>Delete Campus</span>
              <button className="modal-close" onClick={() => setDeleteId(null)}><X size={16} /></button>
            </div>
            <div className="modal-body"><p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Delete this campus? Sections linked to it may be affected.</p></div>
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
