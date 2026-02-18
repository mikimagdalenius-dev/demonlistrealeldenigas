import { prisma } from "@/lib/prisma";
import { pointsFromDemon } from "@/lib/points";

export const dynamic = "force-dynamic";

type PlayerWithCompletions = {
  id: number;
  name: string;
  completions: { demon: { position: number } }[];
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

      return { id: player.id, name: player.name, completedDemons, points };
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
            </div>
          </div>
        </article>
      ))}

      {rows.length === 0 && <div className="pc-card pc-empty">No players yet.</div>}
    </section>
  );
}
