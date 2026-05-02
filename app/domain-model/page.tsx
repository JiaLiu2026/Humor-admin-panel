import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import DomainModelDiagram from "./DomainModelDiagram";

export const dynamic = "force-dynamic";

/**
 * Domain Model page (Assignment 7).
 *
 * Renders an ERD of every table the app touches, plus prose descriptions
 * of each entity and how they relate. Gated behind superadmin like the
 * rest of the admin panel.
 */
export default async function DomainModelPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/domain-model");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_superadmin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_superadmin) redirect("/unauthorized");

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#05070a",
        color: "#c8d0dc",
        padding: "32px 28px 80px",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <a
            href="/admin"
            style={{
              color: "#4a90a4",
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.7rem",
              textDecoration: "none",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            ← Back to admin
          </a>
        </div>

        <header style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "2rem",
              color: "#fff",
              letterSpacing: "-0.03em",
              marginBottom: 8,
            }}
          >
            Domain Model
          </h1>
          <p
            style={{
              color: "#4a5568",
              fontSize: "0.85rem",
              fontFamily: "'DM Mono', monospace",
            }}
          >
            almostcrackd.ai · entities, relationships, and data flow
          </p>
        </header>

        <DomainModelDiagram />

        {/* ── Entity descriptions ── */}
        <section style={{ marginTop: 48 }}>
          <SectionLabel>Entities</SectionLabel>

          <EntityCard
            name="profiles"
            summary="The user account. profiles.id mirrors auth.users.id, so a Supabase auth user is the same uuid as a profile."
            fields={[
              ["id", "uuid PK — equals auth.users.id"],
              ["email", "text — populated by Supabase auth"],
              ["first_name / last_name", "varchar"],
              ["is_superadmin", "boolean — gates admin access"],
              ["is_in_study", "boolean"],
              ["is_matrix_admin", "boolean"],
            ]}
          />

          <EntityCard
            name="images"
            summary="Uploaded image plus its public URL. Captions FK to images via image_id."
            fields={[
              ["id", "uuid PK"],
              ["url", "varchar — public CDN URL"],
              ["is_public", "boolean — controls feed visibility"],
              ["profile_id", "uuid FK → profiles.id (uploader)"],
              ["image_description", "text — admin-editable label"],
              ["additional_context", "varchar — extra prompt context"],
              ["celebrity_recognition", "text — pipeline-extracted info"],
              ["embedding", "vector — for similarity search"],
            ]}
          />

          <EntityCard
            name="captions"
            summary="A single caption generated for an image. Each caption is the output of one prompt-chain run."
            fields={[
              ["id", "uuid PK"],
              ["content", "varchar — the caption text"],
              ["is_public", "boolean — feed visibility"],
              ["is_featured", "boolean — pinned by admins"],
              ["like_count", "bigint — denormalized vote tally"],
              ["profile_id", "uuid FK → profiles.id (author)"],
              ["image_id", "uuid FK → images.id"],
              ["humor_flavor_id", "bigint FK → humor_flavors.id"],
              ["caption_request_id", "bigint FK → caption_requests.id"],
              ["llm_prompt_chain_id", "bigint FK → llm_prompt_chains.id"],
            ]}
          />

          <EntityCard
            name="caption_votes"
            summary="A user's up/down rating for a caption. Voting is the primary engagement signal."
            fields={[
              ["id", "bigint PK"],
              ["vote_value", "smallint — −1 or +1"],
              ["caption_id", "uuid FK → captions.id"],
              ["profile_id", "uuid FK → profiles.id (voter)"],
              ["is_from_study", "boolean"],
            ]}
          />

          <EntityCard
            name="humor_flavors / humor_flavor_steps / humor_mix"
            summary="The taxonomy of humor styles. Flavors describe categories; flavor steps describe how a flavor is generated step-by-step; humor_mix tunes the global blend."
          />

          <EntityCard
            name="caption_requests / caption_examples"
            summary="caption_requests records each generation attempt. caption_examples are curated good captions that seed prompts."
          />

          <EntityCard
            name="llm_models / llm_providers / llm_prompt_chains / llm_responses"
            summary="The LLM pipeline. providers define vendors (OpenAI, Anthropic). models live under providers. prompt_chains are sequences of templated calls. responses log every model call."
          />

          <EntityCard
            name="signup_domains / whitelisted_emails"
            summary="Access control. signup_domains gates which email domains can register; whitelisted_emails allows specific addresses regardless of domain."
          />
        </section>

        {/* ── Key flows ── */}
        <section style={{ marginTop: 48 }}>
          <SectionLabel>Key data flows</SectionLabel>
          <Flow
            title="Image upload → caption generation"
            steps={[
              "User uploads an image. We POST /pipeline/generate-presigned-url, then PUT bytes to S3.",
              "We POST /pipeline/upload-image-from-url with the cdnUrl. The pipeline inserts a row into images and returns imageId.",
              "We POST /pipeline/generate-captions with the imageId. The pipeline runs an llm_prompt_chain, inserts caption_requests + llm_responses, and produces caption rows tied to the image.",
              "Captions appear in the public feed once is_public = true.",
            ]}
          />
          <Flow
            title="Caption rating"
            steps={[
              "A signed-in user clicks up or down. We POST /api/vote.",
              "We upsert a caption_votes row keyed by (caption_id, profile_id).",
              "captions.like_count is maintained in the database via a trigger; the feed reads it directly.",
            ]}
          />
          <Flow
            title="Admin gate"
            steps={[
              "middleware.ts redirects anonymous traffic from /admin/*, /prompt-chain/*, and /domain-model to /login.",
              "app/admin/layout.tsx then verifies profiles.is_superadmin = true server-side. Non-admins land on /unauthorized.",
              "The OAuth callback at /auth/callback re-runs the same superadmin check, so non-admins can never even land on /admin.",
            ]}
          />
        </section>
      </div>
    </main>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: "0.65rem",
        color: "#4a90a4",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        fontFamily: "'DM Mono', monospace",
        marginBottom: 14,
      }}
    >
      {children}
    </div>
  );
}

function EntityCard({
  name,
  summary,
  fields,
}: {
  name: string;
  summary: string;
  fields?: Array<[string, string]>;
}) {
  return (
    <div
      style={{
        background: "#0a0d12",
        border: "1px solid #141820",
        borderRadius: 14,
        padding: "20px 24px",
        marginBottom: 14,
      }}
    >
      <div
        style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 700,
          fontSize: "1rem",
          color: "#fff",
          letterSpacing: "-0.01em",
          marginBottom: 6,
        }}
      >
        {name}
      </div>
      <p
        style={{
          color: "#8693a8",
          fontSize: "0.82rem",
          lineHeight: 1.55,
          marginBottom: fields && fields.length > 0 ? 14 : 0,
        }}
      >
        {summary}
      </p>
      {fields && fields.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {fields.map(([k, v]) => (
              <tr
                key={k}
                style={{
                  borderTop: "1px solid #141820",
                }}
              >
                <td
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "0.72rem",
                    color: "#c8d0dc",
                    padding: "8px 12px 8px 0",
                    width: "32%",
                    verticalAlign: "top",
                  }}
                >
                  {k}
                </td>
                <td
                  style={{
                    fontSize: "0.78rem",
                    color: "#8693a8",
                    padding: "8px 0",
                    lineHeight: 1.5,
                  }}
                >
                  {v}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Flow({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div
      style={{
        background: "#0a0d12",
        border: "1px solid #141820",
        borderRadius: 14,
        padding: "20px 24px",
        marginBottom: 14,
      }}
    >
      <div
        style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 700,
          fontSize: "0.95rem",
          color: "#fff",
          marginBottom: 12,
        }}
      >
        {title}
      </div>
      <ol style={{ margin: 0, paddingLeft: 20 }}>
        {steps.map((s, i) => (
          <li
            key={i}
            style={{
              color: "#8693a8",
              fontSize: "0.82rem",
              lineHeight: 1.6,
              marginBottom: 6,
            }}
          >
            {s}
          </li>
        ))}
      </ol>
    </div>
  );
}
