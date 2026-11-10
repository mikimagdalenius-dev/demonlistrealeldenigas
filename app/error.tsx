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
      <h2 className="pc-demon-title" style={{ marginBottom: 12 }}>
        Something went wrong.
      </h2>
      <p style={{ color: "var(--ink-2)", marginBottom: 24, lineHeight: 1.5 }}>
        This section failed to load. Try again; if it keeps happening,
        reload the page.
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
          Try again
        </button>
        <a href="/" className="pc-btn pc-btn-secondary">
          Go home
        </a>
      </div>
    </div>
  );
}
