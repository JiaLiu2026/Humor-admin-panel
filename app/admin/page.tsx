"use client";

import AdminLayout from "@/components/AdminLayout";

const SECTIONS = [
  { label: "Users", href: "/admin/users", icon: "👤", desc: "Read profiles" },
  { label: "Images", href: "/admin/images", icon: "🖼", desc: "CRUD + upload" },
  { label: "Captions", href: "/admin/captions", icon: "💬", desc: "Read captions" },
  { label: "Caption Requests", href: "/admin/caption-requests", icon: "📥", desc: "Read requests" },
  { label: "Caption Examples", href: "/admin/caption-examples", icon: "📝", desc: "CRUD" },
  { label: "Humor Flavors", href: "/admin/humor-flavors", icon: "🎭", desc: "Read flavors" },
  { label: "Humor Flavor Steps", href: "/admin/humor-flavor-steps", icon: "🪜", desc: "Read steps" },
  { label: "Humor Mix", href: "/admin/humor-mix", icon: "🎛", desc: "Read / update" },
  { label: "Terms", href: "/admin/terms", icon: "📖", desc: "CRUD" },
  { label: "LLM Models", href: "/admin/llm-models", icon: "🤖", desc: "CRUD" },
  { label: "LLM Providers", href: "/admin/llm-providers", icon: "🏭", desc: "CRUD" },
  { label: "LLM Prompt Chains", href: "/admin/llm-prompt-chains", icon: "🔗", desc: "Read" },
  { label: "LLM Responses", href: "/admin/llm-responses", icon: "📨", desc: "Read" },
  { label: "Signup Domains", href: "/admin/signup-domains", icon: "🌐", desc: "CRUD" },
  { label: "Whitelisted Emails", href: "/admin/whitelisted-emails", icon: "✉️", desc: "CRUD" },
];

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "#fff", letterSpacing: "-0.03em" }}>
          Admin Panel
        </h1>
        <p style={{ color: "#2e4050", fontSize: "0.75rem", marginTop: 6, fontFamily: "'DM Mono', monospace" }}>
          almostcrackd.ai · domain model
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
        {SECTIONS.map(({ label, href, icon, desc }) => (
          <a key={href} href={href} style={{
            display: "block", background: "#0a0d12", border: "1px solid #141820",
            borderRadius: 12, padding: "20px", textDecoration: "none",
            transition: "border-color 0.2s",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2a4050")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#141820")}
          >
            <div style={{ fontSize: "1.5rem", marginBottom: 10 }}>{icon}</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#c8d0dc", marginBottom: 4 }}>
              {label}
            </div>
            <div style={{ fontSize: "0.65rem", color: "#2e4050", fontFamily: "'DM Mono', monospace" }}>{desc}</div>
          </a>
        ))}
      </div>
    </AdminLayout>
  );
}