"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import CrudTable, { Column } from "@/components/CrudTable";
import { createClient } from "@/lib/supabase-browser";

const COLUMNS: Column[] = [
  { key: "id", label: "ID" },
  { key: "created_datetime_utc", label: "Created" },
  { key: "email", label: "Email" },
  { key: "username", label: "Username" },
  { key: "full_name", label: "Full Name" },
];

export default function UsersPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = createClient();
    sb.from("profiles").select("*").order("created_datetime_utc", { ascending: false })
      .then(({ data }) => { setRows(data ?? []); setLoading(false); });
  }, []);

  return (
    <AdminLayout>
      <CrudTable title="Users" columns={COLUMNS} rows={rows} loading={loading} readOnly />
    </AdminLayout>
  );
}