"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
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

type CaptionStat = {
  id: string;
  content: string | null;
  like_count: number;
  humor_flavor_id: string | null;
};

type VoteRow = {
  id: string;
  created_at?: string;
  created_datetime_utc?: string;
  vote_value?: number;
  vote?: number;
  value?: number;
};

type Stats = {
  totalCaptions: number;
  totalVotes: number;
  totalImages: number;
  totalUsers: number;
  upvotes: number;
  downvotes: number;
  topCaptions: CaptionStat[];
  recentCaptions: CaptionStat[];
  loading: boolean;
};

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <div style={{
      background: "#0a0d12",
      border: "1px solid #141820",
      borderRadius: 14,
      padding: "20px 24px",
      display: "flex",
      alignItems: "center",
      gap: 16,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: color,
        display: "grid", placeItems: "center",
        fontSize: "1.2rem",
      }}>
        {icon}
      </div>
      <div>
        <div style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800,
          fontSize: "1.4rem", color: "#fff", letterSpacing: "-0.02em",
          lineHeight: 1.1,
        }}>
          {value}
        </div>
        <div style={{
          fontSize: "0.62rem", color: "#2e4050",
          fontFamily: "'DM Mono', monospace",
          letterSpacing: "0.08em", textTransform: "uppercase",
          marginTop: 4,
        }}>
          {label}
        </div>
      </div>
    </div>
  );
}

function VoteBar({ up, down }: { up: number; down: number }) {
  const total = up + down;
  const pct = total > 0 ? Math.round((up / total) * 100) : 0;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "#4a5568", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>
        <span>{up} upvotes ({pct}%)</span>
        <span>{down} downvotes ({100 - pct}%)</span>
      </div>
      <div style={{ height: 8, background: "#141820", borderRadius: 99, overflow: "hidden", display: "flex" }}>
        <div style={{ width: `${pct}%`, background: "linear-gradient(90deg, #43aa8b, #90be6d)", borderRadius: 99, transition: "width 0.5s" }} />
        {total > 0 && <div style={{ width: `${100 - pct}%`, background: "linear-gradient(90deg, #e94560, #c1121f)", borderRadius: 99, transition: "width 0.5s" }} />}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalCaptions: 0, totalVotes: 0, totalImages: 0, totalUsers: 0,
    upvotes: 0, downvotes: 0,
    topCaptions: [], recentCaptions: [],
    loading: true,
  });

  useEffect(() => {
    async function loadStats() {
      const sb = createClient();

      // Fetch counts in parallel
      const [captionsRes, votesRes, imagesRes, usersRes, topRes, recentRes] = await Promise.all([
        sb.from("captions").select("id", { count: "exact", head: true }),
        sb.from("caption_votes").select("*").limit(1000),
        sb.from("images").select("id", { count: "exact", head: true }),
        sb.from("profiles").select("id", { count: "exact", head: true }),
        sb.from("captions").select("id, content, like_count, humor_flavor_id").order("like_count", { ascending: false }).limit(5),
        sb.from("captions").select("id, content, like_count, humor_flavor_id").order("created_datetime_utc", { ascending: false }).limit(5),
      ]);

      const votes = (votesRes.data ?? []) as VoteRow[];
      let upvotes = 0;
      let downvotes = 0;
      for (const v of votes) {
        const val = v.vote_value ?? v.vote ?? v.value ?? 0;
        if (val > 0) upvotes++;
        else if (val < 0) downvotes++;
      }

      setStats({
        totalCaptions: captionsRes.count ?? 0,
        totalVotes: votes.length,
        totalImages: imagesRes.count ?? 0,
        totalUsers: usersRes.count ?? 0,
        upvotes,
        downvotes,
        topCaptions: (topRes.data ?? []) as CaptionStat[],
        recentCaptions: (recentRes.data ?? []) as CaptionStat[],
        loading: false,
      });
    }

    loadStats();
  }, []);

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

      {/* ── Caption Rating Statistics ── */}
      <div style={{ marginBottom: 36 }}>
        <div style={{
          fontSize: "0.65rem", color: "#4a90a4", letterSpacing: "0.1em",
          textTransform: "uppercase", fontFamily: "'DM Mono', monospace",
          marginBottom: 14,
        }}>
          Caption Rating Statistics
        </div>

        {stats.loading ? (
          <div style={{ color: "#2e4050", fontSize: "0.72rem", padding: 20 }}>Loading stats...</div>
        ) : (
          <>
            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
              <StatCard label="Total Captions" value={stats.totalCaptions} icon="💬" color="rgba(74,144,164,0.15)" />
              <StatCard label="Total Votes" value={stats.totalVotes} icon="🗳" color="rgba(67,170,139,0.15)" />
              <StatCard label="Images" value={stats.totalImages} icon="🖼" color="rgba(255,161,78,0.15)" />
              <StatCard label="Users" value={stats.totalUsers} icon="👤" color="rgba(108,99,255,0.15)" />
            </div>

            {/* Vote distribution bar */}
            <div style={{
              background: "#0a0d12", border: "1px solid #141820",
              borderRadius: 14, padding: "20px 24px", marginBottom: 20,
            }}>
              <div style={{ fontSize: "0.65rem", color: "#4a90a4", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 14 }}>
                Vote Distribution
              </div>
              <VoteBar up={stats.upvotes} down={stats.downvotes} />
            </div>

            {/* Top captions + Recent captions side by side */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {/* Top Rated */}
              <div style={{ background: "#0a0d12", border: "1px solid #141820", borderRadius: 14, padding: "20px 24px" }}>
                <div style={{ fontSize: "0.65rem", color: "#4a90a4", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 14 }}>
                  Top Rated Captions
                </div>
                {stats.topCaptions.length === 0 && (
                  <div style={{ color: "#2e4050", fontSize: "0.72rem" }}>No captions yet</div>
                )}
                {stats.topCaptions.map((c, i) => (
                  <div key={c.id} style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    padding: "10px 0",
                    borderBottom: i < stats.topCaptions.length - 1 ? "1px solid #141820" : "none",
                  }}>
                    <div style={{
                      minWidth: 24, height: 24, borderRadius: 6,
                      background: i === 0 ? "rgba(255,161,78,0.2)" : "rgba(255,255,255,0.04)",
                      display: "grid", placeItems: "center",
                      fontSize: "0.65rem", fontWeight: 700,
                      color: i === 0 ? "#ffa14e" : "#4a5568",
                      fontFamily: "'DM Mono', monospace",
                    }}>
                      #{i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: "0.75rem", color: "#c8d0dc", lineHeight: 1.4,
                        overflow: "hidden", textOverflow: "ellipsis",
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
                      }}>
                        {c.content || "(empty)"}
                      </div>
                      <div style={{ fontSize: "0.6rem", color: "#2e4050", marginTop: 4, fontFamily: "'DM Mono', monospace" }}>
                        {c.like_count ?? 0} likes
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent */}
              <div style={{ background: "#0a0d12", border: "1px solid #141820", borderRadius: 14, padding: "20px 24px" }}>
                <div style={{ fontSize: "0.65rem", color: "#4a90a4", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 14 }}>
                  Recent Captions
                </div>
                {stats.recentCaptions.length === 0 && (
                  <div style={{ color: "#2e4050", fontSize: "0.72rem" }}>No captions yet</div>
                )}
                {stats.recentCaptions.map((c, i) => (
                  <div key={c.id} style={{
                    padding: "10px 0",
                    borderBottom: i < stats.recentCaptions.length - 1 ? "1px solid #141820" : "none",
                  }}>
                    <div style={{
                      fontSize: "0.75rem", color: "#c8d0dc", lineHeight: 1.4,
                      overflow: "hidden", textOverflow: "ellipsis",
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
                    }}>
                      {c.content || "(empty)"}
                    </div>
                    <div style={{ fontSize: "0.6rem", color: "#2e4050", marginTop: 4, fontFamily: "'DM Mono', monospace" }}>
                      {c.like_count ?? 0} likes
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Section Grid ── */}
      <div style={{
        fontSize: "0.65rem", color: "#4a90a4", letterSpacing: "0.1em",
        textTransform: "uppercase", fontFamily: "'DM Mono', monospace",
        marginBottom: 14,
      }}>
        Manage
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
