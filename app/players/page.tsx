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
      <div>
        <h1 className="text-3xl font-bold">Players</h1>
        <p className="mt-2 text-zinc-400">Completion stats and calculated points.</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="min-w-full divide-y divide-zinc-800 text-sm">
          <thead className="bg-zinc-900">
            <tr>
              <th className="px-4 py-3 text-left">Player</th>
              <th className="px-4 py-3 text-left">Completed Demons</th>
              <th className="px-4 py-3 text-left">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {rows.map((player) => (
              <tr key={player.id} className="bg-zinc-950">
                <td className="px-4 py-3">{player.name}</td>
                <td className="px-4 py-3">{player.completedDemons}</td>
                <td className="px-4 py-3 font-semibold">{player.points}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-zinc-400">
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
