"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { normalizeUrl } from "@/lib/url";
import {
  MAX_NAME_LEN,
  MAX_URL_LEN,
  resolvePlayerName,
  toPercentInt,
  toPositiveInt,
} from "@/lib/validation";

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

      // Shift de las posiciones >= position en dos pasos. PG chequea
      // `position @unique` por fila durante el UPDATE, así que un
      // `increment 1` directo colisiona (fila con pos=P intenta ir a
      // P+1, donde todavía vive otra fila). Truco: primero las negamos
      // (rango disjunto al positivo), luego las devolvemos al valor
      // final. Ambas statements son seguras porque los valores destino
      // son únicos en todo momento.
      await tx.$executeRaw`
        UPDATE "Demon" SET "position" = -"position" WHERE "position" >= ${position}
      `;
      await tx.$executeRaw`
        UPDATE "Demon" SET "position" = -"position" + 1 WHERE "position" < 0
      `;

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
    const detail = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `Error al enviar: ${detail}` };
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
    const detail = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `Error al enviar completion: ${detail}` };
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
    const detail = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `Error al enviar progress: ${detail}` };
  }
}
