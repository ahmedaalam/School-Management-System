import React, { useState, useEffect } from "react";
import useApi from "../hooks/useApi";
import { Users, Plus, Loader2, Mail, Phone, User } from "lucide-react";
import DataTable from "./ui/DataTable";
import PageHeader from "./ui/PageHeader";
import EmptyState from "./ui/EmptyState";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";

export default function ParentsPanel() {
  const api = useApi();
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchParents(); }, []);

  const fetchParents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/parents");
      setParents(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
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
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Parents"
        titleHighlight="Directory"
        subtitle="Manage parent profiles and their linked students."
        actions={
          <Button>
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
    </div>
  );
}
