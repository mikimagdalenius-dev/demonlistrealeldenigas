import { prisma } from "@/lib/prisma";
import { pointsFromDemon } from "@/lib/points";

export const dynamic = "force-dynamic";

type PlayerWithCompletions = {
  id: number;
  name: string;
  completions: { demon: { name: string; position: number } }[];
};

export default async function PlayersPage() {
  let players: PlayerWithCompletions[] = [];

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

      return { id: player.id, name: player.name, completedDemons, points, hardestTop5 };
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
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="pc-top5-empty">No completions yet.</div>
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
