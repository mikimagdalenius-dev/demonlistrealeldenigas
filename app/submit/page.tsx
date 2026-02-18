import { prisma } from "@/lib/prisma";
import { SubmitForm } from "./submit-form";

export const dynamic = "force-dynamic";

const defaultPlayers = ["Miki", "Isma", "Luksan", "Robert", "Adri", "Meri"];

export default async function SubmitPage() {
  let dbPlayers: string[] = [];

  try {
    const players = await prisma.player.findMany({
      select: { name: true },
      orderBy: { name: "asc" }
    });
    dbPlayers = players.map((player) => player.name);
  } catch {
    dbPlayers = [];
  }

  const players = Array.from(new Set([...defaultPlayers, ...dbPlayers]));

  return (
    <section className="pc-list-only">
      <SubmitForm players={players} />
    </section>
  );
}
