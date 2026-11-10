import { prisma } from "@/lib/prisma";
import { pointsFromDemon } from "@/lib/points";
import Link from "next/link";
import { extractYouTubeId } from "@/lib/youtube";
import { CatNum, Points, Readout } from "@/components/catalog";

// ISR 60s; las acciones que afectan al ranking llaman revalidatePath("/players").
export const revalidate = 60;

type PlayerWithStats = {
  id: number;
  name: string;
  completions: { videoUrl: string; demon: { id: number; name: string; position: number } }[];
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
            demon: { select: { id: true, name: true, position: true } },
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

  const leader = rows[0]?.points ?? 0;
  const totalCompletions = rows.reduce((sum, r) => sum + r.completedDemons, 0);

  return (
    <>
      <div className="pc-stats-bar pc-caps">
        <span><strong className="pc-num">{rows.length}</strong>players</span>
        <span><strong className="pc-num">{totalCompletions}</strong>completions</span>
      </div>

      <section className="pc-list-only">
        {rows.map((player, index) => {
          const hardestThumb = player.hardest ? youtubeThumbnail(player.hardest.videoUrl) : null;

          return (
            <article key={player.id} className={`pc-entry ${index === 0 ? "is-lead" : ""}`}>
              <CatNum n={index + 1} />

              {/* Miniatura del hardest: lleva a su demon */}
              {hardestThumb && player.hardest ? (
                <Link href={`/demon/${player.hardest.demon.id}`} className="pc-thumb-link" tabIndex={-1} aria-hidden="true">
                  <img className="pc-thumb" src={hardestThumb} alt="" loading="lazy" />
                </Link>
              ) : (
                <div className="pc-thumb-empty" aria-hidden="true" />
              )}

              <div className="pc-entry-body">
                <div className="pc-demon-title">{player.name}</div>
                <div className="pc-demon-meta">
                  <strong className="pc-num">{player.completedDemons}</strong> completed
                  {player.hardest && (
                    <>
                      <span className="pc-meta-sep" aria-hidden="true" />
                      hardest{" "}
                      <Link href={`/demon/${player.hardest.demon.id}`} className="pc-meta-link">
                        #{player.hardest.demon.position} {player.hardest.demon.name}
                      </Link>
                    </>
                  )}
                </div>

                <div className="pc-toggles">
                  <details className="pc-top5">
                    <summary className="pc-caps">Top 5</summary>
                    {player.hardestTop5.length > 0 ? (
                      <ul className="pc-top5-list">
                        {player.hardestTop5.map((c) => (
                          <li key={`${player.id}-${c.demon.position}-${c.demon.name}`} className="pc-top5-item">
                            <span className="pc-num pc-top5-pos">#{c.demon.position}</span>
                            <span>{c.demon.name}</span>
                            <span className="pc-num pc-top5-val">{pointsFromDemon(c.demon.position)} pts</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="pc-top5-empty">No completions yet.</div>
                    )}
                  </details>

                  <details className="pc-top5">
                    <summary className="pc-caps">Progress ({player.progressRows.length})</summary>
                    {player.progressRows.length > 0 ? (
                      <ul className="pc-top5-list">
                        {player.progressRows.map((row) => (
                          <li key={`${player.id}-${row.demon.position}-${row.demon.name}-progress`} className="pc-top5-item">
                            <span className="pc-num pc-top5-pos">#{row.demon.position}</span>
                            <span>{row.demon.name}</span>
                            <span className="pc-pct pc-top5-val">{row.percentage}%</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="pc-top5-empty">No progress yet. Progress gives no points.</div>
                    )}
                  </details>
                </div>
              </div>

              <div className="pc-entry-side">
                <Points points={player.points} />
                {/* Barra relativa al líder: 10 celdas = los puntos del #1 */}
                <Readout points={leader > 0 ? Math.round((player.points / leader) * 500) : 0} />
              </div>
            </article>
          );
        })}

        {rows.length === 0 && <div className="pc-card pc-empty">No players yet.</div>}
      </section>
    </>
  );
}
