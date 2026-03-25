"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import CrudTable, { Column } from "@/components/CrudTable";
import { createClient } from "@/lib/supabase-browser";

const COLUMNS: Column[] = [
  { key: "id", label: "ID" },
  { key: "profile_id", label: "Profile ID" },
  { key: "humor_flavor_id", label: "Flavor ID" },
  { key: "weight", label: "Weight", editable: true, type: "number" },
  { key: "modified_datetime_utc", label: "Modified" },
];

export default function HumorMixPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const sb = createClient();

  const load = async () => {
    setLoading(true);
    const { data } = await sb.from("humor_flavor_mix").select("*").order("id");
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleUpdate = async (id: unknown, data: Record<string, unknown>) => {
    await sb.from("humor_flavor_mix").update({ weight: Number(data.weight) }).eq("id", id);
    await load();
  };

  return (
    <AdminLayout>
      <CrudTable
        title="Humor Mix"
        columns={COLUMNS}
        rows={rows}
        loading={loading}
        onUpdate={handleUpdate}
      />
    </AdminLayout>
  );
}