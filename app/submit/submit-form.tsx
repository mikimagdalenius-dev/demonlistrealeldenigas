"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitDemon, submitProgress } from "./actions";

type SubmitFormProps = {
  players: string[];
  demons: { id: number; name: string; position: number }[];
};

type SubmitState = {
  ok: boolean;
  message: string;
};

const initialSubmitState: SubmitState = {
  ok: false,
  message: ""
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="pc-btn" disabled={pending}>
      {pending ? "Submitting..." : label}
    </button>
  );
}

function PlayerFields({
  players,
  addingNew,
  selectedPlayer,
  setAddingNew,
  setSelectedPlayer
}: {
  players: string[];
  addingNew: boolean;
  selectedPlayer: string;
  setAddingNew: (v: boolean) => void;
  setSelectedPlayer: (v: string) => void;
}) {
  const options = useMemo(() => Array.from(new Set(players)), [players]);

  return (
    <>
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
          {options.map((player) => (
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
        onClick={() => setAddingNew(!addingNew)}
      >
        {addingNew ? "Cancel new player" : "Add new player"}
      </button>

      {addingNew && (
        <div className="mb-4">
          <label htmlFor="newPlayerName">New player name</label>
          <input id="newPlayerName" name="newPlayerName" placeholder="Type player name" required={addingNew} />
        </div>
      )}
    </>
  );
}

export function SubmitForm({ players, demons }: SubmitFormProps) {
  const [tab, setTab] = useState<"new" | "progress">("new");
  const [addingNew, setAddingNew] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(players[0] ?? "Miki");

  const [newState, newAction] = useActionState(submitDemon, initialSubmitState);
  const [progressState, progressAction] = useActionState(submitProgress, initialSubmitState);

  return (
    <div className="pc-form">
      <div className="pc-submit-tabs mb-4">
        <button
          type="button"
          className={`pc-submit-tab ${tab === "new" ? "is-active" : ""}`}
          onClick={() => setTab("new")}
        >
          New demon
        </button>
        <button
          type="button"
          className={`pc-submit-tab ${tab === "progress" ? "is-active" : ""}`}
          onClick={() => setTab("progress")}
        >
          Existing demon %
        </button>
      </div>

      {tab === "new" ? (
        <form action={newAction}>
          <div className="mb-4">
            <label htmlFor="name">Demon name</label>
            <input id="name" name="name" required />
          </div>

          <div className="mb-4">
            <label htmlFor="videoUrl">Video link</label>
            <input id="videoUrl" name="videoUrl" type="url" required />
          </div>

          <PlayerFields
            players={players}
            addingNew={addingNew}
            selectedPlayer={selectedPlayer}
            setAddingNew={setAddingNew}
            setSelectedPlayer={setSelectedPlayer}
          />

          <div className="mb-5">
            <label htmlFor="provisionalPosition">Provisional position</label>
            <input id="provisionalPosition" name="provisionalPosition" type="number" min={1} required />
          </div>

          <SubmitButton label="Submit demon" />

          {newState.message && (
            <p className={`pc-toast ${newState.ok ? "pc-toast-ok" : "pc-toast-error"}`}>
              {newState.message}
            </p>
          )}
        </form>
      ) : (
        <form action={progressAction}>
          <div className="mb-4">
            <label htmlFor="existingDemonId">Select existing demon</label>
            <select id="existingDemonId" name="existingDemonId" className="pc-select" required>
              <option value="">Choose demon...</option>
              {demons.map((demon) => (
                <option key={demon.id} value={demon.id}>
                  #{demon.position} — {demon.name}
                </option>
              ))}
            </select>
          </div>

          <PlayerFields
            players={players}
            addingNew={addingNew}
            selectedPlayer={selectedPlayer}
            setAddingNew={setAddingNew}
            setSelectedPlayer={setSelectedPlayer}
          />

          <div className="mb-5">
            <label htmlFor="percentage">Progress percentage (1-100)</label>
            <input id="percentage" name="percentage" type="number" min={1} max={100} required />
          </div>

          <SubmitButton label="Submit progress" />

          {progressState.message && (
            <p className={`pc-toast ${progressState.ok ? "pc-toast-ok" : "pc-toast-error"}`}>
              {progressState.message}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
