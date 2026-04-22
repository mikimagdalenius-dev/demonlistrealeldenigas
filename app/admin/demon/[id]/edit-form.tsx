"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { editDemonAction } from "../../actions";
import { youtubeThumbnail } from "@/lib/youtube";

type VideoOption = { label: string; videoUrl: string };

type Props = {
  demonId: number;
  defaultName: string;
  defaultVideoUrl: string;
  defaultPublisherName: string;
  defaultPosition: number;
  defaultThumbnailVideoUrl: string;
  allVideos: VideoOption[];
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
  defaultThumbnailVideoUrl,
  allVideos,
}: Props) {
  const router = useRouter();
  const [state, action] = useActionState(editDemonAction, { ok: false, message: "" });
  const [selectedThumb, setSelectedThumb] = useState(defaultThumbnailVideoUrl || "");

  // Redirigir tras éxito dentro de un efecto para no navegar en render
  useEffect(() => {
    if (state.ok) router.push("/admin");
  }, [state.ok, router]);

  return (
    <div className="pc-form" style={{ maxWidth: 560, margin: "0 auto" }}>
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
        <input type="hidden" name="thumbnailVideoUrl" value={selectedThumb} />

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

        {allVideos.length > 0 && (
          <div className="mb-5">
            <label style={{ display: "block", marginBottom: 8 }}>Miniatura</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {/* Opción "automática" */}
              <div
                onClick={() => setSelectedThumb("")}
                style={{
                  cursor: "pointer",
                  border: selectedThumb === "" ? "2px solid #3f82bc" : "2px solid transparent",
                  outline: selectedThumb === "" ? "none" : "1px dashed #ccc",
                  padding: 3,
                  position: "relative",
                }}
              >
                <img
                  src={youtubeThumbnail(allVideos[0].videoUrl)}
                  alt="Auto"
                  style={{ width: 120, height: 68, objectFit: "cover", display: "block", opacity: 0.5 }}
                />
                <div style={{ fontSize: 10, textAlign: "center", marginTop: 3, color: "#666", fontWeight: 600 }}>
                  AUTO
                </div>
              </div>

              {allVideos.map((v, i) => {
                const isSelected = selectedThumb === v.videoUrl;
                return (
                  <div
                    key={i}
                    onClick={() => setSelectedThumb(v.videoUrl)}
                    style={{
                      cursor: "pointer",
                      border: isSelected ? "2px solid #3f82bc" : "2px solid transparent",
                      outline: isSelected ? "none" : "1px dashed #ccc",
                      padding: 3,
                    }}
                  >
                    <img
                      src={youtubeThumbnail(v.videoUrl)}
                      alt={v.label}
                      style={{ width: 120, height: 68, objectFit: "cover", display: "block" }}
                    />
                    <div style={{ fontSize: 10, textAlign: "center", marginTop: 3, color: "#333", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {v.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
