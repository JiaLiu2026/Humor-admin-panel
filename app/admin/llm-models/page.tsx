"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import CrudTable, { Column } from "@/components/CrudTable";
import { createClient } from "@/lib/supabase-browser";

const COLUMNS: Column[] = [
  { key: "id", label: "ID" },
  { key: "created_datetime_utc", label: "Created" },
  { key: "name", label: "Name", editable: true },
  { key: "model_string", label: "Model String", editable: true },
  { key: "llm_provider_id", label: "Provider ID", editable: true, type: "number" },
  { key: "is_active", label: "Active", editable: true, type: "boolean" },
  { key: "context_window", label: "Context Window", editable: true, type: "number" },
];

export default function LlmModelsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const sb = createClient();

  const load = async () => {
    setLoading(true);
    const { data } = await sb.from("llm_models").select("*").order("id");
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (data: Record<string, string>) => {
    await sb.from("llm_models").insert(data);
    await load();
  };

  const handleUpdate = async (id: unknown, data: Record<string, unknown>) => {
    await sb.from("llm_models").update(data).eq("id", id);
    await load();
  };

  const handleDelete = async (id: unknown) => {
    await sb.from("llm_models").delete().eq("id", id);
    await load();
  };

  return (
    <AdminLayout>
      <CrudTable
        title="LLM Models"
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