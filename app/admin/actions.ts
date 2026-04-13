"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  checkAdminPassword,
  setAdminCookie,
  clearAdminCookie,
  isAdminAuthed,
} from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

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

    // Swap usando posición temporal para no violar unique constraint
    await tx.demon.update({ where: { id: demon.id }, data: { position: 0 } });
    await tx.demon.update({
      where: { id: neighbor.id },
      data: { position: demon.position },
    });
    await tx.demon.update({
      where: { id: demon.id },
      data: { position: targetPosition },
    });
  });

  revalidatePath("/");
  revalidatePath("/admin");
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
    const videoUrl = String(formData.get("videoUrl") ?? "").trim();
    const publisherName = String(formData.get("publisherName") ?? "").trim();
    const newPosition = Number(formData.get("position"));

    if (!name || !videoUrl || !publisherName || !Number.isInteger(newPosition) || newPosition < 1) {
      return { ok: false, message: "Rellena todos los campos correctamente." };
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
          data: { name, videoUrl, publisherName, position: clampedPos },
        });
      } else {
        await tx.demon.update({
          where: { id: demonId },
          data: { name, videoUrl, publisherName },
        });
      }
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/players");

    return { ok: true, message: "Demonio actualizado." };
  } catch {
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
