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
      {pending ? "Saving..." : "Save changes"}
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
    <div className="pc-form pc-form-sheet" style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button
          type="button"
          className="pc-btn pc-btn-secondary pc-btn-small"
          onClick={() => router.push("/admin")}
        >
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
            <path d="M13 5H1M5 1 1 5l4 4" />
          </svg>
          Back
        </button>
        <h1 className="pc-demon-title">Edit demon</h1>
      </div>

      <form action={action}>
        <input type="hidden" name="demonId" value={demonId} />
        <input type="hidden" name="thumbnailVideoUrl" value={selectedThumb} />

        <div className="mb-4">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" defaultValue={defaultName} required />
        </div>

        <div className="mb-4">
          <label htmlFor="videoUrl">Video URL</label>
          <input id="videoUrl" name="videoUrl" type="url" defaultValue={defaultVideoUrl} required />
        </div>

        <div className="mb-4">
          <label htmlFor="publisherName">Publisher</label>
          <input id="publisherName" name="publisherName" defaultValue={defaultPublisherName} required />
        </div>

        <div className="mb-5">
          <label htmlFor="position">Position</label>
          <input id="position" name="position" type="number" min={1} defaultValue={defaultPosition} required />
        </div>

        {allVideos.length > 0 && (
          <div className="mb-5">
            <label>Thumbnail</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {/* Opción "automática" */}
              <button
                type="button"
                onClick={() => setSelectedThumb("")}
                className={`pc-thumb-pick ${selectedThumb === "" ? "is-selected" : ""}`}
                aria-pressed={selectedThumb === ""}
              >
                <img
                  src={youtubeThumbnail(allVideos[0].videoUrl)}
                  alt="Auto"
                  style={{ opacity: 0.5 }}
                />
                <span>Auto</span>
              </button>

              {allVideos.map((v, i) => {
                const isSelected = selectedThumb === v.videoUrl;
                return (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setSelectedThumb(v.videoUrl)}
                    className={`pc-thumb-pick ${isSelected ? "is-selected" : ""}`}
                    aria-pressed={isSelected}
                  >
                    <img
                      src={youtubeThumbnail(v.videoUrl)}
                      alt={v.label}
                    />
                    <span>{v.label}</span>
                  </button>
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
