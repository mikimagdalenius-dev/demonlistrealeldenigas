import { prisma } from "@/lib/prisma";
import { pointsFromDemon } from "@/lib/points";

export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  const players = await prisma.player.findMany({
    include: {
      completions: {
        include: {
          demon: true
        }
      }
    }
  });

  const rows = players
    .map((player) => {
      const completedDemons = player.completions.length;
      const points = player.completions.reduce((sum, completion) => {
        return sum + pointsFromDemon(completion.demon.position, completion.demon.difficulty);
      }, 0);

      return {
        id: player.id,
        name: player.name,
        completedDemons,
        points
      };
    })
    .sort((a, b) => b.points - a.points);

  return (
    <section className="space-y-6">
      <div className="pc-panel p-6">
        <h1 className="pc-title">Players</h1>
        <p className="pc-subtitle mt-2">Leaderboard based on completions and demon points.</p>
      </div>

      <div className="pc-panel overflow-x-auto">
        <table className="pc-table min-w-full divide-y divide-zinc-800 text-sm">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Completed Demons</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 bg-[#101010]">
            {rows.map((player, index) => (
              <tr key={player.id} className="transition hover:bg-[#171717]">
                <td>
                  <span className="pc-rank">{index + 1}</span>
                </td>
                <td className="font-semibold text-zinc-100">{player.name}</td>
                <td className="text-zinc-300">{player.completedDemons}</td>
                <td className="font-bold text-red-300">{player.points}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-zinc-400">
                  No players yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
