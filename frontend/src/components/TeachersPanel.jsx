import React, { useState, useEffect } from "react";
import useApi from "../hooks/useApi";
import { Users, Plus, Loader2, Mail, Phone, Pencil, Trash2, X, AlertCircle, CheckCircle2 } from "lucide-react";
import DataTable from "./ui/DataTable";
import PageHeader from "./ui/PageHeader";
import EmptyState from "./ui/EmptyState";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";

const EMPTY = { name: "", email: "", password: "", phone: "" };

export default function TeachersPanel({ showToast }) {
  const api = useApi();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get("/teachers");
      setTeachers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      if (showToast) showToast("Failed to load teachers", "error");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const openAdd = () => {
    setForm({ name: "", email: "", password: "teacher123", phone: "" });
    setEditId(null);
    setModal("form");
  };

  const openEdit = (t) => {
    setForm({
      name: t.name || "",
      email: t.email || "",
      password: "", // Keep empty to indicate no change
      phone: t.phone || "",
    });
    setEditId(t._id);
    setModal("form");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      if (showToast) showToast("Name and Email are required", "error");
      return;
    }
    if (!editId && (!form.password || form.password.length < 6)) {
      if (showToast) showToast("Password must be at least 6 characters", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = { ...form };
      if (editId) {
        if (!payload.password) delete payload.password; // Do not update password if empty
        await api.put(`/teachers/${editId}`, payload);
        if (showToast) showToast("Teacher updated successfully", "success");
      } else {
        await api.post("/teachers", payload);
        if (showToast) showToast("Teacher added successfully", "success");
      }
      setModal(null);
      fetchTeachers(true);
    } catch (err) {
      if (showToast) showToast(err.response?.data?.message || "Failed to save teacher", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/teachers/${deleteId}`);
      if (showToast) showToast("Teacher profile deleted successfully", "success");
      setDeleteId(null);
      fetchTeachers(true);
    } catch (err) {
      if (showToast) showToast("Failed to delete teacher", "error");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: "name", label: "Teacher",
      render: (t) => (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            {t.name?.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-sm text-foreground truncate">{t.name}</span>
            <span className="text-xs text-muted-foreground truncate flex items-center gap-1"><Mail size={10} /> {t.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: "phone", label: "Phone",
      render: (t) => (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Phone size={12} /> {t.phone || "—"}
        </div>
      ),
    },
    {
      key: "status", label: "Status",
      render: (t) => (
        <Badge
          variant={t.status === "Active" ? "default" : t.status === "Suspended" ? "destructive" : "secondary"}
          className={t.status === "Active" ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : ""}
        >
          {t.status || "Active"}
        </Badge>
      ),
    },
    {
      key: "actions", label: "Actions",
      render: (t) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" title="Edit Teacher" onClick={() => openEdit(t)}>
            <Pencil size={14} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" title="Delete Teacher" onClick={() => setDeleteId(t._id)}>
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Teachers"
        titleHighlight="Directory"
        subtitle="Manage faculty, assigned subjects, and class sections."
        actions={
          <Button onClick={openAdd}>
            <Plus size={14} className="mr-2" /> Add Teacher
          </Button>
        }
      />

      <div>
        {loading ? (
          <div className="p-8 flex justify-center text-muted-foreground"><Loader2 size={24} className="animate-spin" /></div>
        ) : teachers.length === 0 ? (
          <div className="border border-border bg-card rounded-xl p-8">
            <EmptyState
              icon={Users}
              title="No Teachers Yet"
              description="Add your first teacher to get started with class assignments."
              action={<Button size="sm" onClick={openAdd} className="mt-4"><Plus size={14} className="mr-1" /> Add First Teacher</Button>}
            />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={teachers}
            searchKeys={["name", "email", "phone"]}
            emptyTitle="No teachers match your search"
          />
        )}
      </div>

      {modal === "form" && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">
                <span className="modal-title-icon"><Plus size={15} /></span>
                {editId ? "Edit Teacher Profile" : "Register New Teacher"}
              </span>
              <button className="modal-close" onClick={() => setModal(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Professor John Doe" required />
                </div>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="e.g. john.doe@school.edu" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="e.g. +1 555-0100" />
                </div>
                <div className="form-group">
                  <label className="form-label">{editId ? "Password (leave blank to keep current)" : "Password"}</label>
                  <input className="form-input" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder={editId ? "••••••••" : "Min 6 characters"} required={!editId} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><Loader2 size={14} className="spin-icon" /> Saving…</> : <><CheckCircle2 size={14} /> Save Teacher</>}
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
              <span className="modal-title">
                <span className="modal-title-icon"><AlertCircle size={15} /></span>
                Delete Teacher
              </span>
              <button className="modal-close" onClick={() => setDeleteId(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                Are you sure you want to delete this teacher profile? This action cannot be undone.
              </p>
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
