import React, { useState, useEffect } from "react";
import { DollarSign, Search, Plus, Loader2, ArrowUpRight, ArrowDownRight, CreditCard } from "lucide-react";

export default function FinancePanel({ api, showToast }) {
  const [fees, setFees] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("fees");

  useEffect(() => {
    fetchFinanceData();
  }, []); // eslint-disable-line

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      const [feesRes, expensesRes] = await Promise.all([
        api.get("/finance/fees"),
        api.get("/finance/expenses")
      ]);
      setFees(feesRes.data);
      setExpenses(expensesRes.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch finance data", "error");
    } finally {
      setLoading(false);
    }
  };

  const totalCollected = fees.filter(f => f.status === "Paid").reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = fees.filter(f => f.status === "Unpaid").reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="tab-view-content">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 className="page-title">Finance <span>& Accounts</span></h1>
          <p className="page-subtitle">Manage student fee collections and track school expenses.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn btn-primary" style={{ display: "flex", alignItems: "center" }}>
            <Plus size={14} /> Record {activeTab === "fees" ? "Payment" : "Expense"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: "24px" }}>
        <div className="stat-card">
          <div className="stat-icon green"><ArrowUpRight size={20} /></div>
          <div>
            <div className="stat-value">${totalCollected.toLocaleString()}</div>
            <div className="stat-label">Total Fees Collected</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><ArrowDownRight size={20} /></div>
          <div>
            <div className="stat-value">${totalExpenses.toLocaleString()}</div>
            <div className="stat-label">Total Expenses</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><CreditCard size={20} /></div>
          <div>
            <div className="stat-value">${totalPending.toLocaleString()}</div>
            <div className="stat-label">Pending Fees</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: "flex", gap: "16px", paddingBottom: 0, borderBottom: "1px solid var(--border)" }}>
          <button className={`nav-tab ${activeTab === "fees" ? "active" : ""}`} onClick={() => setActiveTab("fees")} style={{ background: "none", border: "none", padding: "12px 16px", fontWeight: 600, color: activeTab === "fees" ? "var(--primary)" : "var(--text-muted)", borderBottom: activeTab === "fees" ? "2px solid var(--primary)" : "2px solid transparent", cursor: "pointer" }}>
            Fee Collections
          </button>
          <button className={`nav-tab ${activeTab === "expenses" ? "active" : ""}`} onClick={() => setActiveTab("expenses")} style={{ background: "none", border: "none", padding: "12px 16px", fontWeight: 600, color: activeTab === "expenses" ? "var(--primary)" : "var(--text-muted)", borderBottom: activeTab === "expenses" ? "2px solid var(--primary)" : "2px solid transparent", cursor: "pointer" }}>
            Expenses
          </button>
        </div>

        <div className="table-filters" style={{ padding: "16px 20px", display: "flex", gap: "10px", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
          <div className="input-with-icon" style={{ flex: 1, maxWidth: "300px" }}>
            <span className="input-icon"><Search size={15} /></span>
            <input className="form-input" placeholder={`Search ${activeTab}...`} />
          </div>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="loading-container"><Loader2 className="spin-icon" /></div>
          ) : activeTab === "fees" ? (
            fees.length === 0 ? (
              <div className="empty-state">
                <DollarSign size={24} />
                <div className="empty-title">No Fee Records</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map(f => (
                    <tr key={f._id}>
                      <td>{f.student?.name || "Unknown"}</td>
                      <td>{f.type}</td>
                      <td style={{ fontWeight: 600 }}>${f.amount.toLocaleString()}</td>
                      <td>{new Date(f.dueDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-pill ${f.status.toLowerCase()}`}>
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            expenses.length === 0 ? (
              <div className="empty-state">
                <DollarSign size={24} />
                <div className="empty-title">No Expense Records</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Recorded By</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(e => (
                    <tr key={e._id}>
                      <td>{e.category}</td>
                      <td style={{ fontWeight: 600 }}>${e.amount.toLocaleString()}</td>
                      <td>{new Date(e.date).toLocaleDateString()}</td>
                      <td>{e.description || "-"}</td>
                      <td>{e.recordedBy?.name || "System"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>
    </div>
  );
}
