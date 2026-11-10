"use client";

import { useState } from "react";
import Link from "next/link";
import { pointsFromDemon } from "@/lib/points";
import { safeHref } from "@/lib/url";
import { youtubeThumbnail } from "@/lib/youtube";
import { CatNum, Points, Readout } from "@/components/catalog";

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
      <div className="pc-stats-bar pc-caps">
        <span><strong className="pc-num">{stats.demons}</strong>demons</span>
        <span><strong className="pc-num">{stats.players}</strong>players</span>
        <span><strong className="pc-num">{stats.completions}</strong>completions</span>
      </div>

      <input
        type="search"
        placeholder="Buscar demon..."
        aria-label="Buscar demon"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pc-search-input"
      />

      <section className="pc-list-only">
        {filtered.map((demon) => {
          // Runs válidos ordenados por fecha. Si no hay ninguno, se usa el vídeo del demon
          const completionRuns = demon.completions
            .filter((run) => run.videoUrl.trim().length > 0)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

          const runs = completionRuns.length > 0
            ? completionRuns
            : [{ id: -1, videoUrl: demon.videoUrl, createdAt: "", player: { name: demon.publisherName } }];

          const points = pointsFromDemon(demon.position);
          const isTop = demon.position === 1 && !query.trim();

          // Miniatura — clic abre el vídeo del primer run
          const thumb = (
            <a href={safeHref(runs[0].videoUrl)} target="_blank" rel="noreferrer" className="pc-thumb-link" tabIndex={-1}>
              <img className="pc-thumb" src={youtubeThumbnail(demon.thumbnailVideoUrl || runs[0].videoUrl)} alt={demon.name} loading={isTop ? "eager" : "lazy"} />
            </a>
          );

          const title = (
            <div className="pc-demon-title">
              <Link href={`/demon/${demon.id}`} className="pc-demon-name-link">
                {demon.name}
              </Link>
            </div>
          );

          const meta = (
            <div className="pc-demon-meta">
              published by <strong>{demon.publisherName}</strong>
            </div>
          );

          // Lista de vídeos de completación
          const proofs = (
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
          );

          if (isTop) {
            return (
              <article key={demon.id} className="pc-entry is-top">
                <div>
                  <CatNum n={demon.position} />
                  <span className="pc-code" aria-hidden="true"><i /><i /><i /><i /><i /></span>
                  {title}
                  {meta}
                  <div className="pc-entry-top-meta">
                    <Points points={points} />
                    <Readout points={points} />
                  </div>
                  <div className="pc-entry-actions">{proofs}</div>
                </div>
                {thumb}
              </article>
            );
          }

          return (
            <article key={demon.id} className="pc-entry">
              <CatNum n={demon.position} />
              {thumb}
              <div className="pc-entry-body">
                {title}
                {meta}
              </div>
              <div className="pc-entry-side">
                <Points points={points} />
                <Readout points={points} />
                {proofs}
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
