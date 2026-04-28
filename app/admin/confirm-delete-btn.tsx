"use client";

import { useTransition } from "react";

type Result = { ok: true } | { ok: false; error: string };

export function ConfirmDeleteBtn({
  action,
  label = "Borrar",
  confirmMsg,
}: {
  action: () => Promise<Result>;
  label?: string;
  confirmMsg: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(confirmMsg)) return;
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        // Sin librería de toasts en el proyecto — alert es suficiente para
        // un panel de admin con muy poco tráfico.
        window.alert(result.error);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      style={{
        border: "1px dashed #c0392b",
        background: isPending ? "#c0392b" : "#e74c3c",
        color: "#fff",
        fontWeight: 700,
        padding: "5px 10px",
        fontSize: 13,
        cursor: isPending ? "not-allowed" : "pointer",
        opacity: isPending ? 0.7 : 1,
      }}
    >
      {isPending ? "..." : label}
    </button>
  );
}
