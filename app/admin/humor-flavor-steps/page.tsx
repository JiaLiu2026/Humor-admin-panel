"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import CrudTable, { Column } from "@/components/CrudTable";
import { createClient } from "@/lib/supabase-browser";

const COLUMNS: Column[] = [
  { key: "id", label: "ID" },
  { key: "humor_flavor_id", label: "Flavor ID" },
  { key: "step_order", label: "Order" },
  { key: "instruction", label: "Instruction" },
  { key: "humor_flavor_step_type_id", label: "Step Type ID" },
];

export default function HumorFlavorStepsPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = createClient();
    sb.from("humor_flavor_steps").select("*").order("humor_flavor_id")
      .then(({ data }) => { setRows(data ?? []); setLoading(false); });
  }, []);

  return (
    <AdminLayout>
      <CrudTable title="Humor Flavor Steps" columns={COLUMNS} rows={rows} loading={loading} readOnly />
    </AdminLayout>
  );
}