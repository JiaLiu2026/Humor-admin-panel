"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

const API_BASE = "https://api.almostcrackd.ai";

type Flavor = { id: number; description: string; slug: string };
type Step = {
  id: number; humor_flavor_id: number; order_by: number;
  description: string; llm_system_prompt: string; llm_user_prompt: string;
  llm_model_id: number | null; llm_temperature: number | null;
};
type Caption = { id: string; content: string; [key: string]: unknown };

const s = {
  btn: (v: "primary" | "danger" | "ghost" | "accent" = "ghost"): React.CSSProperties => ({
    padding: "7px 14px", borderRadius: 7, border: "none", cursor: "pointer",
    fontSize: "0.7rem", fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em",
    background: v === "primary" ? "#4a90a4" : v === "danger" ? "rgba(180,60,60,0.12)" : v === "accent" ? "#2a5540" : "#111820",
    color: v === "primary" ? "#fff" : v === "danger" ? "#c07070" : v === "accent" ? "#4ac480" : "#5a7080",
  }),
  input: { background: "#080b10", border: "1px solid #1e2530", borderRadius: 6, color: "#c8d0dc", padding: "8px 12px", fontSize: "0.72rem", fontFamily: "'DM Mono', monospace", width: "100%", outline: "none" } as React.CSSProperties,
  textarea: { background: "#080b10", border: "1px solid #1e2530", borderRadius: 6, color: "#c8d0dc", padding: "8px 12px", fontSize: "0.72rem", fontFamily: "'DM Mono', monospace", width: "100%", outline: "none", resize: "vertical" as const, minHeight: 80 },
  label: { fontSize: "0.6rem", color: "#2e4050", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 4, display: "block" },
  card: { background: "#0a0d12", border: "1px solid #141820", borderRadius: 10, padding: "18px 20px", marginBottom: 10 } as React.CSSProperties,
  section: { marginBottom: 40 } as React.CSSProperties,
  sectionTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#fff", marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid #141820" } as React.CSSProperties,
};

export default function FlavorEditor({ flavor, onBack, onUpdate }: {
  flavor: Flavor;
  onBack: () => void;
  onUpdate: (data: Partial<Flavor>) => void;
}) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingStep, setAddingStep] = useState(false);
  const [newStep, setNewStep] = useState({ description: "", llm_system_prompt: "", llm_user_prompt: "", llm_temperature: "0.7" });
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState("");
  const [editingFlavor, setEditingFlavor] = useState(false);
  const [flavorForm, setFlavorForm] = useState({ description: flavor.description, slug: flavor.slug });
  const sb = createClient();

  const loadSteps = async () => {
    setLoading(true);
    const { data } = await sb.from("humor_flavor_steps")
      .select("*").eq("humor_flavor_id", flavor.id).order("order_by");
    setSteps(data ?? []);
    setLoading(false);
  };

  useEffect(() => { loadSteps(); }, []);

  const loadCaptions = async () => {
    const { data } = await sb.from("captions")
      .select("*").eq("humor_flavor_id", flavor.id)
      .order("created_datetime_utc", { ascending: false }).limit(10);
    setCaptions(data ?? []);
  };

  useEffect(() => { loadCaptions(); }, []);

  const handleAddStep = async () => {
    const nextOrder = steps.length > 0 ? Math.max(...steps.map((s) => s.order_by)) + 1 : 1;
    await sb.from("humor_flavor_steps").insert({
      humor_flavor_id: flavor.id,
      order_by: nextOrder,
      description: newStep.description,
      llm_system_prompt: newStep.llm_system_prompt,
      llm_user_prompt: newStep.llm_user_prompt,
      llm_temperature: parseFloat(newStep.llm_temperature) || 0.7,
    });
    setAddingStep(false);
    setNewStep({ description: "", llm_system_prompt: "", llm_user_prompt: "", llm_temperature: "0.7" });
    await loadSteps();
  };

  const handleDeleteStep = async (id: number) => {
    if (!confirm("Delete this step?")) return;
    await sb.from("humor_flavor_steps").delete().eq("id", id);
    await loadSteps();
  };

  const handleUpdateStep = async (id: number, data: Partial<Step>) => {
    await sb.from("humor_flavor_steps").update(data).eq("id", id);
    await loadSteps();
  };

  const handleMoveStep = async (step: Step, direction: "up" | "down") => {
    const idx = steps.findIndex((s) => s.id === step.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= steps.length) return;
    const swap = steps[swapIdx];
    await sb.from("humor_flavor_steps").update({ order_by: swap.order_by }).eq("id", step.id);
    await sb.from("humor_flavor_steps").update({ order_by: step.order_by }).eq("id", swap.id);
    await loadSteps();
  };

  const handleTest = async () => {
    setTesting(true);
    setTestMsg("Getting session...");
    try {
      const { data: { session } } = await sb.auth.getSession();
      const token = session?.access_token;
      setTestMsg("Finding test image...");
      const { data: images } = await sb.from("images").select("id").limit(1);
      if (!images?.length) { setTestMsg("No images found in database"); setTesting(false); return; }
      const imageId = images[0].id;
      setTestMsg("Generating captions...");
      const res = await fetch(`${API_BASE}/pipeline/generate-captions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ imageId, humorFlavorId: flavor.id }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setCaptions(Array.isArray(data) ? data : [data]);
      setTestMsg("Done!");
    } catch (err) {
      setTestMsg(err instanceof Error ? err.message : "Failed");
    }
    setTesting(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <button style={{ ...s.btn(), marginBottom: 16 }} onClick={onBack}>← Back to Flavors</button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.6rem", color: "#fff", letterSpacing: "-0.03em" }}>
              {flavor.slug}
            </h1>
            <div style={{ fontSize: "0.72rem", color: "#4a5568", marginTop: 4 }}>{flavor.description}</div>
          </div>
          <button style={s.btn()} onClick={() => setEditingFlavor(!editingFlavor)}>Edit Flavor Info</button>
        </div>
      </div>

      {editingFlavor && (
        <div style={{ ...s.card, marginBottom: 28, border: "1px solid #1e2530" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div><label style={s.label}>Slug</label>
              <input style={s.input} value={flavorForm.slug} onChange={(e) => setFlavorForm((p) => ({ ...p, slug: e.target.value }))} />
            </div>
            <div><label style={s.label}>Description</label>
              <input style={s.input} value={flavorForm.description} onChange={(e) => setFlavorForm((p) => ({ ...p, description: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={s.btn("primary")} onClick={() => { onUpdate(flavorForm); setEditingFlavor(false); }}>Save</button>
            <button style={s.btn()} onClick={() => setEditingFlavor(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={s.section}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", ...s.sectionTitle }}>
          <span>Steps ({steps.length})</span>
          <button style={s.btn("primary")} onClick={() => setAddingStep(true)}>+ Add Step</button>
        </div>

        {loading && <div style={{ color: "#2e4050", fontSize: "0.72rem" }}>Loading steps...</div>}

        {addingStep && (
          <div style={{ ...s.card, border: "1px solid #1e2530", marginBottom: 16 }}>
            <div style={{ fontSize: "0.7rem", color: "#4a90a4", marginBottom: 16, letterSpacing: "0.08em" }}>NEW STEP</div>
            <div style={{ display: "grid", gap: 12 }}>
              <div><label style={s.label}>Description</label>
                <input style={s.input} placeholder="What this step does" value={newStep.description}
                  onChange={(e) => setNewStep((p) => ({ ...p, description: e.target.value }))} />
              </div>
              <div><label style={s.label}>System Prompt</label>
                <textarea style={s.textarea} placeholder="You are a comedy writer..." value={newStep.llm_system_prompt}
                  onChange={(e) => setNewStep((p) => ({ ...p, llm_system_prompt: e.target.value }))} />
              </div>
              <div><label style={s.label}>User Prompt</label>
                <textarea style={s.textarea} placeholder="Given this image: {{input}}..." value={newStep.llm_user_prompt}
                  onChange={(e) => setNewStep((p) => ({ ...p, llm_user_prompt: e.target.value }))} />
              </div>
              <div style={{ width: 120 }}><label style={s.label}>Temperature</label>
                <input style={s.input} type="number" min="0" max="2" step="0.1" value={newStep.llm_temperature}
                  onChange={(e) => setNewStep((p) => ({ ...p, llm_temperature: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button style={s.btn("primary")} onClick={handleAddStep}>Add Step</button>
              <button style={s.btn()} onClick={() => setAddingStep(false)}>Cancel</button>
            </div>
          </div>
        )}

        {steps.map((step, idx) => (
          <StepCard key={step.id} step={step} idx={idx} total={steps.length}
            onDelete={() => handleDeleteStep(step.id)}
            onUpdate={(data) => handleUpdateStep(step.id, data)}
            onMove={(dir) => handleMoveStep(step, dir)}
          />
        ))}
      </div>

      <div style={s.section}>
        <div style={s.sectionTitle}>Test Caption Generation</div>
        <div style={{ marginBottom: 16 }}>
          <button style={s.btn("accent")} onClick={handleTest} disabled={testing}>
            {testing ? testMsg : "▶ Run Test (uses first image in DB)"}
          </button>
          {testMsg && !testing && (
            <span style={{ marginLeft: 12, fontSize: "0.7rem", color: "#4a90a4" }}>{testMsg}</span>
          )}
        </div>
        {captions.length > 0 && (
          <div>
            <div style={{ fontSize: "0.65rem", color: "#2e4050", marginBottom: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {captions.length} caption{captions.length !== 1 ? "s" : ""}
            </div>
            {captions.map((c, i) => (
              <div key={c.id ?? i} style={s.card}>
                <div style={{ fontSize: "0.85rem", color: "#c8d0dc", lineHeight: 1.6 }}>
                  {typeof c.content === "string" ? c.content : JSON.stringify(c)}
                </div>
                {c.id && <div style={{ fontSize: "0.62rem", color: "#2e4050", marginTop: 8 }}>id: {c.id}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StepCard({ step, idx, total, onDelete, onUpdate, onMove }: {
  step: Step; idx: number; total: number;
  onDelete: () => void;
  onUpdate: (data: Partial<Step>) => void;
  onMove: (dir: "up" | "down") => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    description: step.description ?? "",
    llm_system_prompt: step.llm_system_prompt ?? "",
    llm_user_prompt: step.llm_user_prompt ?? "",
    llm_temperature: String(step.llm_temperature ?? "0.7"),
  });

  const save = () => { onUpdate({ ...form, llm_temperature: parseFloat(form.llm_temperature) }); setEditing(false); };

  return (
    <div style={s.card}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center", minWidth: 32 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#111820", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: "#4a90a4", fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>
            {idx + 1}
          </div>
          <button onClick={() => onMove("up")} disabled={idx === 0}
            style={{ background: "none", border: "none", cursor: idx === 0 ? "not-allowed" : "pointer", color: idx === 0 ? "#1e2530" : "#4a7080", fontSize: "0.8rem", padding: 2 }}>▲</button>
          <button onClick={() => onMove("down")} disabled={idx === total - 1}
            style={{ background: "none", border: "none", cursor: idx === total - 1 ? "not-allowed" : "pointer", color: idx === total - 1 ? "#1e2530" : "#4a7080", fontSize: "0.8rem", padding: 2 }}>▼</button>
        </div>
        <div style={{ flex: 1 }}>
          {editing ? (
            <div style={{ display: "grid", gap: 12 }}>
              <div><label style={s.label}>Description</label>
                <input style={s.input} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
              </div>
              <div><label style={s.label}>System Prompt</label>
                <textarea style={s.textarea} value={form.llm_system_prompt} onChange={(e) => setForm((p) => ({ ...p, llm_system_prompt: e.target.value }))} />
              </div>
              <div><label style={s.label}>User Prompt</label>
                <textarea style={s.textarea} value={form.llm_user_prompt} onChange={(e) => setForm((p) => ({ ...p, llm_user_prompt: e.target.value }))} />
              </div>
              <div style={{ width: 120 }}><label style={s.label}>Temperature</label>
                <input style={s.input} type="number" min="0" max="2" step="0.1" value={form.llm_temperature}
                  onChange={(e) => setForm((p) => ({ ...p, llm_temperature: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={s.btn("primary")} onClick={save}>Save</button>
                <button style={s.btn()} onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#fff", marginBottom: 8 }}>
                {step.description || `Step ${idx + 1}`}
              </div>
              {step.llm_system_prompt && (
                <div style={{ marginBottom: 6 }}>
                  <div style={s.label}>System Prompt</div>
                  <div style={{ fontSize: "0.72rem", color: "#4a5568", lineHeight: 1.5 }}>{step.llm_system_prompt.slice(0, 120)}{step.llm_system_prompt.length > 120 ? "..." : ""}</div>
                </div>
              )}
              {step.llm_user_prompt && (
                <div style={{ marginBottom: 6 }}>
                  <div style={s.label}>User Prompt</div>
                  <div style={{ fontSize: "0.72rem", color: "#4a5568", lineHeight: 1.5 }}>{step.llm_user_prompt.slice(0, 120)}{step.llm_user_prompt.length > 120 ? "..." : ""}</div>
                </div>
              )}
              {step.llm_temperature != null && (
                <div style={{ fontSize: "0.62rem", color: "#2e4050", marginTop: 6 }}>temp: {step.llm_temperature}</div>
              )}
            </>
          )}
        </div>
        {!editing && (
          <div style={{ display: "flex", gap: 6 }}>
            <button style={s.btn()} onClick={() => setEditing(true)}>Edit</button>
            <button style={s.btn("danger")} onClick={onDelete}>Del</button>
          </div>
        )}
      </div>
    </div>
  );
}