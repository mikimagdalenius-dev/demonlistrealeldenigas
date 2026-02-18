import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function thumbnailFromVideo(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      if (id) return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    }

    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (id) return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    }
  } catch {
    // ignore
  }

  return "https://dummyimage.com/320x180/e5e7eb/6b7280&text=No+Thumbnail";
}

export default async function DemonlistPage() {
  let demons: Awaited<ReturnType<typeof prisma.demon.findMany>> = [];

  try {
    demons = await prisma.demon.findMany({
      orderBy: { position: "asc" }
    });
  } catch {
    demons = [];
  }

  return (
    <section className="pc-list-only">
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
                <a className="pc-video-btn" href={demon.videoUrl} target="_blank" rel="noreferrer">
                  Video proof
                </a>
              </div>
            </div>
          </div>
        </article>
      ))}

      {demons.length === 0 && <div className="pc-card pc-empty">No demons yet. Add one in Submit.</div>}
    </section>
  );
}
