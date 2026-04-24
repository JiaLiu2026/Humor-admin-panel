"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import FlavorEditor from "./FlavorEditor";

type Flavor = { id: number; description: string; slug: string; created_datetime_utc: string };

const s = {
  btn: (v: "primary" | "danger" | "ghost" = "ghost"): React.CSSProperties => ({
    padding: "7px 14px", borderRadius: 7, border: "none", cursor: "pointer",
    fontSize: "0.7rem", fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em",
    background: v === "primary" ? "#4a90a4" : v === "danger" ? "rgba(180,60,60,0.12)" : "#111820",
    color: v === "primary" ? "#fff" : v === "danger" ? "#c07070" : "#5a7080",
  }),
  input: { background: "#0a0d12", border: "1px solid #1e2530", borderRadius: 6, color: "#c8d0dc", padding: "8px 12px", fontSize: "0.75rem", fontFamily: "'DM Mono', monospace", width: "100%", outline: "none" } as React.CSSProperties,
  card: { background: "#0a0d12", border: "1px solid #141820", borderRadius: 12, padding: "20px 24px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center", transition: "border-color 0.2s" } as React.CSSProperties,
  label: { fontSize: "0.6rem", color: "#2e4050", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 4 } as React.CSSProperties,
};

export default function FlavorList() {
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Flavor | null>(null);
  const [adding, setAdding] = useState(false);
  const [newFlavor, setNewFlavor] = useState({ description: "", slug: "" });
  const sb = createClient();

  const load = async () => {
    setLoading(true);
    const { data } = await sb.from("humor_flavors").select("*").order("id");
    setFlavors(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!newFlavor.slug || !newFlavor.description) return;
    await sb.from("humor_flavors").insert(newFlavor);
    setAdding(false);
    setNewFlavor({ description: "", slug: "" });
    await load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this humor flavor and all its steps?")) return;
    await sb.from("humor_flavor_steps").delete().eq("humor_flavor_id", id);
    await sb.from("humor_flavors").delete().eq("id", id);
    if (selected?.id === id) setSelected(null);
    await load();
  };

  const handleDuplicate = async (flavor: Flavor) => {
    // Generate a unique slug
    const existingSlugs = new Set(flavors.map((f) => f.slug));
    let suffix = 1;
    let newSlug = `${flavor.slug}-copy`;
    while (existingSlugs.has(newSlug)) {
      suffix++;
      newSlug = `${flavor.slug}-copy-${suffix}`;
    }

    // Create the new flavor
    const { data: newFlavor, error: flavorErr } = await sb
      .from("humor_flavors")
      .insert({ slug: newSlug, description: `${flavor.description} (copy)` })
      .select("id")
      .single();

    if (flavorErr || !newFlavor) {
      alert("Failed to duplicate flavor: " + (flavorErr?.message ?? "unknown error"));
      return;
    }

    // Copy all steps from the original flavor
    const { data: steps } = await sb
      .from("humor_flavor_steps")
      .select("*")
      .eq("humor_flavor_id", flavor.id)
      .order("order_by");

    if (steps && steps.length > 0) {
      const newSteps = steps.map(({ id, humor_flavor_id, ...rest }: any) => ({
        ...rest,
        humor_flavor_id: newFlavor.id,
      }));
      const { error: stepsErr } = await sb.from("humor_flavor_steps").insert(newSteps);
      if (stepsErr) {
        alert("Flavor duplicated but some steps failed to copy: " + stepsErr.message);
      }
    }

    await load();
  };

  const handleUpdate = async (id: number, data: Partial<Flavor>) => {
    await sb.from("humor_flavors").update(data).eq("id", id);
    await load();
  };

  if (selected) return (
    <FlavorEditor
      flavor={selected}
      onBack={() => { setSelected(null); load(); }}
      onUpdate={(data) => handleUpdate(selected.id, data)}
    />
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.6rem", color: "#fff", letterSpacing: "-0.03em" }}>
            Humor Flavors
          </h1>
          <div style={{ fontSize: "0.7rem", color: "#2e4050", marginTop: 4 }}>{flavors.length} flavors</div>
        </div>
        <button style={s.btn("primary")} onClick={() => setAdding(true)}>+ New Flavor</button>
      </div>

      {adding && (
        <div style={{ background: "#0a0d12", border: "1px solid #1e2530", borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ fontSize: "0.7rem", color: "#4a90a4", marginBottom: 16, letterSpacing: "0.08em" }}>NEW HUMOR FLAVOR</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <div style={s.label}>Slug</div>
              <input style={s.input} placeholder="e.g. dry-wit" value={newFlavor.slug}
                onChange={(e) => setNewFlavor((p) => ({ ...p, slug: e.target.value }))} />
            </div>
            <div>
              <div style={s.label}>Description</div>
              <input style={s.input} placeholder="e.g. Dry, understated humor" value={newFlavor.description}
                onChange={(e) => setNewFlavor((p) => ({ ...p, description: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={s.btn("primary")} onClick={handleAdd}>Create Flavor</button>
            <button style={s.btn()} onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </div>
      )}

      {loading && <div style={{ color: "#2e4050", fontSize: "0.72rem", padding: 20 }}>Loading...</div>}

      {flavors.map((f) => (
        <FlavorCard key={f.id} flavor={f}
          onEdit={() => setSelected(f)}
          onDelete={() => handleDelete(f.id)}
          onDuplicate={() => handleDuplicate(f)}
          onUpdate={(data) => handleUpdate(f.id, data)}
        />
      ))}
    </div>
  );
}

function FlavorCard({ flavor, onEdit, onDelete, onDuplicate, onUpdate }: {
  flavor: Flavor;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onUpdate: (data: Partial<Flavor>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [form, setForm] = useState({ description: flavor.description, slug: flavor.slug });

  const save = () => { onUpdate(form); setEditing(false); };

  return (
    <div style={s.card}>
      {editing ? (
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={s.label}>Slug</div>
            <input style={s.input} value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} />
          </div>
          <div>
            <div style={s.label}>Description</div>
            <input style={s.input} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </div>
          <div style={{ display: "flex", gap: 8, gridColumn: "span 2" }}>
            <button style={s.btn("primary")} onClick={save}>Save</button>
            <button style={s.btn()} onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "#fff", marginBottom: 4 }}>
              {flavor.slug}
            </div>
            <div style={{ fontSize: "0.72rem", color: "#4a5568" }}>{flavor.description || "—"}</div>
            <div style={{ fontSize: "0.62rem", color: "#2e4050", marginTop: 6 }}>ID: {flavor.id}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={s.btn()} onClick={() => setEditing(true)}>Edit</button>
            <button style={s.btn()} disabled={duplicating} onClick={async () => { setDuplicating(true); await onDuplicate(); setDuplicating(false); }}>
              {duplicating ? "Duplicating..." : "Duplicate"}
            </button>
            <button style={s.btn("primary")} onClick={onEdit}>Manage Steps →</button>
            <button style={s.btn("danger")} onClick={onDelete}>Delete</button>
          </div>
        </>
      )}
    </div>
  );
}
