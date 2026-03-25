"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import CrudTable, { Column } from "@/components/CrudTable";
import { createClient } from "@/lib/supabase-browser";

const COLUMNS: Column[] = [
  { key: "id", label: "ID" },
  { key: "created_datetime_utc", label: "Created" },
  { key: "name", label: "Name" },
  { key: "description", label: "Description" },
  { key: "llm_model_id", label: "Model ID" },
  { key: "is_active", label: "Active", type: "boolean" },
];

export default function LlmPromptChainsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = createClient();
    sb.from("llm_prompt_chains").select("*").order("id")
      .then(({ data }) => { setRows(data ?? []); setLoading(false); });
  }, []);

  return (
    <AdminLayout>
      <CrudTable title="LLM Prompt Chains" columns={COLUMNS} rows={rows} loading={loading} readOnly />
    </AdminLayout>
  );
}