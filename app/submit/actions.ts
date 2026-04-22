"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { normalizeUrl } from "@/lib/url";

type SubmitState = {
  ok: boolean;
  message: string;
};

// Busca jugador case-insensitive — "Miki", "miki" y "MIKI" son el mismo.
// Si no existe lo crea preservando el casing del input.
async function findOrCreatePlayer(
  tx: Prisma.TransactionClient,
  name: string,
): Promise<{ id: number; name: string }> {
  const existing = await tx.player.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
    select: { id: true, name: true },
  });
  if (existing) return existing;
  return tx.player.create({
    data: { name },
    select: { id: true, name: true },
  });
}

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

function resolvePlayerName(selectedPlayer: string, newPlayerName: string): string {
  return selectedPlayer === "__new__" ? newPlayerName.trim() : selectedPlayer.trim();
}

export async function submitDemon(_prev: SubmitState, formData: FormData): Promise<SubmitState> {
  try {
    const limit = await rateLimit("submitDemon");
    if (!limit.ok) {
      return {
        ok: false,
        message: `Too many submissions. Try again in ${limit.retryInSec}s.`,
      };
    }

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
      // Cap a total+1: si nos mandan una posición absurda (9999999) la
      // metemos al final de la lista en vez de dejar un hueco gigante.
      const total = await tx.demon.count();
      const position = Math.min(provisionalPosition, total + 1);

      // Single UPDATE statement — PostgreSQL checks unique constraint after all rows are updated
      await tx.demon.updateMany({
        where: { position: { gte: position } },
        data: { position: { increment: 1 } },
      });

      const created = await tx.demon.create({
        data: {
          position,
          name,
          videoUrl,
          publisherName
        }
      });

      const player = await findOrCreatePlayer(tx, publisherName);

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

      // Registro de auditoría — no se usa en la UI pero queda como historial
      await tx.submission.create({
        data: {
          demonName: name,
          videoUrl,
          publisherName,
          provisionalPosition,
          demonId: created.id,
        },
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
    const limit = await rateLimit("submitCompletion");
    if (!limit.ok) {
      return {
        ok: false,
        message: `Too many submissions. Try again in ${limit.retryInSec}s.`,
      };
    }

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

      const player = await findOrCreatePlayer(tx, playerName);

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
    const limit = await rateLimit("submitProgress");
    if (!limit.ok) {
      return {
        ok: false,
        message: `Too many submissions. Try again in ${limit.retryInSec}s.`,
      };
    }

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

      const player = await findOrCreatePlayer(tx, playerName);

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
