"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.getAttribute("data-theme") === "dark");
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  if (!mounted) return <div style={{ width: 36, height: 36 }} />;

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Modo día" : "Modo noche"}
      title={dark ? "Modo día" : "Modo noche"}
      className="pc-theme-btn"
    >
      {dark ? "☀" : "☾"}
    </button>
  );
}
