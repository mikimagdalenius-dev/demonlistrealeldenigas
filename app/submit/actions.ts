"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type SubmitState = {
  ok: boolean;
  message: string;
};

function toPositiveInt(value: FormDataEntryValue | null, fieldName: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${fieldName} must be a positive integer`);
  }
  return parsed;
}

function toPercentInt(value: FormDataEntryValue | null): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) {
    throw new Error("Percentage must be between 1 and 100");
  }
  return parsed;
}

const MAX_NAME_LEN = 100;
const MAX_URL_LEN = 500;

function normalizeUrl(raw: string): string {
  const value = raw.trim();
  if (!value) return value;
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const { protocol } = new URL(withProtocol);
    if (protocol !== "http:" && protocol !== "https:") {
      throw new Error("URL must use http or https");
    }
  } catch {
    throw new Error("Invalid URL");
  }
  return withProtocol;
}

function resolvePlayerName(selectedPlayer: string, newPlayerName: string): string {
  return selectedPlayer === "__new__" ? newPlayerName.trim() : selectedPlayer.trim();
}

export async function submitDemon(_prev: SubmitState, formData: FormData): Promise<SubmitState> {
  try {
    const name = String(formData.get("name") ?? "").trim();
    const videoUrl = normalizeUrl(String(formData.get("videoUrl") ?? ""));
    const selectedPlayer = String(formData.get("playerName") ?? "").trim();
    const newPlayerName = String(formData.get("newPlayerName") ?? "").trim();
    const provisionalPosition = toPositiveInt(
      formData.get("provisionalPosition"),
      "Provisional position"
    );

    const publisherName = resolvePlayerName(selectedPlayer, newPlayerName);

    if (!name || !videoUrl || !publisherName) {
      return { ok: false, message: "Please complete all required fields." };
    }
    if (name.length > MAX_NAME_LEN || publisherName.length > MAX_NAME_LEN) {
      return { ok: false, message: `Name too long (max ${MAX_NAME_LEN} chars).` };
    }
    if (videoUrl.length > MAX_URL_LEN) {
      return { ok: false, message: `URL too long (max ${MAX_URL_LEN} chars).` };
    }

    await prisma.$transaction(async (tx) => {
      // Single UPDATE statement — PostgreSQL checks unique constraint after all rows are updated
      await tx.demon.updateMany({
        where: { position: { gte: provisionalPosition } },
        data: { position: { increment: 1 } },
      });

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
        update: { videoUrl },
        create: {
          playerId: player.id,
          demonId: created.id,
          videoUrl
        }
      });

      // Por si el jugador tenía progreso previo en este demon
      await tx.progress.deleteMany({
        where: { playerId: player.id, demonId: created.id },
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

    return { ok: true, message: "Demon submitted correctly." };
  } catch (err) {
    console.error("[submitDemon]", err);
    return { ok: false, message: "Something went wrong while submitting. Try again." };
  }
}

export async function submitCompletion(_prev: SubmitState, formData: FormData): Promise<SubmitState> {
  try {
    const demonId = Number(formData.get("existingDemonId"));
    const selectedPlayer = String(formData.get("playerName") ?? "").trim();
    const newPlayerName = String(formData.get("newPlayerName") ?? "").trim();
    const videoUrl = normalizeUrl(String(formData.get("videoUrl") ?? ""));

    if (!Number.isInteger(demonId) || demonId < 1) {
      return { ok: false, message: "Please select an existing demon." };
    }

    const playerName = resolvePlayerName(selectedPlayer, newPlayerName);
    if (!playerName || !videoUrl) {
      return { ok: false, message: "Please complete all required fields." };
    }
    if (playerName.length > MAX_NAME_LEN) {
      return { ok: false, message: `Player name too long (max ${MAX_NAME_LEN} chars).` };
    }
    if (videoUrl.length > MAX_URL_LEN) {
      return { ok: false, message: `URL too long (max ${MAX_URL_LEN} chars).` };
    }

    await prisma.$transaction(async (tx) => {
      const demon = await tx.demon.findUnique({ where: { id: demonId }, select: { id: true } });
      if (!demon) throw new Error("Demon not found");

      const player = await tx.player.upsert({
        where: { name: playerName },
        update: {},
        create: { name: playerName }
      });

      await tx.completion.upsert({
        where: {
          playerId_demonId: {
            playerId: player.id,
            demonId
          }
        },
        update: { videoUrl },
        create: {
          playerId: player.id,
          demonId,
          videoUrl
        }
      });

      // Si ya tenía progreso en este demon, se elimina al completarlo
      await tx.progress.deleteMany({
        where: { playerId: player.id, demonId },
      });
    });

    revalidatePath("/");
    revalidatePath("/players");
    revalidatePath("/submit");

    return { ok: true, message: "Completion submitted correctly." };
  } catch (err) {
    console.error("[submitCompletion]", err);
    return { ok: false, message: "Could not submit completion." };
  }
}

export async function submitProgress(_prev: SubmitState, formData: FormData): Promise<SubmitState> {
  try {
    const demonId = Number(formData.get("existingDemonId"));
    const selectedPlayer = String(formData.get("playerName") ?? "").trim();
    const newPlayerName = String(formData.get("newPlayerName") ?? "").trim();
    const percentage = toPercentInt(formData.get("percentage"));

    if (!Number.isInteger(demonId) || demonId < 1) {
      return { ok: false, message: "Please select an existing demon." };
    }

    const playerName = resolvePlayerName(selectedPlayer, newPlayerName);
    if (!playerName) {
      return { ok: false, message: "Please select or create a player." };
    }

    await prisma.$transaction(async (tx) => {
      const demon = await tx.demon.findUnique({ where: { id: demonId }, select: { id: true } });
      if (!demon) throw new Error("Demon not found");

      const player = await tx.player.upsert({
        where: { name: playerName },
        update: {},
        create: { name: playerName }
      });

      await tx.progress.upsert({
        where: {
          playerId_demonId: {
            playerId: player.id,
            demonId: demonId
          }
        },
        update: { percentage },
        create: {
          playerId: player.id,
          demonId: demonId,
          percentage
        }
      });
    });

    revalidatePath("/players");
    revalidatePath("/submit");

    return { ok: true, message: "Progress submitted correctly." };
  } catch (err) {
    console.error("[submitProgress]", err);
    return { ok: false, message: "Could not submit progress." };
  }
}
