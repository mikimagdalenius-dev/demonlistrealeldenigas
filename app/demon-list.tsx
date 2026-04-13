"use client";

import { useState } from "react";
import { pointsFromDemon } from "@/lib/points";
import { safeHref } from "@/lib/url";

// Tipo de demonio que recibe este componente desde page.tsx
type Demon = {
  id: number;
  position: number;
  name: string;
  videoUrl: string;
  publisherName: string;
  // createdAt es Date en el servidor, string serializado en el cliente
  completions: { id: number; videoUrl: string; createdAt: Date | string; player: { name: string } }[];
};

// ── YouTube helpers ───────────────────────────────────────────────────────────

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.trim().match(pattern);
    if (match?.[1]) return match[1];
  }
  try {
    const v = new URL(url.trim()).searchParams.get("v");
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
  } catch {
    // URL inválida, sin miniatura
  }
  return null;
}

function thumbnailUrl(videoUrl: string): string {
  const id = extractYouTubeId(videoUrl);
  return id
    ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
    : "https://dummyimage.com/320x180/e5e7eb/6b7280&text=No+Thumbnail";
}

// ── Componente principal ──────────────────────────────────────────────────────

export function DemonList({ demons }: { demons: Demon[] }) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? demons.filter((d) => d.name.toLowerCase().includes(query.trim().toLowerCase()))
    : demons;

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <input
          type="search"
          placeholder="Buscar demonio..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: "100%",
            border: "1px dashed #cfd3d9",
            background: "#fff",
            padding: "10px 14px",
            fontFamily: "inherit",
            fontSize: 15,
            fontWeight: 600,
          }}
        />
      </div>

      <section className="pc-list-only">
        {filtered.map((demon, cardIndex) => {
          // Runs válidos ordenados por fecha. Si no hay ninguno, se usa el vídeo del demon
          const completionRuns = demon.completions
            .filter((run) => run.videoUrl.trim().length > 0)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

          const runs = completionRuns.length > 0
            ? completionRuns
            : [{ id: -1, videoUrl: demon.videoUrl, createdAt: "", player: { name: demon.publisherName } }];

          const points = pointsFromDemon(demon.position);

          return (
            <article
              key={demon.id}
              className="pc-card"
              style={{ animationDelay: `${Math.min(cardIndex * 40, 400)}ms` }}
            >
              <div className="pc-demon-row">
                {/* Miniatura — clic abre el vídeo del primer run */}
                <a href={safeHref(runs[0].videoUrl)} target="_blank" rel="noreferrer" className="pc-thumb-link">
                  <img className="pc-thumb" src={thumbnailUrl(runs[0].videoUrl)} alt={demon.name} />
                </a>

                <div>
                  <div className="pc-demon-title">
                    #{demon.position} — {demon.name}
                    <span className="pc-pts-badge">{points} pts</span>
                  </div>
                  <div className="pc-demon-meta">
                    published by <strong>{demon.publisherName}</strong>
                  </div>

                  {/* Lista de vídeos de completación */}
                  <div style={{ marginTop: 8 }}>
                    <details className="pc-runs">
                      <summary className="pc-video-btn">Video proofs ({runs.length})</summary>
                      <ul className="pc-runs-list">
                        {runs.map((run, runIndex) => (
                          <li key={`${demon.id}-${run.id}-${runIndex}`} className="pc-runs-item">
                            <span className="pc-runs-player">{run.player.name}</span>
                            <a href={safeHref(run.videoUrl)} target="_blank" rel="noreferrer">Watch</a>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </div>
                </div>
              </div>
            </article>
          );
        })}

        {filtered.length === 0 && demons.length > 0 && (
          <div className="pc-card pc-empty">
            No hay demonios que coincidan con &ldquo;{query}&rdquo;.
          </div>
        )}

        {demons.length === 0 && (
          <div className="pc-card pc-empty">No demons yet. Add one in Submit.</div>
        )}
      </section>
    </>
  );
}
