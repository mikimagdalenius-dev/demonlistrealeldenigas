import { prisma } from "@/lib/prisma";
import { DemonList } from "./demon-list";

export const dynamic = "force-dynamic";

export default async function DemonlistPage() {
  let demons: {
    id: number;
    position: number;
    name: string;
    videoUrl: string;
    thumbnailVideoUrl: string | null;
    publisherName: string;
    completions: { id: number; videoUrl: string; createdAt: Date; player: { name: string } }[];
  }[] = [];
  let stats = { players: 0, completions: 0 };

  try {
    [demons, stats.players, stats.completions] = await Promise.all([
      prisma.demon.findMany({
        orderBy: { position: "asc" },
        include: {
          completions: {
            include: { player: { select: { name: true } } },
            orderBy: { createdAt: "asc" },
          },
        },
      }),
      prisma.player.count(),
      prisma.completion.count(),
    ]);
  } catch {
    demons = [];
  }

  return <DemonList demons={demons} stats={{ demons: demons.length, ...stats }} />;
}
