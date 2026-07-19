import React, { useState, useEffect } from "react";
import useApi from "../hooks/useApi";
import { Users, Plus, Loader2, Mail, Phone, GraduationCap } from "lucide-react";
import DataTable from "./ui/DataTable";
import PageHeader from "./ui/PageHeader";
import EmptyState from "./ui/EmptyState";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";

export default function TeachersPanel() {
  const api = useApi();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTeachers(); }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/teachers");
      setTeachers(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
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
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Teachers"
        titleHighlight="Directory"
        subtitle="Manage faculty, assigned subjects, and class sections."
        actions={
          <Button>
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
    </div>
  );
}
