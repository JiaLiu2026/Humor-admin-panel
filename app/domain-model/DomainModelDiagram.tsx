"use client";

import { useEffect, useRef } from "react";

const ERD = `erDiagram
    profiles ||--o{ images : uploads
    profiles ||--o{ captions : authors
    profiles ||--o{ caption_votes : casts
    images ||--o{ captions : has
    captions ||--o{ caption_votes : receives
    humor_flavors ||--o{ captions : tags
    humor_flavors ||--o{ humor_flavor_steps : breaks_into
    caption_requests ||--o{ captions : produces
    llm_prompt_chains ||--o{ captions : runs
    llm_prompt_chains ||--o{ llm_responses : logs
    llm_providers ||--o{ llm_models : offers
    llm_models ||--o{ llm_responses : generates
    signup_domains ||--o{ profiles : allows
    whitelisted_emails ||--o{ profiles : allows

    profiles {
        uuid id PK
        text email
        boolean is_superadmin
        boolean is_in_study
    }
    images {
        uuid id PK
        varchar url
        boolean is_public
        text image_description
        uuid profile_id FK
    }
    captions {
        uuid id PK
        varchar content
        boolean is_public
        bigint like_count
        uuid profile_id FK
        uuid image_id FK
        bigint humor_flavor_id FK
    }
    caption_votes {
        bigint id PK
        smallint vote_value
        uuid caption_id FK
        uuid profile_id FK
    }
    humor_flavors {
        bigint id PK
        varchar name
    }
    humor_flavor_steps {
        bigint id PK
        bigint humor_flavor_id FK
    }
    caption_requests {
        bigint id PK
    }
    llm_prompt_chains {
        bigint id PK
    }
    llm_responses {
        bigint id PK
    }
    llm_providers {
        bigint id PK
        varchar name
    }
    llm_models {
        bigint id PK
        bigint provider_id FK
    }
    signup_domains {
        bigint id PK
        varchar domain
    }
    whitelisted_emails {
        bigint id PK
        text email
    }`;

/**
 * Renders the database ERD using Mermaid loaded from CDN. Mermaid is the
 * one CDN library we're allowed to load alongside the artifact runtime,
 * and it produces an SVG that scales nicely on light or dark backgrounds.
 */
export default function DomainModelDiagram() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      // Dynamic import so the bundle stays small.
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        themeVariables: {
          background: "#0a0d12",
          primaryColor: "#0a0d12",
          primaryBorderColor: "#2a4050",
          primaryTextColor: "#c8d0dc",
          lineColor: "#4a90a4",
          fontFamily: "'DM Mono', monospace",
        },
      });
      const id = "erd-" + Date.now();
      try {
        const { svg } = await mermaid.render(id, ERD);
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch (e) {
        if (!cancelled && ref.current) {
          ref.current.innerHTML =
            '<pre style="color:#8693a8;font-size:0.72rem;white-space:pre-wrap">Diagram failed to render. Source:\n\n' +
            ERD +
            "</pre>";
        }
        console.error(e);
      }
    }
    render();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      style={{
        background: "#0a0d12",
        border: "1px solid #141820",
        borderRadius: 14,
        padding: 24,
        overflowX: "auto",
      }}
    >
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
        Entity-Relationship Diagram
      </div>
      <div ref={ref} style={{ minHeight: 420 }} />
    </div>
  );
}
