import { prisma } from "@/lib/prisma";
import { DemonList } from "./demon-list";

// ISR: cachea 60s. Las server actions de admin/submit invalidan con
// revalidatePath("/") cuando hay cambios reales, así que el cache nunca se
// queda viejo más de lo que tarde el siguiente refetch tras un cambio.
export const revalidate = 60;

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
  } catch (err) {
    console.error("[DemonlistPage] fallo cargando demons", err);
    demons = [];
  }

  return <DemonList demons={demons} stats={{ demons: demons.length, ...stats }} />;
}
