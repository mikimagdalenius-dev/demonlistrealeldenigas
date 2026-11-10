// Piezas compartidas del catálogo: número de posición y lectura de puntos.

export function CatNum({ n }: { n: number }) {
  return <span className="pc-entry-num" aria-label={`Position ${n}`}>#{String(n).padStart(2, "0")}</span>;
}

/** 10 celdas; cada una vale 50 pts (500 = #1 = todas encendidas). */
export function Readout({ points }: { points: number }) {
  const on = Math.min(10, Math.max(1, Math.ceil(points / 50)));
  return (
    <span className="pc-readout" aria-hidden="true">
      {Array.from({ length: 10 }, (_, i) => (
        <i key={i} className={i < on ? "on" : undefined} />
      ))}
    </span>
  );
}

export function Points({ points }: { points: number }) {
  return (
    <span className="pc-pts">
      {points}
      <small>PTS</small>
    </span>
  );
}
