import React, { useState, useEffect } from "react";
import { DollarSign, Search, Plus, Loader2, ArrowUpRight, ArrowDownRight, CreditCard, AlertCircle } from "lucide-react";
import PageHeader from "./ui/PageHeader";
import StatCard from "./ui/StatCard";
import DataTable from "./ui/DataTable";
import EmptyState from "./ui/EmptyState";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";

export default function FinancePanel({ api, showToast }) {
  const [fees, setFees] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("fees");

  useEffect(() => { fetchFinanceData(); }, []); // eslint-disable-line

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      const [feesRes, expensesRes] = await Promise.all([
        api.get("/finance/fees"),
        api.get("/finance/expenses"),
      ]);
      setFees(Array.isArray(feesRes.data) ? feesRes.data : []);
      setExpenses(Array.isArray(expensesRes.data) ? expensesRes.data : []);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch finance data", "error");
    } finally { setLoading(false); }
  };

  const totalCollected = fees.filter(f => f.status === "Paid").reduce((a, c) => a + c.amount, 0);
  const totalPending   = fees.filter(f => f.status === "Unpaid").reduce((a, c) => a + c.amount, 0);
  const totalExpenses  = expenses.reduce((a, c) => a + c.amount, 0);

  const feeColumns = [
    {
      key: "student", label: "Student",
      render: (f) => <div className="font-medium text-foreground">{f.student?.name || "Unknown"}</div>,
    },
    { key: "type", label: "Type" },
    {
      key: "amount", label: "Amount",
      render: (f) => <span className="font-bold text-foreground">${f.amount.toLocaleString()}</span>,
    },
    {
      key: "dueDate", label: "Due Date",
      render: (f) => new Date(f.dueDate).toLocaleDateString(),
    },
    {
      key: "status", label: "Status",
      render: (f) => (
        <Badge
          variant={f.status === "Paid" ? "default" : f.status === "Overdue" ? "destructive" : "secondary"}
          className={f.status === "Paid" ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : ""}
        >
          {f.status}
        </Badge>
      ),
    },
  ];

  const expenseColumns = [
    { key: "category", label: "Category" },
    {
      key: "amount", label: "Amount",
      render: (e) => <span className="font-bold text-destructive">${e.amount.toLocaleString()}</span>,
    },
    {
      key: "date", label: "Date",
      render: (e) => new Date(e.date).toLocaleDateString(),
    },
    { key: "description", label: "Description", render: (e) => e.description || "—" },
    { key: "recordedBy", label: "By", render: (e) => e.recordedBy?.name || "System" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Finance"
        titleHighlight="& Accounts"
        subtitle="Track fee collections, school expenses, and financial health."
        actions={
          <Button>
            <Plus size={14} className="mr-2" /> {activeTab === "fees" ? "Record Payment" : "Add Expense"}
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={ArrowUpRight} label="Fees Collected"  value={`$${totalCollected.toLocaleString()}`} color="green" />
        <StatCard icon={CreditCard}  label="Pending Fees"     value={`$${totalPending.toLocaleString()}`}   color="amber" />
        <StatCard icon={ArrowDownRight} label="Total Expenses" value={`$${totalExpenses.toLocaleString()}`} color="red" />
      </div>

      <div className="border border-border bg-card rounded-xl">
        {/* Tabs */}
        <div className="flex border-b border-border">
          {["fees", "expenses"].map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className="px-5 py-3 text-sm font-semibold capitalize transition-all border-b-2"
              style={{
                borderColor: activeTab === t ? "var(--primary)" : "transparent",
                color: activeTab === t ? "var(--primary)" : "var(--text-muted)",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              {t === "fees" ? "Fee Collections" : "Expenses"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-8 flex justify-center text-muted-foreground"><Loader2 size={24} className="animate-spin" /></div>
        ) : activeTab === "fees" ? (
          fees.length === 0 ? (
            <div className="p-8">
              <EmptyState icon={DollarSign} title="No Fee Records" description="Fee collection records will appear here once added." />
            </div>
          ) : (
            <DataTable columns={feeColumns} data={fees} searchKeys={["type", "status"]} emptyTitle="No fees match your search" />
          )
        ) : (
          expenses.length === 0 ? (
            <div className="p-8">
              <EmptyState icon={DollarSign} title="No Expense Records" description="School expenses will appear here once recorded." />
            </div>
          ) : (
            <DataTable columns={expenseColumns} data={expenses} searchKeys={["category", "description"]} emptyTitle="No expenses match your search" />
          )
        )}
      </div>
    </div>
  );
}
