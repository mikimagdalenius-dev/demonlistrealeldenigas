export default function Loading() {
  return (
    <section className="pc-list-only" aria-busy="true" aria-label="Cargando">
      {Array.from({ length: 5 }).map((_, idx) => (
        <div key={idx} className="pc-skeleton">
          <div className="pc-skeleton-block" style={{ height: 44, width: 72 }} />
          <div className="pc-skeleton-block" style={{ aspectRatio: "16 / 9" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="pc-skeleton-block" style={{ height: 20, width: "55%" }} />
            <div className="pc-skeleton-block" style={{ height: 12, width: "30%" }} />
          </div>
        </div>
      ))}
    </section>
  );
}
