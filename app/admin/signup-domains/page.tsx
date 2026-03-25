"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import CrudTable, { Column } from "@/components/CrudTable";
import { createClient } from "@/lib/supabase-browser";

const COLUMNS: Column[] = [
  { key: "id", label: "ID" },
  { key: "created_datetime_utc", label: "Created" },
  { key: "apex_domain", label: "Domain", editable: true },
];

export default function SignupDomainsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const sb = createClient();

  const load = async () => {
    setLoading(true);
    const { data } = await sb.from("allowed_signup_domains").select("*").order("id");
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (data: Record<string, string>) => {
    await sb.from("allowed_signup_domains").insert({ apex_domain: data.apex_domain });
    await load();
  };

  const handleUpdate = async (id: unknown, data: Record<string, unknown>) => {
    await sb.from("allowed_signup_domains").update({ apex_domain: data.apex_domain }).eq("id", id);
    await load();
  };

  const handleDelete = async (id: unknown) => {
    await sb.from("allowed_signup_domains").delete().eq("id", id);
    await load();
  };

  return (
    <AdminLayout>
      <CrudTable
        title="Allowed Signup Domains"
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