"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: "⬛" },
  { label: "Users", href: "/admin/users", icon: "👤" },
  { label: "Images", href: "/admin/images", icon: "🖼" },
  { label: "Captions", href: "/admin/captions", icon: "💬" },
  { label: "Caption Requests", href: "/admin/caption-requests", icon: "📥" },
  { label: "Caption Examples", href: "/admin/caption-examples", icon: "📝" },
  { label: "Humor Flavors", href: "/admin/humor-flavors", icon: "🎭" },
  { label: "Humor Flavor Steps", href: "/admin/humor-flavor-steps", icon: "🪜" },
  { label: "Humor Mix", href: "/admin/humor-mix", icon: "🎛" },
  { label: "Terms", href: "/admin/terms", icon: "📖" },
  { label: "LLM Models", href: "/admin/llm-models", icon: "🤖" },
  { label: "LLM Providers", href: "/admin/llm-providers", icon: "🏭" },
  { label: "LLM Prompt Chains", href: "/admin/llm-prompt-chains", icon: "🔗" },
  { label: "LLM Responses", href: "/admin/llm-responses", icon: "📨" },
  { label: "Signup Domains", href: "/admin/signup-domains", icon: "🌐" },
  { label: "Whitelisted Emails", href: "/admin/whitelisted-emails", icon: "✉️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'DM Mono', monospace", background: "#07090d", color: "#c8d0dc" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@600;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #07090d; }
        ::-webkit-scrollbar-thumb { background: #1e2530; border-radius: 2px; }
        a { text-decoration: none; color: inherit; }
      `}</style>

      <aside style={{
        width: 220, minWidth: 220, background: "#0a0d12", borderRight: "1px solid #141820",
        display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflowY: "auto"
      }}>
        <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid #141820" }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1rem", color: "#fff", letterSpacing: "-0.02em" }}>
            humor<span style={{ color: "#4a90a4" }}>admin</span>
          </div>
          <div style={{ fontSize: "0.6rem", color: "#2e4050", marginTop: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            almostcrackd.ai
          </div>
        </div>
        <nav style={{ flex: 1, padding: "12px 10px" }}>
          {NAV.map(({ label, href, icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                borderRadius: 7, marginBottom: 2, fontSize: "0.72rem", letterSpacing: "0.04em",
                background: active ? "#111820" : "transparent",
                color: active ? "#4a90a4" : "#4a5568",
                borderLeft: active ? "2px solid #4a90a4" : "2px solid transparent",
                transition: "all 0.15s",
              }}>
                <span style={{ fontSize: "0.85rem" }}>{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main style={{ flex: 1, overflowY: "auto", padding: "32px 36px" }}>
        {children}
      </main>
    </div>
  );
}