import { submitDemon } from "./actions";

export default function SubmitPage() {
  return (
    <section className="space-y-6">
      <div className="pc-panel p-6">
        <h1 className="pc-title">Submit Demon</h1>
        <p className="pc-subtitle mt-2">Send a demon entry to the private list database.</p>
      </div>

      <form action={submitDemon} className="pc-panel space-y-5 p-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Demon name
          </label>
          <input
            id="name"
            name="name"
            required
            className="w-full rounded-sm border border-zinc-700 bg-[#161616] px-3 py-2 text-zinc-100 outline-none ring-red-500/50 transition focus:border-red-500 focus:ring-2"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="videoUrl"
            className="text-xs font-semibold uppercase tracking-wide text-zinc-400"
          >
            Video link
          </label>
          <input
            id="videoUrl"
            name="videoUrl"
            type="url"
            required
            className="w-full rounded-sm border border-zinc-700 bg-[#161616] px-3 py-2 text-zinc-100 outline-none ring-red-500/50 transition focus:border-red-500 focus:ring-2"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="publisherName"
            className="text-xs font-semibold uppercase tracking-wide text-zinc-400"
          >
            Publisher / verifier
          </label>
          <input
            id="publisherName"
            name="publisherName"
            required
            className="w-full rounded-sm border border-zinc-700 bg-[#161616] px-3 py-2 text-zinc-100 outline-none ring-red-500/50 transition focus:border-red-500 focus:ring-2"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="difficulty"
            className="text-xs font-semibold uppercase tracking-wide text-zinc-400"
          >
            Difficulty (1-10)
          </label>
          <input
            id="difficulty"
            name="difficulty"
            type="number"
            min={1}
            max={10}
            required
            className="w-full rounded-sm border border-zinc-700 bg-[#161616] px-3 py-2 text-zinc-100 outline-none ring-red-500/50 transition focus:border-red-500 focus:ring-2"
          />
        </div>

        <button
          type="submit"
          className="rounded-sm bg-red-600 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-red-500"
        >
          Submit Entry
        </button>
      </form>
    </section>
  );
}
