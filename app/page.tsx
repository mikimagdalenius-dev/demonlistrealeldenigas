import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function extractYouTubeId(url: string): string | null {
  const cleaned = url.trim();

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match?.[1]) return match[1];
  }

  try {
    const parsed = new URL(cleaned);
    const v = parsed.searchParams.get("v");
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
  } catch {
    // ignore
  }

  return null;
}

function thumbnailFromVideo(url: string): string {
  const id = extractYouTubeId(url);
  if (id) return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  return "https://dummyimage.com/320x180/e5e7eb/6b7280&text=No+Thumbnail";
}

export default async function DemonlistPage() {
  let demons: {
    id: number;
    position: number;
    name: string;
    videoUrl: string;
    publisherName: string;
    completions: { id: number; videoUrl: string; player: { name: string } }[];
  }[] = [];

  try {
    demons = await prisma.demon.findMany({
      orderBy: { position: "asc" },
      include: {
        completions: {
          include: {
            player: {
              select: { name: true }
            }
          },
          orderBy: {
            createdAt: "asc"
          }
        }
      }
    });
  } catch {
    demons = [];
  }

  return (
    <section className="pc-list-only">
      {demons.map((demon) => {
        const completionRuns = demon.completions.filter((run) => run.videoUrl.trim().length > 0);
        const runs = completionRuns.length
          ? completionRuns
          : [{ id: -1, videoUrl: demon.videoUrl, player: { name: demon.publisherName } }];

        return (
          <article key={demon.id} className="pc-card">
            <div className="pc-demon-row">
              <img className="pc-thumb" src={thumbnailFromVideo(runs[0].videoUrl)} alt={demon.name} />

              <div>
                <div className="pc-demon-title">
                  #{demon.position} — {demon.name}
                </div>
                <div className="pc-demon-meta">
                  published by <strong>{demon.publisherName}</strong>
                </div>
                <div className="pc-demon-points">
                  <details className="pc-runs">
                    <summary className="pc-video-btn">Video proofs ({runs.length})</summary>
                    <ul className="pc-runs-list">
                      {runs.map((run, index) => (
                        <li key={`${demon.id}-${run.id}-${index}`} className="pc-runs-item">
                          <span className="pc-runs-player">{run.player.name}</span>
                          <a href={run.videoUrl} target="_blank" rel="noreferrer">
                            Watch
                          </a>
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              </div>
            </div>
          </article>
        );
      })}

      {demons.length === 0 && <div className="pc-card pc-empty">No demons yet. Add one in Submit.</div>}
    </section>
  );
}
