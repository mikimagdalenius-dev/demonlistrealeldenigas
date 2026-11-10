import { prisma } from "@/lib/prisma";
import { pointsFromDemon } from "@/lib/points";
import { safeHref } from "@/lib/url";
import { extractYouTubeId } from "@/lib/youtube";
import { CatNum, Points } from "@/components/catalog";

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
          <article key={player.id} className={`pc-entry is-player ${hardestThumb ? "" : "no-thumb"}`}>
            <CatNum n={index + 1} />

            {/* Info del jugador */}
            <div className="pc-entry-body">
              <div className="pc-demon-title">{player.name}</div>
              <div className="pc-demon-meta">
                completed demons: <strong className="pc-num">{player.completedDemons}</strong>
              </div>

              <details className="pc-top5">
                <summary className="pc-caps">Top 5 hardest demons</summary>
                {player.hardestTop5.length > 0 ? (
                  <ul className="pc-top5-list">
                    {player.hardestTop5.map((c) => (
                      <li key={`${player.id}-${c.demon.position}-${c.demon.name}`} className="pc-top5-item">
                        <span className="pc-num">#{c.demon.position}</span> {c.demon.name}
                        <span className="pc-pts-badge">
                          {pointsFromDemon(c.demon.position)} PTS
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="pc-top5-empty">No completions yet.</div>
                )}
              </details>

              <details className="pc-top5">
                <summary className="pc-caps">Progress on existing demons (no points)</summary>
                {player.progressRows.length > 0 ? (
                  <ul className="pc-top5-list">
                    {player.progressRows.map((row) => (
                      <li
                        key={`${player.id}-${row.demon.position}-${row.demon.name}-progress`}
                        className="pc-top5-item"
                      >
                        <span className="pc-num">#{row.demon.position}</span> {row.demon.name}
                        <span className="pc-pct">{row.percentage}%</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="pc-top5-empty">No progress submitted yet.</div>
                )}
              </details>
            </div>

            <div className="pc-entry-side">
              <span className="pc-caps">total points</span>
              <Points points={player.points} />
            </div>

            {/* Miniatura del hardest demon completado */}
            {hardestThumb && player.hardest && (
              <a
                href={safeHref(player.hardest.videoUrl)}
                target="_blank"
                rel="noreferrer"
                className="pc-thumb-link"
              >
                <img className="pc-thumb" src={hardestThumb} alt={player.hardest.demon.name} loading="lazy" />
                <span className="pc-caps pc-hardest-label">Hardest demon</span>
              </a>
            )}
          </article>
        );
      })}

      {rows.length === 0 && <div className="pc-card pc-empty">No players yet.</div>}
    </section>
  );
}
