import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { pointsFromDemon } from "@/lib/points";
import { safeHref } from "@/lib/url";
import { youtubeEmbedUrl } from "@/lib/youtube";
import Link from "next/link";
import { CatNum } from "@/components/catalog";

// ISR 60s. editDemon invalida "/" pero no "/demon/[id]" individual; aquí el
// 60s actúa como ventana máxima de inconsistencia tras un edit.
export const revalidate = 60;

export default async function DemonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const demonId = Number(id);
  if (!Number.isInteger(demonId) || demonId < 1) notFound();

  const demon = await prisma.demon.findUnique({
    where: { id: demonId },
    include: {
      completions: {
        include: { player: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      },
      progresses: {
        include: { player: { select: { name: true } } },
        orderBy: { percentage: "desc" },
      },
      positionHistory: {
        orderBy: { changedAt: "asc" },
      },
    },
  });
  if (!demon) notFound();

  const points = pointsFromDemon(demon.position);
  const embedUrl = youtubeEmbedUrl(demon.videoUrl);

  // Agrupar historial: posición inicial + cambios
  const history = demon.positionHistory;

  // Calcular máximo/mínimo para la barra visual
  const allPositions = history.map((h) => h.position);
  const peakPos = allPositions.length > 0 ? Math.min(...allPositions) : demon.position;
  const worstPos = allPositions.length > 0 ? Math.max(...allPositions) : demon.position;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <Link href="/" className="pc-back">
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
          <path d="M13 5H1M5 1 1 5l4 4" />
        </svg>
        Back to the list
      </Link>

      {/* Header */}
      <article className="pc-detail-head">
        <div>
          <CatNum n={demon.position} />
          <h1 className="pc-demon-title" style={{ marginBottom: 0 }}>{demon.name}</h1>
          <div className="pc-demon-meta">
            published by <strong>{demon.publisherName}</strong>
          </div>
          <dl className="pc-facts">
            <div>
              <dt className="pc-caps">Points</dt>
              <dd>{points}</dd>
            </div>
            <div>
              <dt className="pc-caps">Completions</dt>
              <dd>{demon.completions.length}</dd>
            </div>
            <div>
              <dt className="pc-caps">Peak</dt>
              <dd>#{peakPos}</dd>
            </div>
            {allPositions.length > 1 && worstPos !== peakPos && (
              <div>
                <dt className="pc-caps">Worst</dt>
                <dd>#{worstPos}</dd>
              </div>
            )}
          </dl>
          {!embedUrl && demon.videoUrl && (
            <div style={{ marginTop: 24 }}>
              <a href={safeHref(demon.videoUrl)} target="_blank" rel="noreferrer" className="pc-btn">
                Watch video
              </a>
            </div>
          )}
        </div>
        {/* Video embed */}
        {embedUrl && (
          <iframe
            src={embedUrl}
            title={`${demon.name} video`}
            className="pc-embed"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </article>

      <div className="pc-two-col">
        {/* Completions */}
        <section>
          <div className="pc-section-head pc-caps">
            <span>Completions</span>
            <span className="pc-num">{demon.completions.length}</span>
          </div>
          <div className="pc-card">
            {demon.completions.length === 0 ? (
              <div className="pc-empty">No completions yet.</div>
            ) : (
              <table className="pc-table">
                <thead>
                  <tr>
                    <th>Player</th>
                    <th className="is-right">Video</th>
                  </tr>
                </thead>
                <tbody>
                  {demon.completions.map((c) => (
                    <tr key={c.id}>
                      <td className="is-strong">{c.player.name}</td>
                      <td className="is-right">
                        {c.videoUrl ? (
                          <a href={safeHref(c.videoUrl)} target="_blank" rel="noreferrer">
                            Watch
                          </a>
                        ) : (
                          <span className="is-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Progress */}
        <section>
          <div className="pc-section-head pc-caps">
            <span>Records</span>
            <span className="pc-num">{demon.progresses.length}</span>
          </div>
          <div className="pc-card">
            {demon.progresses.length === 0 ? (
              <div className="pc-empty">No records yet.</div>
            ) : (
              <table className="pc-table">
                <thead>
                  <tr>
                    <th>Player</th>
                    <th className="is-right">%</th>
                  </tr>
                </thead>
                <tbody>
                  {demon.progresses.map((p) => (
                    <tr key={p.id}>
                      <td className="is-strong">{p.player.name}</td>
                      <td className="is-right pc-pct">{p.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      {/* Position History */}
      <section>
        <div className="pc-section-head pc-caps">
          <span>Position History</span>
        </div>
        <div className="pc-card">
          {history.length === 0 ? (
            <div className="pc-empty">No position changes recorded yet.</div>
          ) : (
            history.map((h, i) => {
              const prev = history[i - 1];
              const diff = prev ? h.position - prev.position : 0;
              const isFirst = i === 0;
              return (
                <div key={h.id} className="pc-history-row">
                  <span className="pc-history-pos">#{h.position}</span>
                  <span className={isFirst ? "pc-flat" : diff < 0 ? "pc-up" : diff > 0 ? "pc-down" : "pc-flat"}>
                    {isFirst ? "debut" : diff < 0 ? `up ${Math.abs(diff)}` : diff > 0 ? `down ${diff}` : "no change"}
                  </span>
                  <span className="pc-caps pc-num" style={{ marginLeft: "auto" }}>
                    {new Date(h.changedAt).toLocaleDateString("en-GB", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
