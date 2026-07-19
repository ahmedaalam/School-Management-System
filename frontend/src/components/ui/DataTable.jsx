import { useState } from "react";
import { Search } from "lucide-react";
import EmptyState from "./EmptyState";
import { Input } from "./Input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./Table";

export default function DataTable({ columns, data, searchKeys = [], emptyTitle = "No data found", emptyDesc }) {
  const [search, setSearch] = useState("");

  const filtered = data.filter(row =>
    searchKeys.length === 0 || searchKeys.some(key => String(row[key] ?? "").toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <div className="w-full max-w-sm">
          <Input
            icon={Search}
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card">
        {filtered.length === 0 ? (
          <div className="p-8">
            <EmptyState title={emptyTitle} description={emptyDesc} />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(col => (
                  <TableHead key={col.key}>{col.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row, i) => (
                <TableRow key={row._id || i}>
                  {columns.map(col => (
                    <TableCell key={col.key}>
                      {col.render ? col.render(row) : row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
