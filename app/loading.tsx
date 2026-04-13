export default function Loading() {
  return (
    <section className="pc-list-only">
      {Array.from({ length: 5 }).map((_, idx) => (
        <div key={idx} className="pc-skeleton" style={{ animationDelay: `${idx * 60}ms` }}>
          <div className="pc-skeleton-thumb" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "4px 0" }}>
            {/* Título grande */}
            <div className="pc-skeleton-line" style={{ height: 36, width: "72%" }} />
            {/* Meta: published by */}
            <div className="pc-skeleton-line" style={{ height: 14, width: "38%" }} />
            {/* Pts badge + botón video */}
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <div className="pc-skeleton-line" style={{ height: 28, width: 100, borderRadius: 0 }} />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
