"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { initialSubmitState, submitDemon } from "./actions";

type SubmitFormProps = {
  players: string[];
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="pc-btn" disabled={pending}>
      {pending ? "Submitting..." : "Submit"}
    </button>
  );
}

export function SubmitForm({ players }: SubmitFormProps) {
  const [addingNew, setAddingNew] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(players[0] ?? "Miki");
  const [state, formAction] = useActionState(submitDemon, initialSubmitState);

  const selectOptions = useMemo(() => {
    const unique = Array.from(new Set(players));
    return unique;
  }, [players]);

  return (
    <form action={formAction} className="pc-form">
      <div className="mb-4">
        <label htmlFor="name">Demon name</label>
        <input id="name" name="name" required />
      </div>

      <div className="mb-4">
        <label htmlFor="videoUrl">Video link</label>
        <input id="videoUrl" name="videoUrl" type="url" required />
      </div>

      <div className="mb-2">
        <label htmlFor="playerName">Player</label>
        <select
          id="playerName"
          name="playerName"
          className="pc-select"
          value={addingNew ? "__new__" : selectedPlayer}
          onChange={(event) => {
            const value = event.target.value;
            if (value === "__new__") {
              setAddingNew(true);
            } else {
              setAddingNew(false);
              setSelectedPlayer(value);
            }
          }}
        >
          {selectOptions.map((player) => (
            <option key={player} value={player}>
              {player}
            </option>
          ))}
          <option value="__new__">+ Add new player</option>
        </select>
      </div>

      <button
        type="button"
        className="pc-btn pc-btn-secondary mb-4"
        onClick={() => setAddingNew((prev) => !prev)}
      >
        {addingNew ? "Cancel new player" : "Add new player"}
      </button>

      {addingNew && (
        <div className="mb-4">
          <label htmlFor="newPlayerName">New player name</label>
          <input id="newPlayerName" name="newPlayerName" placeholder="Type player name" required={addingNew} />
        </div>
      )}

      <div className="mb-5">
        <label htmlFor="provisionalPosition">Provisional position</label>
        <input id="provisionalPosition" name="provisionalPosition" type="number" min={1} required />
      </div>

      <SubmitButton />

      {state.message && (
        <p className={`pc-toast ${state.ok ? "pc-toast-ok" : "pc-toast-error"}`}>{state.message}</p>
      )}
    </form>
  );
}
