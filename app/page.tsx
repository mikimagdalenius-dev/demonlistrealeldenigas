import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DemonlistPage() {
  const demons = await prisma.demon.findMany({
    orderBy: { position: "asc" }
  });

  return (
    <section className="space-y-6">
      <div className="pc-panel p-6">
        <h1 className="pc-title">Demon List</h1>
        <p className="pc-subtitle mt-2">
          Hardest demons ranked for our private group. Inspired by Pointercrate style.
        </p>
      </div>

      <div className="pc-panel overflow-x-auto">
        <table className="pc-table min-w-full divide-y divide-zinc-800 text-sm">
          <thead>
            <tr>
              <th>#</th>
              <th>Demon</th>
              <th>Publisher / Verifier</th>
              <th>Difficulty</th>
              <th>Video Proof</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 bg-[#101010]">
            {demons.map((demon) => (
              <tr key={demon.id} className="transition hover:bg-[#171717]">
                <td>
                  <span className="pc-rank">{demon.position}</span>
                </td>
                <td className="font-semibold text-zinc-100">{demon.name}</td>
                <td className="text-zinc-300">{demon.publisherName}</td>
                <td>
                  <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-semibold text-zinc-200">
                    {demon.difficulty}/10
                  </span>
                </td>
                <td>
                  <a href={demon.videoUrl} target="_blank" rel="noreferrer">
                    Watch run
                  </a>
                </td>
              </tr>
            ))}
            {demons.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-zinc-400">
                  No demons yet. Use the Submit page to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
