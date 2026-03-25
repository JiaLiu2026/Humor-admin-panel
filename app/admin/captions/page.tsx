"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import CrudTable, { Column } from "@/components/CrudTable";
import { createClient } from "@/lib/supabase-browser";

const COLUMNS: Column[] = [
  { key: "id", label: "ID" },
  { key: "created_datetime_utc", label: "Created" },
  { key: "content", label: "Content" },
  { key: "is_public", label: "Public", type: "boolean" },
  { key: "is_featured", label: "Featured", type: "boolean" },
  { key: "like_count", label: "Likes" },
  { key: "humor_flavor_id", label: "Flavor ID" },
  { key: "image_id", label: "Image ID" },
  { key: "profile_id", label: "Profile ID" },
];

export default function CaptionsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = createClient();
    sb.from("captions").select("*").order("created_datetime_utc", { ascending: false }).limit(200)
      .then(({ data }) => { setRows(data ?? []); setLoading(false); });
  }, []);

  return (
    <AdminLayout>
      <CrudTable title="Captions" columns={COLUMNS} rows={rows} loading={loading} readOnly />
    </AdminLayout>
  );
}