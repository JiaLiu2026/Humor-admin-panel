"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import CrudTable, { Column } from "@/components/CrudTable";
import { createClient } from "@/lib/supabase-browser";

const COLUMNS: Column[] = [
  { key: "id", label: "ID" },
  { key: "image_description", label: "Image Description", editable: true, type: "textarea" },
  { key: "caption", label: "Caption", editable: true, type: "textarea" },
  { key: "explanation", label: "Explanation", editable: true, type: "textarea" },
  { key: "priority", label: "Priority", editable: true, type: "number" },
  { key: "image_id", label: "Image ID", editable: true },
];

export default function CaptionExamplesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const sb = createClient();

  const load = async () => {
    setLoading(true);
    const { data } = await sb.from("caption_examples").select("*").order("priority");
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (data: Record<string, string>) => {
    await sb.from("caption_examples").insert({ ...data, priority: Number(data.priority) });
    await load();
  };

  const handleUpdate = async (id: unknown, data: Record<string, unknown>) => {
    await sb.from("caption_examples").update({ ...data, priority: Number(data.priority) }).eq("id", id);
    await load();
  };

  const handleDelete = async (id: unknown) => {
    await sb.from("caption_examples").delete().eq("id", id);
    await load();
  };

  return (
    <AdminLayout>
      <CrudTable
        title="Caption Examples"
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