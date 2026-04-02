"use client";

import { useState } from "react";

type ScoringResponse = {
  succeeded: boolean;
  command: string;
  durationMs: number;
  message: string;
};

export function ScoringButton() {
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function runScoring() {
    setBusy(true);
    setStatus("");

    try {
      const response = await fetch("/api/scoring/run", { method: "POST" });
      const data = (await response.json()) as ScoringResponse;
      setStatus(`${data.message} Command: ${data.command}. Duration: ${data.durationMs}ms.`);
    } catch {
      setStatus("Scoring request failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack-sm">
      <button type="button" className="button button-primary" onClick={runScoring} disabled={busy}>
        {busy ? "Running..." : "Run Scoring Job"}
      </button>
      {status ? <div className="note">{status}</div> : null}
    </div>
  );
}
