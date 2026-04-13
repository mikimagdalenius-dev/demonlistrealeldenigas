import { prisma } from "@/lib/prisma";
import { DemonList } from "./demon-list";

export const dynamic = "force-dynamic";

export default async function DemonlistPage() {
  let demons: {
    id: number;
    position: number;
    name: string;
    videoUrl: string;
    publisherName: string;
    completions: { id: number; videoUrl: string; createdAt: Date; player: { name: string } }[];
  }[] = [];

  try {
    demons = await prisma.demon.findMany({
      orderBy: { position: "asc" },
      include: {
        completions: {
          include: {
            player: { select: { name: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  } catch {
    demons = [];
  }

  return <DemonList demons={demons} />;
}
