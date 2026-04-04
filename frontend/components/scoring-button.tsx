"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ScoringResponse = {
  succeeded: boolean;
  message: string;
  durationMs: number;
};

export function ScoringButton() {
  const router = useRouter();
  const [status, setStatus] = useState<string>("");
  const [succeeded, setSucceeded] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  async function runScoring() {
    setBusy(true);
    setStatus("");
    setSucceeded(null);

    try {
      const response = await fetch("/api/scoring/run", { method: "POST" });
      const data = (await response.json()) as ScoringResponse;
      setSucceeded(data.succeeded);
      setStatus(data.message);

      if (data.succeeded) {
        // Refresh the page so the updated priority queue loads
        setTimeout(() => router.refresh(), 2000);
      }
    } catch {
      setSucceeded(false);
      setStatus("Scoring request failed — check the server logs.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack-sm">
      <button
        type="button"
        className="button button-primary"
        onClick={runScoring}
        disabled={busy}
      >
        {busy ? "Running..." : "Run Scoring Job"}
      </button>
      {status ? (
        <div className={succeeded ? "note" : "status"}>{status}</div>
      ) : null}
    </div>
  );
}
