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
  { key: "is_active", label: "Active", type: "boolean" },
];

export default function HumorFlavorsPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = createClient();
    sb.from("humor_flavors").select("*").order("id")
      .then(({ data }) => { setRows(data ?? []); setLoading(false); });
  }, []);

  return (
    <AdminLayout>
      <CrudTable title="Humor Flavors" columns={COLUMNS} rows={rows} loading={loading} readOnly />
    </AdminLayout>
  );
}