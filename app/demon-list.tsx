"use client";

"use client";

import { useState } from "react";
import Link from "next/link";
import { pointsFromDemon } from "@/lib/points";
import { safeHref } from "@/lib/url";
import { youtubeThumbnail } from "@/lib/youtube";

type Demon = {
  id: number;
  position: number;
  name: string;
  videoUrl: string;
  thumbnailVideoUrl: string | null;
  publisherName: string;
  completions: { id: number; videoUrl: string; createdAt: Date | string; player: { name: string } }[];
};

// ── Componente principal ──────────────────────────────────────────────────────

export function DemonList({ demons, stats }: { demons: Demon[]; stats: { demons: number; players: number; completions: number } }) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? demons.filter((d) => d.name.toLowerCase().includes(query.trim().toLowerCase()))
    : demons;

  return (
    <>
      <div className="pc-stats-bar">
        <span><strong>{stats.demons}</strong> demons</span>
        <span className="pc-stats-sep">·</span>
        <span><strong>{stats.players}</strong> players</span>
        <span className="pc-stats-sep">·</span>
        <span><strong>{stats.completions}</strong> completions</span>
      </div>

      <div style={{ marginBottom: 16 }}>
        <input
          type="search"
          placeholder="Buscar demon..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pc-search-input"
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
                  <img className="pc-thumb" src={youtubeThumbnail(demon.thumbnailVideoUrl || runs[0].videoUrl)} alt={demon.name} />
                </a>

                <div>
                  <div className="pc-demon-title">
                    #{demon.position} —{" "}
                    <Link href={`/demon/${demon.id}`} style={{ color: "inherit", textDecoration: "none" }} className="pc-demon-name-link">
                      {demon.name}
                    </Link>
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
