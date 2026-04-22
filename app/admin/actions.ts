"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import {
  checkAdminPassword,
  setAdminCookie,
  clearAdminCookie,
  isAdminAuthed,
} from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { normalizeUrl, tryNormalizeUrl } from "@/lib/url";

const MAX_NAME_LEN = 100;
const MAX_URL_LEN = 500;

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function loginAction(
  _prev: { error: string },
  formData: FormData
): Promise<{ error: string }> {
  const password = String(formData.get("password") ?? "");
  if (!checkAdminPassword(password)) {
    return { error: "Contraseña incorrecta." };
  }
  await setAdminCookie();
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await clearAdminCookie();
  redirect("/admin");
}

// ── Demons ────────────────────────────────────────────────────────────────────

export async function deleteDemonAction(demonId: number): Promise<void> {
  if (!(await isAdminAuthed())) return;

  await prisma.$transaction(async (tx) => {
    const demon = await tx.demon.findUnique({
      where: { id: demonId },
      select: { position: true },
    });
    if (!demon) return;

    await tx.demon.delete({ where: { id: demonId } });

    await tx.demon.updateMany({
      where: { position: { gt: demon.position } },
      data: { position: { decrement: 1 } },
    });
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/players");
}

export async function moveDemonAction(
  demonId: number,
  direction: "up" | "down"
): Promise<void> {
  if (!(await isAdminAuthed())) return;

  await prisma.$transaction(async (tx) => {
    const demon = await tx.demon.findUnique({
      where: { id: demonId },
      select: { id: true, position: true },
    });
    if (!demon) return;

    const targetPosition =
      direction === "up" ? demon.position - 1 : demon.position + 1;
    if (targetPosition < 1) return;

    const neighbor = await tx.demon.findUnique({
      where: { position: targetPosition },
      select: { id: true },
    });
    if (!neighbor) return;

    const total = await tx.demon.count();
    await tx.demon.update({ where: { id: demon.id }, data: { position: total + 9999 } });
    await tx.demon.update({ where: { id: neighbor.id }, data: { position: demon.position } });
    await tx.demon.update({ where: { id: demon.id }, data: { position: targetPosition } });

    await tx.positionHistory.createMany({
      data: [
        { demonId: demon.id, position: targetPosition },
        { demonId: neighbor.id, position: demon.position },
      ],
    });
  });

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function reorderDemonsAction(orderedIds: number[]): Promise<void> {
  if (!(await isAdminAuthed())) return;
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) return;

  await prisma.$transaction(async (tx) => {
    // Verificar que los IDs recibidos corresponden exactamente a los demons existentes
    const existing = await tx.demon.findMany({ select: { id: true } });
    const existingIds = new Set(existing.map((d) => d.id));
    const valid =
      orderedIds.length === existingIds.size &&
      orderedIds.every((id) => existingIds.has(id)) &&
      new Set(orderedIds).size === orderedIds.length;
    if (!valid) throw new Error("orderedIds no coincide con los demons existentes");

    // Un único UPDATE con CASE. PostgreSQL valida el unique de `position`
    // al final del statement, por eso no hace falta pasar por posiciones
    // temporales: siempre que el estado final sea una permutación válida
    // de 1..N, el swap/reorder pasa el check.
    const caseClauses = Prisma.join(
      orderedIds.map(
        (id, i) => Prisma.sql`WHEN ${id} THEN ${i + 1}`,
      ),
      " ",
    );
    await tx.$executeRaw(Prisma.sql`
      UPDATE "Demon"
      SET "position" = CASE "id" ${caseClauses} END
      WHERE "id" IN (${Prisma.join(orderedIds)})
    `);

    await tx.positionHistory.createMany({
      data: orderedIds.map((id, i) => ({ demonId: id, position: i + 1 })),
    });
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/players");
}

export async function editDemonAction(
  _prev: { ok: boolean; message: string },
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  if (!(await isAdminAuthed())) {
    return { ok: false, message: "No autorizado." };
  }

  try {
    const demonId = Number(formData.get("demonId"));
    const name = String(formData.get("name") ?? "").trim();
    const rawVideoUrl = String(formData.get("videoUrl") ?? "");
    const publisherName = String(formData.get("publisherName") ?? "").trim();
    const newPosition = Number(formData.get("position"));
    const rawThumb = String(formData.get("thumbnailVideoUrl") ?? "");

    let videoUrl: string;
    try {
      videoUrl = normalizeUrl(rawVideoUrl);
    } catch {
      return { ok: false, message: "URL de vídeo inválida." };
    }

    const thumbnailVideoUrl = tryNormalizeUrl(rawThumb);

    if (!name || !videoUrl || !publisherName || !Number.isInteger(newPosition) || newPosition < 1) {
      return { ok: false, message: "Rellena todos los campos correctamente." };
    }
    if (name.length > MAX_NAME_LEN || publisherName.length > MAX_NAME_LEN) {
      return { ok: false, message: `Nombre demasiado largo (máx ${MAX_NAME_LEN}).` };
    }
    if (videoUrl.length > MAX_URL_LEN || (thumbnailVideoUrl && thumbnailVideoUrl.length > MAX_URL_LEN)) {
      return { ok: false, message: `URL demasiado larga (máx ${MAX_URL_LEN}).` };
    }

    await prisma.$transaction(async (tx) => {
      const demon = await tx.demon.findUnique({
        where: { id: demonId },
        select: { position: true },
      });
      if (!demon) throw new Error("Demonio no encontrado.");

      const oldPosition = demon.position;

      if (newPosition !== oldPosition) {
        const total = await tx.demon.count();
        const clampedPos = Math.min(Math.max(1, newPosition), total);

        // Mover el demonio a posición temporal para no violar unique constraint
        await tx.demon.update({ where: { id: demonId }, data: { position: total + 999 } });

        if (clampedPos < oldPosition) {
          await tx.demon.updateMany({
            where: { position: { gte: clampedPos, lt: oldPosition } },
            data: { position: { increment: 1 } },
          });
        } else {
          await tx.demon.updateMany({
            where: { position: { gt: oldPosition, lte: clampedPos } },
            data: { position: { decrement: 1 } },
          });
        }

        await tx.demon.update({
          where: { id: demonId },
          data: { name, videoUrl, thumbnailVideoUrl, publisherName, position: clampedPos },
        });
        await tx.positionHistory.create({ data: { demonId, position: clampedPos } });
      } else {
        await tx.demon.update({
          where: { id: demonId },
          data: { name, videoUrl, thumbnailVideoUrl, publisherName },
        });
      }
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/players");

    return { ok: true, message: "Demonio actualizado." };
  } catch (err) {
    console.error("[editDemonAction]", err);
    return { ok: false, message: "Error al guardar los cambios." };
  }
}

// ── Completions ───────────────────────────────────────────────────────────────

export async function deleteCompletionAction(completionId: number): Promise<void> {
  if (!(await isAdminAuthed())) return;
  await prisma.completion.delete({ where: { id: completionId } });
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/players");
}

// ── Progress ──────────────────────────────────────────────────────────────────

export async function deleteProgressAction(progressId: number): Promise<void> {
  if (!(await isAdminAuthed())) return;
  await prisma.progress.delete({ where: { id: progressId } });
  revalidatePath("/admin");
  revalidatePath("/players");
}
