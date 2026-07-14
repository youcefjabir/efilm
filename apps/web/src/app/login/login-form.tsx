"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

const ERRORS: Record<string, string> = {
  missing_token: "The sign-in link was incomplete. Request a new one.",
  invalid_or_expired: "That sign-in link is invalid or has expired. Request a new one.",
  access_denied: "Access denied. This app is limited to its owner account.",
};

export function LoginForm() {
  const params = useSearchParams();
  const urlError = params.get("error");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/auth/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState("error");
        setMessage(data.error ?? "Something went wrong.");
      } else {
        setState("sent");
        setMessage(data.message);
      }
    } catch {
      setState("error");
      setMessage("Network error. Is the server running?");
    }
  }

  return (
    <form onSubmit={submit}>
      {urlError && <p className="error-text">{ERRORS[urlError] ?? "Sign-in failed."}</p>}
      <label className="field">
        <span className="lbl">Email</span>
        <input
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="owner@example.com"
          autoComplete="email"
        />
      </label>
      <button className="btn primary" type="submit" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send sign-in link"}
      </button>
      {state === "sent" && <p className="ok-text" style={{ marginTop: 10 }}>{message}</p>}
      {state === "error" && <p className="error-text" style={{ marginTop: 10 }}>{message}</p>}
    </form>
  );
}
