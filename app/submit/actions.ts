"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function toPositiveInt(value: FormDataEntryValue | null): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error("Difficulty must be a positive integer");
  }
  return parsed;
}

export async function submitDemon(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const publisherName = String(formData.get("publisherName") ?? "").trim();
  const difficulty = toPositiveInt(formData.get("difficulty"));

  if (!name || !videoUrl || !publisherName) {
    throw new Error("All fields are required");
  }

  const highestPosition = await prisma.demon.aggregate({
    _max: { position: true }
  });

  const nextPosition = (highestPosition._max.position ?? 0) + 1;

  const demon = await prisma.demon.create({
    data: {
      position: nextPosition,
      name,
      videoUrl,
      publisherName,
      difficulty
    }
  });

  await prisma.submission.create({
    data: {
      demonName: name,
      videoUrl,
      publisherName,
      difficulty,
      demonId: demon.id
    }
  });

  revalidatePath("/");
  revalidatePath("/players");
}
