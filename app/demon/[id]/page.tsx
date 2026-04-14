import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { pointsFromDemon } from "@/lib/points";
import { safeHref } from "@/lib/url";
import { youtubeEmbedUrl } from "@/lib/youtube";
import Link from "next/link";

export const dynamic = "force-dynamic";

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
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Back */}
      <div>
        <Link href="/" className="pc-btn pc-btn-secondary" style={{ fontSize: 13, padding: "6px 12px", display: "inline-block" }}>
          ← Volver a la lista
        </Link>
      </div>

      {/* Header */}
      <div className="pc-card">
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* Video embed */}
            {embedUrl && (
              <div style={{ flexShrink: 0 }}>
                <iframe
                  src={embedUrl}
                  width={320}
                  height={180}
                  style={{ border: "1px dashed #cbcbcb", display: "block" }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div className="pc-demon-title">
                #{demon.position} — {demon.name}
                <span className="pc-pts-badge">{points} pts</span>
              </div>
              <div className="pc-demon-meta" style={{ marginTop: 8 }}>
                published by <strong>{demon.publisherName}</strong>
              </div>
              <div style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: "#4b5563" }}>
                <span><strong>{demon.completions.length}</strong> completions</span>
                <span>peak position: <strong>#{peakPos}</strong></span>
                {allPositions.length > 1 && worstPos !== peakPos && (
                  <span>worst position: <strong>#{worstPos}</strong></span>
                )}
              </div>
              {!embedUrl && demon.videoUrl && (
                <div style={{ marginTop: 12 }}>
                  <a href={safeHref(demon.videoUrl)} target="_blank" rel="noreferrer" className="pc-video-btn">
                    Ver vídeo
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Completions */}
        <section>
          <div style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10, color: "#2f3440" }}>
            Completions ({demon.completions.length})
          </div>
          <div className="pc-card">
            {demon.completions.length === 0 ? (
              <div className="pc-empty">No completions yet.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: "1px dashed #d4d4d4" }}>
                    <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700 }}>Jugador</th>
                    <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700 }}>Vídeo</th>
                  </tr>
                </thead>
                <tbody>
                  {demon.completions.map((c, i) => (
                    <tr key={c.id} style={{ borderBottom: i < demon.completions.length - 1 ? "1px dashed #e8e8e8" : undefined }}>
                      <td style={{ padding: "8px 12px", fontWeight: 600 }}>{c.player.name}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right" }}>
                        {c.videoUrl ? (
                          <a href={safeHref(c.videoUrl)} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>
                            Watch
                          </a>
                        ) : (
                          <span style={{ color: "#9ca3af", fontSize: 13 }}>—</span>
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
          <div style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10, color: "#2f3440" }}>
            Records ({demon.progresses.length})
          </div>
          <div className="pc-card">
            {demon.progresses.length === 0 ? (
              <div className="pc-empty">No records yet.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: "1px dashed #d4d4d4" }}>
                    <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700 }}>Jugador</th>
                    <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700 }}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {demon.progresses.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: i < demon.progresses.length - 1 ? "1px dashed #e8e8e8" : undefined }}>
                      <td style={{ padding: "8px 12px", fontWeight: 600 }}>{p.player.name}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700 }}>
                        {p.percentage}%
                      </td>
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
        <div style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10, color: "#2f3440" }}>
          Position History
        </div>
        <div className="pc-card" style={{ padding: 16 }}>
          {history.length === 0 ? (
            <div className="pc-empty" style={{ padding: "12px 0" }}>
              No position changes recorded yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {history.map((h, i) => {
                const prev = history[i - 1];
                const diff = prev ? h.position - prev.position : 0;
                const isFirst = i === 0;
                return (
                  <div
                    key={h.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "8px 0",
                      borderBottom: i < history.length - 1 ? "1px dashed #e8e8e8" : undefined,
                      fontSize: 14,
                    }}
                  >
                    <span style={{ fontWeight: 700, minWidth: 40, color: "#1f2430" }}>
                      #{h.position}
                    </span>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: isFirst ? "#6b7280" : diff < 0 ? "#16a34a" : diff > 0 ? "#dc2626" : "#6b7280",
                      }}
                    >
                      {isFirst ? "⬤ debut" : diff < 0 ? `▲ ${Math.abs(diff)}` : diff > 0 ? `▼ ${diff}` : "— sin cambio"}
                    </span>
                    <span style={{ color: "#9ca3af", fontSize: 12, marginLeft: "auto" }}>
                      {new Date(h.changedAt).toLocaleDateString("es-ES", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
