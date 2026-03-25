"use client";

import { useState } from "react";

export type Column = {
  key: string;
  label: string;
  editable?: boolean;
  type?: "text" | "boolean" | "number" | "textarea";
};

type Props = {
  title: string;
  columns: Column[];
  rows: Record<string, unknown>[];
  onAdd?: (data: Record<string, string>) => Promise<void>;
  onUpdate?: (id: unknown, data: Record<string, unknown>) => Promise<void>;
  onDelete?: (id: unknown) => Promise<void>;
  loading?: boolean;
  idKey?: string;
  readOnly?: boolean;
};

const cell: React.CSSProperties = {
  padding: "10px 14px", fontSize: "0.72rem", color: "#8090a0",
  borderBottom: "1px solid #111820", whiteSpace: "nowrap", overflow: "hidden",
  textOverflow: "ellipsis", maxWidth: 220,
};

const hCell: React.CSSProperties = {
  ...cell, color: "#2e4050", fontSize: "0.62rem", letterSpacing: "0.1em",
  textTransform: "uppercase", fontWeight: 500, borderBottom: "1px solid #141820",
};

const btn = (variant: "primary" | "danger" | "ghost" = "ghost"): React.CSSProperties => ({
  padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer",
  fontSize: "0.68rem", fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em",
  background: variant === "primary" ? "#4a90a4" : variant === "danger" ? "rgba(180,60,60,0.15)" : "#111820",
  color: variant === "primary" ? "#fff" : variant === "danger" ? "#c07070" : "#5a7080",
  transition: "opacity 0.15s",
});

const input: React.CSSProperties = {
  background: "#0a0d12", border: "1px solid #1e2530", borderRadius: 6,
  color: "#c8d0dc", padding: "6px 10px", fontSize: "0.72rem",
  fontFamily: "'DM Mono', monospace", width: "100%", outline: "none",
};

export default function CrudTable({
  title, columns, rows, onAdd, onUpdate, onDelete,
  loading, idKey = "id", readOnly = false,
}: Props) {
  const [editId, setEditId] = useState<unknown>(null);
  const [editData, setEditData] = useState<Record<string, unknown>>({});
  const [adding, setAdding] = useState(false);
  const [newData, setNewData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const editableCols = columns.filter((c) => c.editable);

  const startEdit = (row: Record<string, unknown>) => {
    setEditId(row[idKey]);
    const d: Record<string, unknown> = {};
    editableCols.forEach((c) => { d[c.key] = row[c.key] ?? ""; });
    setEditData(d);
  };

  const saveEdit = async () => {
    if (!onUpdate) return;
    setSaving(true);
    await onUpdate(editId, editData);
    setSaving(false);
    setEditId(null);
  };

  const saveNew = async () => {
    if (!onAdd) return;
    setSaving(true);
    await onAdd(newData);
    setSaving(false);
    setAdding(false);
    setNewData({});
  };

  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#fff" }}>{title}</div>
          <div style={{ fontSize: "0.65rem", color: "#2e4050", marginTop: 2 }}>{rows.length} records</div>
        </div>
        {!readOnly && onAdd && (
          <button style={btn("primary")} onClick={() => setAdding(true)}>+ Add New</button>
        )}
      </div>

      {loading && <div style={{ color: "#2e4050", fontSize: "0.72rem", padding: "20px 0" }}>Loading...</div>}

      {adding && (
        <div style={{ background: "#0a0d12", border: "1px solid #1e2530", borderRadius: 10, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: "0.7rem", color: "#4a90a4", marginBottom: 14, letterSpacing: "0.08em" }}>NEW RECORD</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {editableCols.map((c) => (
              <div key={c.key}>
                <div style={{ fontSize: "0.6rem", color: "#2e4050", marginBottom: 4, letterSpacing: "0.08em", textTransform: "uppercase" }}>{c.label}</div>
                {c.type === "textarea" ? (
                  <textarea style={{ ...input, height: 80, resize: "vertical" }}
                    value={newData[c.key] ?? ""}
                    onChange={(e) => setNewData((p) => ({ ...p, [c.key]: e.target.value }))} />
                ) : (
                  <input style={input} type={c.type === "number" ? "number" : "text"}
                    value={newData[c.key] ?? ""}
                    onChange={(e) => setNewData((p) => ({ ...p, [c.key]: e.target.value }))} />
                )}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button style={btn("primary")} onClick={saveNew} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
            <button style={btn()} onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #141820" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {columns.map((c) => <th key={c.key} style={hCell}>{c.label}</th>)}
              {!readOnly && (onUpdate || onDelete) && <th style={hCell}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isEditing = editId === row[idKey];
              return (
                <tr key={i} style={{ background: isEditing ? "#0c1018" : "transparent" }}>
                  {columns.map((c) => (
                    <td key={c.key} style={cell}>
                      {isEditing && c.editable ? (
                        c.type === "boolean" ? (
                          <input type="checkbox" checked={!!editData[c.key]}
                            onChange={(e) => setEditData((p) => ({ ...p, [c.key]: e.target.checked }))} />
                        ) : c.type === "textarea" ? (
                          <textarea style={{ ...input, height: 60, resize: "vertical" }}
                            value={String(editData[c.key] ?? "")}
                            onChange={(e) => setEditData((p) => ({ ...p, [c.key]: e.target.value }))} />
                        ) : (
                          <input style={input} value={String(editData[c.key] ?? "")}
                            onChange={(e) => setEditData((p) => ({ ...p, [c.key]: e.target.value }))} />
                        )
                      ) : (
                        <span title={String(row[c.key] ?? "")}>
                          {c.type === "boolean"
                            ? (row[c.key] ? "✓" : "✗")
                            : String(row[c.key] ?? "—").slice(0, 60)}
                        </span>
                      )}
                    </td>
                  ))}
                  {!readOnly && (onUpdate || onDelete) && (
                    <td style={{ ...cell, whiteSpace: "nowrap" }}>
                      {isEditing ? (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button style={btn("primary")} onClick={saveEdit} disabled={saving}>{saving ? "..." : "Save"}</button>
                          <button style={btn()} onClick={() => setEditId(null)}>Cancel</button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: 6 }}>
                          {onUpdate && <button style={btn()} onClick={() => startEdit(row)}>Edit</button>}
                          {onDelete && (
                            <button style={btn("danger")} onClick={() => {
                              if (confirm("Delete this record?")) onDelete(row[idKey]);
                            }}>Del</button>
                          )}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
            {rows.length === 0 && !loading && (
              <tr>
                <td colSpan={columns.length + 1} style={{ ...cell, textAlign: "center", color: "#1e2530", padding: 32 }}>
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}