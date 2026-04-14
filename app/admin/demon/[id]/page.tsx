import { notFound, redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { EditDemonForm } from "./edit-form";

export const dynamic = "force-dynamic";

export default async function EditDemonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const authed = await isAdminAuthed();
  if (!authed) redirect("/admin");

  const { id } = await params;
  const demonId = Number(id);

  if (!Number.isInteger(demonId) || demonId < 1) notFound();

  const demon = await prisma.demon.findUnique({
    where: { id: demonId },
    include: {
      completions: {
        include: { player: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!demon) notFound();

  const allVideos = [
    { label: `${demon.publisherName} (vídeo del demon)`, videoUrl: demon.videoUrl },
    ...demon.completions
      .filter((c) => c.videoUrl.trim().length > 0)
      .map((c) => ({ label: c.player.name, videoUrl: c.videoUrl })),
  ];

  return (
    <EditDemonForm
      demonId={demon.id}
      defaultName={demon.name}
      defaultVideoUrl={demon.videoUrl}
      defaultPublisherName={demon.publisherName}
      defaultPosition={demon.position}
      defaultThumbnailVideoUrl={demon.thumbnailVideoUrl ?? ""}
      allVideos={allVideos}
    />
  );
}
