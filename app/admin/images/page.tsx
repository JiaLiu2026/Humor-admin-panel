"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import CrudTable, { Column } from "@/components/CrudTable";
import { createClient } from "@/lib/supabase-browser";

const API_BASE = "https://api.almostcrackd.ai";

const COLUMNS: Column[] = [
  { key: "id", label: "ID" },
  { key: "created_datetime_utc", label: "Created" },
  { key: "url", label: "URL", editable: true },
  { key: "description", label: "Description", editable: true, type: "textarea" },
  { key: "is_public", label: "Public", editable: true, type: "boolean" },
  { key: "is_common_use", label: "Common Use", editable: true, type: "boolean" },
];

export default function ImagesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");

  const sb = createClient();

  const load = async () => {
    setLoading(true);
    const { data } = await sb.from("images").select("*").order("created_datetime_utc", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg("Getting upload URL...");
    try {
      const { data: { session } } = await sb.auth.getSession();
      const token = session?.access_token;
      const presignRes = await fetch(`${API_BASE}/pipeline/generate-presigned-url`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type }),
      });
      const { presignedUrl, cdnUrl } = await presignRes.json();
      setUploadMsg("Uploading...");
      await fetch(presignedUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      setUploadMsg("Registering...");
      await fetch(`${API_BASE}/pipeline/upload-image-from-url`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false }),
      });
      setUploadMsg("Done!");
      await load();
    } catch (err) {
      setUploadMsg("Upload failed");
    }
    setUploading(false);
  };

  const handleUpdate = async (id: unknown, data: Record<string, unknown>) => {
    await sb.from("images").update(data).eq("id", id);
    await load();
  };

  const handleDelete = async (id: unknown) => {
    await sb.from("images").delete().eq("id", id);
    await load();
  };

  return (
    <AdminLayout>
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
        <label style={{
          padding: "8px 16px", background: "#4a90a4", color: "#fff", borderRadius: 8,
          cursor: uploading ? "not-allowed" : "pointer", fontSize: "0.75rem",
          fontFamily: "'DM Mono', monospace", opacity: uploading ? 0.5 : 1,
        }}>
          {uploading ? uploadMsg : "⬆ Upload Image"}
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleUpload} disabled={uploading} />
        </label>
        {uploadMsg && !uploading && (
          <span style={{ fontSize: "0.7rem", color: "#4a90a4", fontFamily: "'DM Mono', monospace" }}>{uploadMsg}</span>
        )}
      </div>
      <CrudTable
        title="Images"
        columns={COLUMNS}
        rows={rows}
        loading={loading}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        idKey="id"
      />
    </AdminLayout>
  );
}
