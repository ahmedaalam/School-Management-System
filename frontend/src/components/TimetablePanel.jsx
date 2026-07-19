import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Plus, Pencil, Trash2, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { ENDPOINTS } from "../api/config";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const EMPTY = { section: "", subject: "", campus: "", dayOfWeek: "Monday", period: 1, startTime: "08:00", endTime: "08:45", room: "", teacherName: "" };

export default function TimetablePanel({ api, showToast, onDataChange, embedded }) {
  const [slots, setSlots] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSection, setFilterSection] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [slotRes, secRes, subRes, campRes, teachRes] = await Promise.all([
        api.get(ENDPOINTS.timetable),
        api.get(ENDPOINTS.sections),
        api.get(ENDPOINTS.subjects),
        api.get(ENDPOINTS.campuses),
        api.get("/teachers"),
      ]);
      setSlots(slotRes.data);
      setSections(secRes.data.filter((s) => s.kind !== "class"));
      setSubjects(subRes.data);
      setCampuses(campRes.data);
      setTeachers(Array.isArray(teachRes.data) ? teachRes.data : []);
      setFilterSection((prev) => prev || secRes.data[0]?._id || "");
    } catch {
      showToast("Failed to load timetable", "error");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [api, showToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredSlots = filterSection
    ? slots.filter((s) => (s.section?._id || s.section) === filterSection)
    : slots;

  const openAdd = () => {
    const sec = sections.find((s) => s._id === filterSection) || sections[0];
    setForm({
      ...EMPTY,
      section: sec?._id || "",
      subject: subjects[0]?._id || "",
      campus: sec?.campus?._id || sec?.campus || campuses[0]?._id || "",
    });
    setEditId(null);
    setModal("form");
  };

  const openEdit = (slot) => {
    setForm({
      section: slot.section?._id || slot.section,
      subject: slot.subject?._id || slot.subject,
      campus: slot.campus?._id || slot.campus,
      dayOfWeek: slot.dayOfWeek,
      period: slot.period,
      startTime: slot.startTime,
      endTime: slot.endTime,
      room: slot.room || "",
      teacherName: slot.teacherName || "",
    });
    setEditId(slot._id);
    setModal("form");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.section || !form.subject || !form.campus) {
      showToast("Section, subject, and campus are required", "error");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await api.put(`${ENDPOINTS.timetable}/${editId}`, form);
        showToast("Timetable slot updated", "success");
      } else {
        await api.post(ENDPOINTS.timetable, form);
        showToast("Timetable slot added", "success");
      }
      setModal(null);
      await fetchData(true);
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
      await api.delete(`${ENDPOINTS.timetable}/${deleteId}`);
      showToast("Slot deleted", "success");
      setDeleteId(null);
      await fetchData(true);
      onDataChange?.();
    } catch {
      showToast("Delete failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const canAdd = sections.length > 0 && subjects.length > 0;

  const buildGrid = () => {
    const periods = [...new Set(filteredSlots.map((s) => s.period))].sort((a, b) => a - b);
    if (periods.length === 0) periods.push(1, 2, 3, 4, 5);

    return (
      <div className="timetable-grid-wrap">
        <table className="timetable-grid">
          <thead>
            <tr>
              <th>Period</th>
              {DAYS.map((d) => <th key={d}>{d.slice(0, 3)}</th>)}
            </tr>
          </thead>
          <tbody>
            {periods.map((p) => (
              <tr key={p}>
                <td className="period-cell">P{p}</td>
                {DAYS.map((day) => {
                  const slot = filteredSlots.find((s) => s.dayOfWeek === day && s.period === p);
                  return (
                    <td key={day} className="timetable-cell">
                      {slot ? (
                        <div className="timetable-slot" style={{ borderLeftColor: slot.subject?.color || "var(--accent)" }}
                          onClick={() => openEdit(slot)}>
                          <div className="slot-subject">{slot.subject?.name || "—"}</div>
                          <div className="slot-meta">{slot.startTime}–{slot.endTime}</div>
                          {slot.teacherName && <div className="slot-meta">{slot.teacherName}</div>}
                          {slot.room && <div className="slot-meta">Rm {slot.room}</div>}
                        </div>
                      ) : (
                        <span className="slot-empty">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={embedded ? "" : "tab-view-content"}>
      {!embedded && (
        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="page-title">Timetable <span>Schedule</span></h1>
            <p className="page-subtitle">Build weekly class schedules per section. Requires campuses, sections, and subjects first.</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd} disabled={!canAdd}>
            <Plus size={15} /> Add Slot
          </button>
        </div>
      )}
      {embedded && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <button className="btn btn-primary" onClick={openAdd} disabled={!canAdd}>
            <Plus size={15} /> Add Slot
          </button>
        </div>
      )}

      {!canAdd && !loading && (
        <div className="setup-alert">
          <AlertCircle size={16} />
          Add sections and subjects before building the timetable.
        </div>
      )}

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <label className="form-label" style={{ margin: 0 }}>View Section:</label>
          <select className="form-input" style={{ maxWidth: 220 }} value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}>
            <option value="">All sections</option>
            {sections.map((s) => (
              <option key={s._id} value={s._id}>{s.name} — {s.grade}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title"><span className="card-title-icon"><CalendarDays size={15} /></span>Weekly Schedule</span>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="empty-state"><Loader2 size={24} className="spin-icon" /> Loading timetable…</div>
          ) : filteredSlots.length === 0 ? (
            <div className="empty-state">
              <CalendarDays size={32} style={{ opacity: 0.4, marginBottom: 12 }} />
              <p>No timetable slots yet. Add class periods for each section.</p>
              {canAdd && (
                <button className="btn btn-primary btn-sm" onClick={openAdd} style={{ marginTop: 12 }}><Plus size={14} /> Add First Slot</button>
              )}
            </div>
          ) : buildGrid()}
        </div>
      </div>

      {modal === "form" && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title"><span className="modal-title-icon"><CalendarDays size={15} /></span>{editId ? "Edit Slot" : "Add Timetable Slot"}</span>
              <button className="modal-close" onClick={() => setModal(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Section</label>
                  <select className="form-input" value={form.section}
                    onChange={(e) => {
                      const sec = sections.find((s) => s._id === e.target.value);
                      setForm((f) => ({
                        ...f,
                        section: e.target.value,
                        campus: sec?.campus?._id || sec?.campus || f.campus,
                      }));
                    }}>
                    <option value="">Select section</option>
                    {sections.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.grade})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select className="form-input" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}>
                    <option value="">Select subject</option>
                    {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Day</label>
                  <select className="form-input" value={form.dayOfWeek} onChange={(e) => setForm((f) => ({ ...f, dayOfWeek: e.target.value }))}>
                    {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Period</label>
                  <input type="number" min={1} max={12} className="form-input" value={form.period}
                    onChange={(e) => setForm((f) => ({ ...f, period: Number(e.target.value) }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input type="time" className="form-input" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input type="time" className="form-input" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Room</label>
                  <input className="form-input" value={form.room} onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))} placeholder="e.g. 101" />
                </div>
                <div className="form-group">
                  <label className="form-label">Teacher</label>
                  <select className="form-input" value={form.teacherName} onChange={(e) => setForm((f) => ({ ...f, teacherName: e.target.value }))}>
                    <option value="">— No teacher assigned —</option>
                    {teachers.map((t) => (
                      <option key={t._id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                {editId && (
                  <button type="button" className="btn btn-danger" style={{ marginRight: "auto" }}
                    onClick={() => { setModal(null); setDeleteId(editId); }}>Delete</button>
                )}
                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><Loader2 size={14} className="spin-icon" /> Saving…</> : <><CheckCircle2 size={14} /> Save Slot</>}
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
              <span className="modal-title"><span className="modal-title-icon"><AlertCircle size={15} /></span>Delete Slot</span>
              <button className="modal-close" onClick={() => setDeleteId(null)}><X size={16} /></button>
            </div>
            <div className="modal-body"><p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Remove this timetable slot?</p></div>
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
