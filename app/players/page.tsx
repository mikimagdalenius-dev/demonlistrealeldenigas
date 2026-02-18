import { prisma } from "@/lib/prisma";
import { pointsFromDemon } from "@/lib/points";

export const dynamic = "force-dynamic";

type PlayerWithCompletions = {
  id: number;
  name: string;
  completions: { demon: { position: number; difficulty: number } }[];
};

export default async function PlayersPage() {
  let players: PlayerWithCompletions[] = [];
  let dbOffline = false;

  try {
    players = await prisma.player.findMany({
      include: {
        completions: {
          include: {
            demon: true
          }
        }
      }
    });
  } catch {
    dbOffline = true;
  }

  const rows = players
    .map((player) => {
      const completedDemons = player.completions.length;
      const points = player.completions.reduce((sum, completion) => {
        return sum + pointsFromDemon(completion.demon.position, completion.demon.difficulty);
      }, 0);

      return { id: player.id, name: player.name, completedDemons, points };
    })
    .sort((a, b) => b.points - a.points);

  return (
    <section className="pc-grid">
      <div className="pc-stack">
        {dbOffline && <div className="pc-card pc-empty">Database is not connected yet.</div>}

        {rows.map((player, index) => (
          <article key={player.id} className="pc-card">
            <div className="pc-demon-row" style={{ gridTemplateColumns: "1fr" }}>
              <div>
                <div className="pc-demon-title">
                  #{index + 1}  {player.name}
                </div>
                <div className="pc-demon-meta">
                  completed demons: <strong>{player.completedDemons}</strong>
                </div>
                <div className="pc-demon-points">total points: {player.points}</div>
              </div>
            </div>
          </article>
        ))}

        {rows.length === 0 && <div className="pc-card pc-empty">No players yet.</div>}
      </div>

      <aside className="pc-stack">
        <section className="pc-side-block">
          <h2 className="pc-side-title">Players</h2>
          <p className="pc-side-text">
            Ranking is based on completed demons and weighted points from list position + difficulty.
          </p>
        </section>
      </aside>
    </section>
  );
}
