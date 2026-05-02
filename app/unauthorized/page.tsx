import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Segoe UI, sans-serif",
        padding: "2rem",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "24px",
          padding: "3rem",
          textAlign: "center",
          maxWidth: "440px",
          width: "100%",
        }}
      >
        <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🚫</div>
        <h1
          style={{
            color: "#fff",
            fontSize: "1.6rem",
            marginBottom: "0.75rem",
            letterSpacing: "-0.02em",
          }}
        >
          Superadmin access required
        </h1>
        <p
          style={{
            color: "#a8a8b3",
            fontSize: "0.9rem",
            lineHeight: 1.6,
            marginBottom: "1.75rem",
          }}
        >
          You&rsquo;re signed in, but your account doesn&rsquo;t have
          superadmin permissions. Ask an existing admin to set
          <code
            style={{
              background: "rgba(255,255,255,0.08)",
              padding: "2px 6px",
              borderRadius: 4,
              margin: "0 4px",
              fontFamily: "monospace",
              fontSize: "0.85em",
            }}
          >
            is_superadmin = true
          </code>
          on your profile, then refresh this page.
        </p>
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/login"
            style={{
              background: "white",
              color: "#333",
              border: "none",
              padding: "0.6rem 1.5rem",
              borderRadius: "50px",
              fontWeight: "bold",
              fontSize: "0.9rem",
              textDecoration: "none",
            }}
          >
            Sign in as a different account
          </Link>
          <form action="/admin/logout" method="post" style={{ margin: 0 }}>
            <button
              type="submit"
              style={{
                background: "transparent",
                color: "#a8a8b3",
                border: "1px solid rgba(255,255,255,0.2)",
                padding: "0.6rem 1.5rem",
                borderRadius: "50px",
                fontWeight: "500",
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
