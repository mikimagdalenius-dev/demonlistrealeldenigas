import { prisma } from "@/lib/prisma";
import { SubmitForm } from "./submit-form";

export const dynamic = "force-dynamic";

const defaultPlayers = ["Miki", "Isma", "Luksan", "Robert", "Adri", "Meri"];

export default async function SubmitPage() {
  let dbPlayers: string[] = [];
  let demons: { id: number; name: string; position: number }[] = [];

  try {
    const [playersRes, demonsRes] = await Promise.all([
      prisma.player.findMany({
        select: { name: true },
        orderBy: { name: "asc" }
      }),
      prisma.demon.findMany({
        select: { id: true, name: true, position: true },
        orderBy: { position: "asc" }
      })
    ]);

    dbPlayers = playersRes.map((player) => player.name);
    demons = demonsRes;
  } catch {
    dbPlayers = [];
    demons = [];
  }

  const players = Array.from(new Set([...defaultPlayers, ...dbPlayers]));

  return (
    <section className="pc-list-only">
      <SubmitForm players={players} demons={demons} />
    </section>
  );
}
