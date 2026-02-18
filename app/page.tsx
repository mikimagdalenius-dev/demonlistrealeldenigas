import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DemonlistPage() {
  const demons = await prisma.demon.findMany({
    orderBy: { position: "asc" }
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Demonlist</h1>
        <p className="mt-2 text-zinc-400">Ranked list of demons with proof and difficulty.</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="min-w-full divide-y divide-zinc-800 text-sm">
          <thead className="bg-zinc-900">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Publisher / Verifier</th>
              <th className="px-4 py-3 text-left">Difficulty</th>
              <th className="px-4 py-3 text-left">Video Proof</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {demons.map((demon) => (
              <tr key={demon.id} className="bg-zinc-950">
                <td className="px-4 py-3 font-medium">{demon.position}</td>
                <td className="px-4 py-3">{demon.name}</td>
                <td className="px-4 py-3">{demon.publisherName}</td>
                <td className="px-4 py-3">{demon.difficulty}</td>
                <td className="px-4 py-3">
                  <a href={demon.videoUrl} target="_blank" rel="noreferrer">
                    Watch
                  </a>
                </td>
              </tr>
            ))}
            {demons.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-zinc-400">
                  No demons yet. Add one from the Submit Demon page.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
