"use client";

import { useState } from "react";
import { pointsFromDemon } from "@/lib/points";

type Demon = {
  id: number;
  position: number;
  name: string;
  videoUrl: string;
  publisherName: string;
  completions: { id: number; videoUrl: string; createdAt: Date; player: { name: string } }[];
};

function extractYouTubeId(url: string): string | null {
  const cleaned = url.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match?.[1]) return match[1];
  }
  try {
    const parsed = new URL(cleaned);
    const v = parsed.searchParams.get("v");
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
  } catch {
    // ignore
  }
  return null;
}

function thumbnailFromVideo(url: string): string {
  const id = extractYouTubeId(url);
  if (id) return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  return "https://dummyimage.com/320x180/e5e7eb/6b7280&text=No+Thumbnail";
}

export function DemonList({ demons }: { demons: Demon[] }) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? demons.filter((d) =>
        d.name.toLowerCase().includes(query.trim().toLowerCase())
      )
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
        {filtered.map((demon) => {
          const completionRuns = demon.completions
            .filter((run) => run.videoUrl.trim().length > 0)
            .sort(
              (a, b) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );

          const runs = completionRuns.length
            ? completionRuns
            : [
                {
                  id: -1,
                  videoUrl: demon.videoUrl,
                  createdAt: new Date(0),
                  player: { name: demon.publisherName },
                },
              ];

          const points = pointsFromDemon(demon.position);

          return (
            <article key={demon.id} className="pc-card">
              <div className="pc-demon-row">
                <a
                  href={runs[0].videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="pc-thumb-link"
                >
                  <img
                    className="pc-thumb"
                    src={thumbnailFromVideo(runs[0].videoUrl)}
                    alt={demon.name}
                  />
                </a>

                <div>
                  <div className="pc-demon-title">
                    #{demon.position} — {demon.name}
                    <span className="pc-pts-badge">{points} pts</span>
                  </div>
                  <div className="pc-demon-meta">
                    published by <strong>{demon.publisherName}</strong>
                  </div>
                  <div className="pc-demon-points">
                    <details className="pc-runs">
                      <summary className="pc-video-btn">
                        Video proofs ({runs.length})
                      </summary>
                      <ul className="pc-runs-list">
                        {runs.map((run, index) => (
                          <li
                            key={`${demon.id}-${run.id}-${index}`}
                            className="pc-runs-item"
                          >
                            <span className="pc-runs-player">
                              {run.player.name}
                            </span>
                            <a
                              href={run.videoUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Watch
                            </a>
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
          <div className="pc-card pc-empty">
            No demons yet. Add one in Submit.
          </div>
        )}
      </section>
    </>
  );
}
