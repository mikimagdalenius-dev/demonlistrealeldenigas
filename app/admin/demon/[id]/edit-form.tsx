"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { editDemonAction } from "../../actions";

type Props = {
  demonId: number;
  defaultName: string;
  defaultVideoUrl: string;
  defaultPublisherName: string;
  defaultPosition: number;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="pc-btn" disabled={pending}>
      {pending ? "Guardando..." : "Guardar cambios"}
    </button>
  );
}

export function EditDemonForm({
  demonId,
  defaultName,
  defaultVideoUrl,
  defaultPublisherName,
  defaultPosition,
}: Props) {
  const router = useRouter();
  const [state, action] = useActionState(editDemonAction, { ok: false, message: "" });

  if (state.ok) {
    router.push("/admin");
  }

  return (
    <div className="pc-form" style={{ maxWidth: 500, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button
          type="button"
          className="pc-btn pc-btn-secondary"
          style={{ fontSize: 13, padding: "6px 12px" }}
          onClick={() => router.push("/admin")}
        >
          ← Volver
        </button>
        <div style={{ fontWeight: 800, fontSize: 18, color: "#1f2430" }}>
          Editar demonio
        </div>
      </div>

      <form action={action}>
        <input type="hidden" name="demonId" value={demonId} />

        <div className="mb-4">
          <label htmlFor="name">Nombre</label>
          <input id="name" name="name" defaultValue={defaultName} required />
        </div>

        <div className="mb-4">
          <label htmlFor="videoUrl">URL del vídeo</label>
          <input id="videoUrl" name="videoUrl" type="url" defaultValue={defaultVideoUrl} required />
        </div>

        <div className="mb-4">
          <label htmlFor="publisherName">Publisher</label>
          <input id="publisherName" name="publisherName" defaultValue={defaultPublisherName} required />
        </div>

        <div className="mb-5">
          <label htmlFor="position">Posición</label>
          <input id="position" name="position" type="number" min={1} defaultValue={defaultPosition} required />
        </div>

        <SubmitButton />

        {state.message && (
          <p className={`pc-toast ${state.ok ? "pc-toast-ok" : "pc-toast-error"}`}>
            {state.message}
          </p>
        )}
      </form>
    </div>
  );
}
