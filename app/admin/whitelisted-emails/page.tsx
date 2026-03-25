"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import CrudTable, { Column } from "@/components/CrudTable";
import { createClient } from "@/lib/supabase-browser";

const COLUMNS: Column[] = [
  { key: "id", label: "ID" },
  { key: "created_datetime_utc", label: "Created" },
  { key: "email", label: "Email", editable: true },
];

export default function WhitelistedEmailsPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const sb = createClient();

  const load = async () => {
    setLoading(true);
    const { data } = await sb.from("whitelist_email_addresses").select("*").order("id");
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (data: Record<string, string>) => {
    await sb.from("whitelist_email_addresses").insert({ email: data.email });
    await load();
  };

  const handleUpdate = async (id: unknown, data: Record<string, unknown>) => {
    await sb.from("whitelist_email_addresses").update({ email: data.email }).eq("id", id);
    await load();
  };

  const handleDelete = async (id: unknown) => {
    await sb.from("whitelist_email_addresses").delete().eq("id", id);
    await load();
  };

  return (
    <AdminLayout>
      <CrudTable
        title="Whitelisted Emails"
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