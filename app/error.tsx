"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/error] unhandled", error);
  }, [error]);

  return (
    <div
      className="pc-card"
      style={{
        maxWidth: 520,
        margin: "60px auto",
        padding: 28,
        textAlign: "center",
      }}
    >
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
        Algo ha ido mal.
      </h2>
      <p style={{ color: "#4b5563", marginBottom: 20, lineHeight: 1.5 }}>
        Hubo un error cargando esta sección. Prueba a reintentar; si persiste,
        recarga la página.
      </p>
      <div
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <button className="pc-btn" onClick={reset}>
          Reintentar
        </button>
        <a href="/" className="pc-btn pc-btn-secondary">
          Ir al inicio
        </a>
      </div>
    </div>
  );
}
