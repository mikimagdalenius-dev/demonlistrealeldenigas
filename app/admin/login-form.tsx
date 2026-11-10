"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="pc-btn" style={{ width: "100%", justifyContent: "center" }} disabled={pending}>
      {pending ? "Checking..." : "Log in"}
    </button>
  );
}

export function LoginForm() {
  const [state, action] = useActionState(loginAction, { error: "" });

  return (
    <div className="pc-form" style={{ maxWidth: 380, margin: "60px auto" }}>
      <div className="pc-caps" style={{ marginBottom: 24, color: "var(--ink)" }}>
        Admin · DEMONLIST ELDENIGAS
      </div>

      <form action={action}>
        <div className="mb-4">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoFocus
            autoComplete="off"
            required
          />
        </div>

        <SubmitButton />

        {state.error && (
          <p className="pc-toast pc-toast-error" style={{ marginTop: 12 }}>
            {state.error}
          </p>
        )}
      </form>
    </div>
  );
}
