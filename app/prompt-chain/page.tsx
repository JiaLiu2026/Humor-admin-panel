import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import FlavorList from "./FlavorList";

"use client";


export default function PromptChainPage() {
    const [authorized, setAuthorized] = useState<boolean | null>(null);
    const sb = createClient();

    useEffect(() => {
        const check = async () => {
            const { data: { session } } = await sb.auth.getSession();
            if (!session) { setAuthorized(false); return; }
            const { data: profile } = await sb.from("profiles")
                .select("is_superadmin, is_matrix_admin")
                .eq("id", session.user.id)
                .single();
            setAuthorized(!!(profile?.is_superadmin || profile?.is_matrix_admin));
        };
        check();
    }, []);

    if (authorized === null) return <Shell><div style={styles.loading}>Checking access...</div></Shell>;
    if (!authorized) return (
        <Shell>
            <div style={styles.denied}>
                <div style={{ fontSize: "2rem", marginBottom: 16 }}>🔒</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "#fff", marginBottom: 8 }}>Access Denied</div>
                <div style={{ fontSize: "0.75rem", color: "#2e4050" }}>Requires superadmin or matrix admin privileges.</div>
            </div>
        </Shell>
    );

    return (
        <Shell>
            <FlavorList />
        </Shell>
    );
}

function Shell({ children }: { children: React.ReactNode }) {
    return (
        <div style={styles.root}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@600;700;800&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                body { background: #07090d; }
                ::-webkit-scrollbar { width: 4px; height: 4px; }
                ::-webkit-scrollbar-track { background: #07090d; }
                ::-webkit-scrollbar-thumb { background: #1e2530; border-radius: 2px; }
                input, textarea, select { font-family: 'DM Mono', monospace; }
            `}</style>
            <header style={styles.header}>
                <div style={styles.headerInner}>
                    <div>
                        <div style={styles.logo}>prompt<span style={{ color: "#4a90a4" }}>chain</span></div>
                        <div style={styles.sublogo}>almostcrackd.ai · humor flavor manager</div>
                    </div>
                    <ThemeToggle />
                </div>
            </header>
            <main style={styles.main}>{children}</main>
        </div>
    );
}

function ThemeToggle() {
    const [dark, setDark] = useState(true);
    useEffect(() => {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        setDark(mq.matches);
        const handler = (e: MediaQueryListEvent) => setDark(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    useEffect(() => {
        document.body.style.background = dark ? "#07090d" : "#f0f2f5";
        document.body.style.color = dark ? "#c8d0dc" : "#1a2030";
    }, [dark]);

    return (
        <button onClick={() => setDark(!dark)} style={{
            background: dark ? "#111820" : "#e0e4ea",
            border: "1px solid " + (dark ? "#1e2530" : "#c8d0dc"),
            borderRadius: 8, padding: "6px 14px", cursor: "pointer",
            fontSize: "0.7rem", fontFamily: "'DM Mono', monospace",
            color: dark ? "#4a90a4" : "#2a5068", letterSpacing: "0.06em",
        }}>
            {dark ? "☀ Light" : "☾ Dark"}
        </button>
    );
}

const styles: Record<string, React.CSSProperties> = {
    root: { minHeight: "100vh", background: "#07090d", color: "#c8d0dc", fontFamily: "'DM Mono', monospace" },
    header: { borderBottom: "1px solid #141820", background: "#0a0d12", position: "sticky", top: 0, zIndex: 100 },
    headerInner: { maxWidth: 1100, margin: "0 auto", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" },
    logo: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#fff", letterSpacing: "-0.02em" },
    sublogo: { fontSize: "0.6rem", color: "#2e4050", marginTop: 3, letterSpacing: "0.1em", textTransform: "uppercase" },
    main: { maxWidth: 1100, margin: "0 auto", padding: "32px 24px" },
    loading: { color: "#2e4050", fontSize: "0.75rem", padding: 40, textAlign: "center" },
    denied: { textAlign: "center", padding: "80px 24px" },
};