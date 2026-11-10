"use client";

import { useTransition } from "react";

type Result = { ok: true } | { ok: false; error: string };

export function ConfirmDeleteBtn({
  action,
  label = "Delete",
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
      className="pc-btn pc-btn-danger pc-btn-small"
    >
      {isPending ? "..." : label}
    </button>
  );
}
