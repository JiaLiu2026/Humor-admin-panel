"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import CrudTable, { Column } from "@/components/CrudTable";
import { createClient } from "@/lib/supabase-browser";

const COLUMNS: Column[] = [
  { key: "id", label: "ID" },
  { key: "created_datetime_utc", label: "Created" },
  { key: "llm_prompt_chain_id", label: "Chain ID" },
  { key: "llm_model_id", label: "Model ID" },
  { key: "input_tokens", label: "Input Tokens" },
  { key: "output_tokens", label: "Output Tokens" },
  { key: "response_text", label: "Response" },
];

export default function LlmResponsesPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = createClient();
    sb.from("llm_model_responses").select("*").order("created_datetime_utc", { ascending: false }).limit(200)
      .then(({ data }) => { setRows(data ?? []); setLoading(false); });
  }, []);

  return (
    <AdminLayout>
      <CrudTable title="LLM Responses" columns={COLUMNS} rows={rows} loading={loading} readOnly />
    </AdminLayout>
  );
}