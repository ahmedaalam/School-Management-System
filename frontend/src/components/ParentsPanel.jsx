import React, { useState, useEffect } from "react";
import useApi from "../hooks/useApi";
import { Users, Search, Plus, Loader2 } from "lucide-react";

export default function ParentsPanel() {
  const api = useApi();
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/parents");
      setParents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-view-content">
      <div className="page-header">
        <h1 className="page-title">Parents <span>Directory</span></h1>
        <p className="page-subtitle">Manage parent profiles and their linked students.</p>
      </div>

      <div className="card">
        <div className="table-filters" style={{ padding: "16px 20px", display: "flex", gap: "10px", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
          <div className="input-with-icon" style={{ flex: 1 }}>
            <span className="input-icon"><Search size={15} /></span>
            <input className="form-input" placeholder="Search parents..." />
          </div>
          <button className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center" }}>
            <Plus size={14} /> Add Parent
          </button>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="loading-container"><Loader2 className="spin-icon" /></div>
          ) : parents.length === 0 ? (
            <div className="empty-state">
              <Users size={24} />
              <div className="empty-title">No Parents Found</div>
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
                {parents.map(parent => (
                  <tr key={parent._id}>
                    <td>{parent.name}</td>
                    <td>{parent.email}</td>
                    <td>{parent.phone}</td>
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
