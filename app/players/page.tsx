import { prisma } from "@/lib/prisma";
import { pointsFromDemon } from "@/lib/points";

export const dynamic = "force-dynamic";

type PlayerWithStats = {
  id: number;
  name: string;
  completions: { demon: { name: string; position: number } }[];
  progresses: { percentage: number; demon: { name: string; position: number } }[];
};

export default async function PlayersPage() {
  let players: PlayerWithStats[] = [];

  try {
    players = await prisma.player.findMany({
      include: {
        completions: {
          include: {
            demon: {
              select: {
                name: true,
                position: true
              }
            }
          }
        },
        progresses: {
          include: {
            demon: {
              select: {
                name: true,
                position: true
              }
            }
          }
        }
      }
    });
  } catch {
    players = [];
  }

  const rows = players
    .map((player) => {
      const completedDemons = player.completions.length;
      const points = player.completions.reduce((sum, completion) => {
        return sum + pointsFromDemon(completion.demon.position);
      }, 0);

      const hardestTop5 = [...player.completions]
        .sort((a, b) => a.demon.position - b.demon.position)
        .slice(0, 5)
        .map((completion) => completion.demon);

      const progressRows = [...player.progresses].sort((a, b) => a.demon.position - b.demon.position);

      return { id: player.id, name: player.name, completedDemons, points, hardestTop5, progressRows };
    })
    .sort((a, b) => b.points - a.points || b.completedDemons - a.completedDemons);

  return (
    <section className="pc-list-only">
      {rows.map((player, index) => (
        <article key={player.id} className="pc-card">
          <div className="pc-demon-row" style={{ gridTemplateColumns: "1fr" }}>
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
                    {player.hardestTop5.map((demon) => (
                      <li key={`${player.id}-${demon.position}-${demon.name}`} className="pc-top5-item">
                        #{demon.position} — {demon.name}
                        <span className="pc-pts-badge" style={{ marginLeft: 8 }}>
                          {pointsFromDemon(demon.position)} pts
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
          </div>
        </article>
      ))}

      {rows.length === 0 && <div className="pc-card pc-empty">No players yet.</div>}
    </section>
  );
}
