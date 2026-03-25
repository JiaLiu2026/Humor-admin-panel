"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import CrudTable, { Column } from "@/components/CrudTable";
import { createClient } from "@/lib/supabase-browser";

const COLUMNS: Column[] = [
  { key: "id", label: "ID" },
  { key: "created_datetime_utc", label: "Created" },
  { key: "name", label: "Name", editable: true },
  { key: "definition", label: "Definition", editable: true, type: "textarea" },
  { key: "term_type_id", label: "Type ID", editable: true, type: "number" },
];

export default function TermsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const sb = createClient();

  const load = async () => {
    setLoading(true);
    const { data } = await sb.from("terms").select("*").order("created_datetime_utc", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (data: Record<string, string>) => {
    await sb.from("terms").insert(data);
    await load();
  };

  const handleUpdate = async (id: unknown, data: Record<string, unknown>) => {
    await sb.from("terms").update(data).eq("id", id);
    await load();
  };

  const handleDelete = async (id: unknown) => {
    await sb.from("terms").delete().eq("id", id);
    await load();
  };

  return (
    <AdminLayout>
      <CrudTable
        title="Terms"
        columns={COLUMNS}
        rows={rows}
        loading={loading}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </AdminLayout>
  );
}