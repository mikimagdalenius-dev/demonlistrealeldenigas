import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function thumbnailFromVideo(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      if (id) return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
    }

    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (id) return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
    }
  } catch {
    // ignore
  }

  return "https://dummyimage.com/460x212/e5e7eb/6b7280&text=No+Thumbnail";
}

export default async function DemonlistPage() {
  let demons: Awaited<ReturnType<typeof prisma.demon.findMany>> = [];
  let dbOffline = false;

  try {
    demons = await prisma.demon.findMany({
      orderBy: { position: "asc" }
    });
  } catch {
    dbOffline = true;
  }

  const editors = ["3465", "Latko", "Tripod", "Vonic", "Bosonic", "Ranian", "Spectre"];

  return (
    <section className="pc-grid">
      <div className="pc-stack">
        {dbOffline && (
          <div className="pc-card pc-empty">
            Database is not connected yet. Set <code>DATABASE_URL</code> and start PostgreSQL.
          </div>
        )}

        {demons.map((demon) => (
          <article key={demon.id} className="pc-card">
            <div className="pc-demon-row">
              <img className="pc-thumb" src={thumbnailFromVideo(demon.videoUrl)} alt={demon.name} />

              <div>
                <div className="pc-demon-title">
                  #{demon.position} — {demon.name}
                </div>
                <div className="pc-demon-meta">
                  published by <strong>{demon.publisherName}</strong>
                </div>
                <div className="pc-demon-points">
                  Difficulty {demon.difficulty}/10 — <a href={demon.videoUrl}>video proof</a>
                </div>
              </div>
            </div>
          </article>
        ))}

        {demons.length === 0 && <div className="pc-card pc-empty">No demons yet. Add one in Submit Record.</div>}
      </div>

      <aside className="pc-stack">
        <section className="pc-side-block">
          <h2 className="pc-side-title">List Editors</h2>
          <p className="pc-side-text">
            Contact any of these people if you have problems with the list or want to see a thing changed.
          </p>
          <div className="pc-side-list">
            {editors.map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
        </section>

        <section className="pc-side-block">
          <h2 className="pc-side-title">Guidelines</h2>
          <p className="pc-side-text">
            Please include clear video proof and correct metadata when submitting. Keep records valid and clean.
          </p>
        </section>
      </aside>
    </section>
  );
}
