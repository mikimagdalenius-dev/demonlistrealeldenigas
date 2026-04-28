import { prisma } from "@/lib/prisma";
import { pointsFromDemon } from "@/lib/points";
import { safeHref } from "@/lib/url";
import { extractYouTubeId } from "@/lib/youtube";

// ISR 60s; las acciones que afectan al ranking llaman revalidatePath("/players").
export const revalidate = 60;

type PlayerWithStats = {
  id: number;
  name: string;
  completions: { videoUrl: string; demon: { name: string; position: number } }[];
  progresses: { percentage: number; demon: { name: string; position: number } }[];
};

function youtubeThumbnail(videoUrl: string): string | null {
  const id = extractYouTubeId(videoUrl);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

export default async function PlayersPage() {
  let players: PlayerWithStats[] = [];

  try {
    players = await prisma.player.findMany({
      include: {
        completions: {
          include: {
            demon: { select: { name: true, position: true } },
          },
        },
        progresses: {
          include: {
            demon: { select: { name: true, position: true } },
          },
        },
      },
    });
  } catch (err) {
    console.error("[PlayersPage] fallo cargando players", err);
    players = [];
  }

  const rows = players
    .map((player) => {
      const points = player.completions.reduce(
        (sum, c) => sum + pointsFromDemon(c.demon.position),
        0
      );

      // Ordenados de más difícil (posición más baja) a más fácil
      const completionsSorted = [...player.completions].sort(
        (a, b) => a.demon.position - b.demon.position
      );

      const hardestTop5 = completionsSorted.slice(0, 5);
      const hardest = completionsSorted[0] ?? null;

      const progressRows = [...player.progresses].sort(
        (a, b) => a.demon.position - b.demon.position
      );

      return {
        id: player.id,
        name: player.name,
        completedDemons: player.completions.length,
        points,
        hardestTop5,
        hardest,
        progressRows,
      };
    })
    .sort((a, b) => b.points - a.points || b.completedDemons - a.completedDemons);

  return (
    <section className="pc-list-only">
      {rows.map((player, index) => {
        const hardestThumb = player.hardest
          ? youtubeThumbnail(player.hardest.videoUrl)
          : null;

        return (
          <article key={player.id} className="pc-card">
            <div className="pc-demon-row" style={{ gridTemplateColumns: hardestThumb ? "1fr 188px" : "1fr" }}>
              {/* Info del jugador */}
              <div>
                <div className="pc-demon-title">
                  #{index + 1} — {player.name}
                </div>
                <div className="pc-demon-meta">
                  completed demons: <strong>{player.completedDemons}</strong>
                </div>
                <div className="pc-demon-points">total points: {player.points}</div>

                <details className="pc-top5">
                  <summary className="pc-top5-title">Top 5 hardest demons</summary>
                  {player.hardestTop5.length > 0 ? (
                    <ul className="pc-top5-list">
                      {player.hardestTop5.map((c) => (
                        <li key={`${player.id}-${c.demon.position}-${c.demon.name}`} className="pc-top5-item">
                          #{c.demon.position} — {c.demon.name}
                          <span className="pc-pts-badge">
                            {pointsFromDemon(c.demon.position)} pts
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="pc-top5-empty">No completions yet.</div>
                  )}
                </details>

                <details className="pc-top5">
                  <summary className="pc-top5-title">Progress on existing demons (no points)</summary>
                  {player.progressRows.length > 0 ? (
                    <ul className="pc-top5-list">
                      {player.progressRows.map((row) => (
                        <li
                          key={`${player.id}-${row.demon.position}-${row.demon.name}-progress`}
                          className="pc-top5-item"
                        >
                          #{row.demon.position} — {row.demon.name}: {row.percentage}%
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="pc-top5-empty">No progress submitted yet.</div>
                  )}
                </details>
              </div>

              {/* Miniatura del hardest demon completado */}
              {hardestThumb && player.hardest && (
                <a
                  href={safeHref(player.hardest.videoUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="pc-thumb-link"
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
                >
                  <img
                    className="pc-thumb"
                    src={hardestThumb}
                    alt={player.hardest.demon.name}
                    style={{ width: "100%", height: 106 }}
                  />
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px", color: "#4b5563" }}>
                    Hardest demon
                  </span>
                </a>
              )}
            </div>
          </article>
        );
      })}

      {rows.length === 0 && <div className="pc-card pc-empty">No players yet.</div>}
    </section>
  );
}
