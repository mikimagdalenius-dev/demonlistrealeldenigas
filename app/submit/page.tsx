import { submitDemon } from "./actions";

export default function SubmitPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Submit Demon</h1>
        <p className="mt-2 text-zinc-400">Add a new demon to the private list.</p>
      </div>

      <form action={submitDemon} className="space-y-4 rounded-lg border border-zinc-800 p-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Demon name
          </label>
          <input
            id="name"
            name="name"
            required
            className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="videoUrl" className="text-sm font-medium">
            Video link
          </label>
          <input
            id="videoUrl"
            name="videoUrl"
            type="url"
            required
            className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="publisherName" className="text-sm font-medium">
            Publisher name
          </label>
          <input
            id="publisherName"
            name="publisherName"
            required
            className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="difficulty" className="text-sm font-medium">
            Difficulty rating
          </label>
          <input
            id="difficulty"
            name="difficulty"
            type="number"
            min={1}
            max={10}
            required
            className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500"
        >
          Submit
        </button>
      </form>
    </section>
  );
}
