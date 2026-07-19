import React, { useState, useEffect } from "react";
import useApi from "../hooks/useApi";
import { Users, Plus, Loader2, Mail, Phone, Pencil, Trash2, X, AlertCircle, CheckCircle2, User } from "lucide-react";
import DataTable from "./ui/DataTable";
import PageHeader from "./ui/PageHeader";
import EmptyState from "./ui/EmptyState";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";

const EMPTY = { name: "", email: "", password: "", phone: "", students: [] };

export default function ParentsPanel({ showToast }) {
  const api = useApi();
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchParents();
  }, []);

  useEffect(() => {
    if (modal === "form") {
      api.get("/students")
        .then((res) => setStudents(Array.isArray(res.data) ? res.data : []))
        .catch((err) => console.error("Failed to load students", err));
    }
  }, [modal, api]);

  const fetchParents = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get("/parents");
      setParents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      if (showToast) showToast("Failed to load parents", "error");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const openAdd = () => {
    setForm({ name: "", email: "", password: "parent123", phone: "", students: [] });
    setEditId(null);
    setModal("form");
  };

  const openEdit = (p) => {
    setForm({
      name: p.name || "",
      email: p.email || "",
      password: "", // Keep empty to indicate no change
      phone: p.phone || "",
      students: p.students?.map((s) => s._id || s) || [],
    });
    setEditId(p._id);
    setModal("form");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      if (showToast) showToast("Name, Email, and Phone are required", "error");
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
        await api.put(`/parents/${editId}`, payload);
        if (showToast) showToast("Parent profile updated successfully", "success");
      } else {
        await api.post("/parents", payload);
        if (showToast) showToast("Parent profile added successfully", "success");
      }
      setModal(null);
      fetchParents(true);
    } catch (err) {
      if (showToast) showToast(err.response?.data?.message || "Failed to save parent", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/parents/${deleteId}`);
      if (showToast) showToast("Parent profile deleted successfully", "success");
      setDeleteId(null);
      fetchParents(true);
    } catch (err) {
      if (showToast) showToast("Failed to delete parent profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: "name", label: "Parent",
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            {p.name?.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-sm text-foreground truncate">{p.name}</span>
            <span className="text-xs text-muted-foreground truncate flex items-center gap-1"><Mail size={10} /> {p.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: "phone", label: "Phone",
      render: (p) => (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Phone size={12} /> {p.phone || "—"}
        </div>
      ),
    },
    {
      key: "students", label: "Linked Students",
      render: (p) => (
        <Badge className="bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20">
          {p.students?.length ?? 0} student{(p.students?.length ?? 0) !== 1 ? "s" : ""}
        </Badge>
      ),
    },
    {
      key: "actions", label: "Actions",
      render: (p) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" title="Edit Parent" onClick={() => openEdit(p)}>
            <Pencil size={14} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" title="Delete Parent" onClick={() => setDeleteId(p._id)}>
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Parents"
        titleHighlight="Directory"
        subtitle="Manage parent profiles and their linked students."
        actions={
          <Button onClick={openAdd}>
            <Plus size={14} className="mr-2" /> Add Parent
          </Button>
        }
      />

      <div>
        {loading ? (
          <div className="p-8 flex justify-center text-muted-foreground"><Loader2 size={24} className="animate-spin" /></div>
        ) : parents.length === 0 ? (
          <div className="border border-border bg-card rounded-xl p-8">
            <EmptyState
              icon={Users}
              title="No Parents Yet"
              description="Link parents to students to enable parent access and communications."
              action={<Button size="sm" onClick={openAdd} className="mt-4"><Plus size={14} className="mr-1" /> Add First Parent</Button>}
            />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={parents}
            searchKeys={["name", "email", "phone"]}
            emptyTitle="No parents match your search"
          />
        )}
      </div>

      {modal === "form" && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">
                <span className="modal-title-icon"><User size={15} /></span>
                {editId ? "Edit Parent Profile" : "Register New Parent"}
              </span>
              <button className="modal-close" onClick={() => setModal(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. John Doe Sr." required />
                </div>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="e.g. parent@school.edu" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="e.g. +1 555-0100" required />
                </div>
                <div className="form-group">
                  <label className="form-label">{editId ? "Password (leave blank to keep current)" : "Password"}</label>
                  <input className="form-input" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder={editId ? "••••••••" : "Min 6 characters"} required={!editId} />
                </div>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Linked Students</label>
                  <div className="max-h-[140px] overflow-y-auto border border-border rounded-xl p-3 flex flex-col gap-2 bg-background">
                    {students.length === 0 ? (
                      <span className="text-xs text-muted-foreground">No students available to link.</span>
                    ) : (
                      students.map((s) => {
                        const isChecked = form.students.includes(s._id);
                        return (
                          <label key={s._id} className="flex items-center gap-2 cursor-pointer text-sm">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const val = e.target.checked
                                  ? [...form.students, s._id]
                                  : form.students.filter((id) => id !== s._id);
                                setForm((f) => ({ ...f, students: val }));
                              }}
                            />
                            <span className="text-foreground">{s.name} ({s.studentId || s._id.slice(-6)})</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><Loader2 size={14} className="spin-icon" /> Saving…</> : <><CheckCircle2 size={14} /> Save Parent</>}
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
                Delete Parent Profile
              </span>
              <button className="modal-close" onClick={() => setDeleteId(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                Are you sure you want to delete this parent profile? This action cannot be undone.
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
