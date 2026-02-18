"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function toPositiveInt(value: FormDataEntryValue | null, fieldName: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${fieldName} must be a positive integer`);
  }
  return parsed;
}

export async function submitDemon(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const publisherName = String(formData.get("publisherName") ?? "").trim();
  const provisionalPosition = toPositiveInt(formData.get("provisionalPosition"), "Provisional position");

  if (!name || !videoUrl || !publisherName) {
    throw new Error("All fields are required");
  }

  await prisma.$transaction(async (tx) => {
    const demonsToShift = await tx.demon.findMany({
      where: { position: { gte: provisionalPosition } },
      orderBy: { position: "desc" },
      select: { id: true, position: true }
    });

    for (const demon of demonsToShift) {
      await tx.demon.update({
        where: { id: demon.id },
        data: { position: demon.position + 1 }
      });
    }

    const created = await tx.demon.create({
      data: {
        position: provisionalPosition,
        name,
        videoUrl,
        publisherName
      }
    });

    const player = await tx.player.upsert({
      where: { name: publisherName },
      update: {},
      create: { name: publisherName }
    });

    await tx.completion.upsert({
      where: {
        playerId_demonId: {
          playerId: player.id,
          demonId: created.id
        }
      },
      update: {},
      create: {
        playerId: player.id,
        demonId: created.id
      }
    });

    await tx.submission.create({
      data: {
        demonName: name,
        videoUrl,
        publisherName,
        provisionalPosition,
        demonId: created.id
      }
    });
  });

  revalidatePath("/");
  revalidatePath("/players");
  revalidatePath("/submit");
}
