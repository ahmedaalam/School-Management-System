import React, { useState, useEffect } from "react";
import useApi from "../hooks/useApi";
import { Users, Search, Plus, Loader2 } from "lucide-react";

export default function TeachersPanel() {
  const api = useApi();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/teachers");
      setTeachers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-view-content">
      <div className="page-header">
        <h1 className="page-title">Teachers <span>Directory</span></h1>
        <p className="page-subtitle">Manage school teachers, assigned subjects, and sections.</p>
      </div>

      <div className="card">
        <div className="table-filters" style={{ padding: "16px 20px", display: "flex", gap: "10px", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
          <div className="input-with-icon" style={{ flex: 1 }}>
            <span className="input-icon"><Search size={15} /></span>
            <input className="form-input" placeholder="Search teachers..." />
          </div>
          <button className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center" }}>
            <Plus size={14} /> Add Teacher
          </button>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="loading-container"><Loader2 className="spin-icon" /></div>
          ) : teachers.length === 0 ? (
            <div className="empty-state">
              <Users size={24} />
              <div className="empty-title">No Teachers Found</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map(teacher => (
                  <tr key={teacher._id}>
                    <td>{teacher.name}</td>
                    <td>{teacher.email}</td>
                    <td>{teacher.phone}</td>
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
