import { submitDemon } from "./actions";

export default function SubmitPage() {
  return (
    <section className="pc-grid">
      <div className="pc-stack">
        <article className="pc-card">
          <div className="pc-demon-row" style={{ gridTemplateColumns: "1fr" }}>
            <div>
              <div className="pc-demon-title">Submit Record</div>
              <div className="pc-demon-points">Add a demon to your private main list.</div>
            </div>
          </div>
        </article>

        <form action={submitDemon} className="pc-form">
          <div className="mb-4">
            <label htmlFor="name">Demon name</label>
            <input id="name" name="name" required />
          </div>

          <div className="mb-4">
            <label htmlFor="videoUrl">Video link</label>
            <input id="videoUrl" name="videoUrl" type="url" required />
          </div>

          <div className="mb-4">
            <label htmlFor="publisherName">Publisher / Verifier</label>
            <input id="publisherName" name="publisherName" required />
          </div>

          <div className="mb-5">
            <label htmlFor="difficulty">Difficulty (1-10)</label>
            <input id="difficulty" name="difficulty" type="number" min={1} max={10} required />
          </div>

          <button type="submit" className="pc-btn">
            Submit
          </button>
        </form>
      </div>

      <aside className="pc-stack">
        <section className="pc-side-block">
          <h2 className="pc-side-title">Submission Tips</h2>
          <p className="pc-side-text">
            Make sure the video is public and clearly shows the completion from start to finish.
          </p>
        </section>
      </aside>
    </section>
  );
}
