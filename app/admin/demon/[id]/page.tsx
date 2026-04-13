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

  const demon = await prisma.demon.findUnique({ where: { id: demonId } });
  if (!demon) notFound();

  return (
    <EditDemonForm
      demonId={demon.id}
      defaultName={demon.name}
      defaultVideoUrl={demon.videoUrl}
      defaultPublisherName={demon.publisherName}
      defaultPosition={demon.position}
    />
  );
}
