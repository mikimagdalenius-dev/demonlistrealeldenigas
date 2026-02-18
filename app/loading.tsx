export default function Loading() {
  return (
    <section className="pc-list-only">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="pc-skeleton">
          <div className="pc-skeleton-thumb" />
          <div>
            <div className="pc-skeleton-line w-80" />
            <div className="pc-skeleton-line w-60" />
            <div className="pc-skeleton-line w-40" />
          </div>
        </div>
      ))}
    </section>
  );
}
