import { submitDemon } from "./actions";

export default function SubmitPage() {
  return (
    <section className="pc-list-only">
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
    </section>
  );
}
