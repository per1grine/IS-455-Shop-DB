import { NextResponse } from "next/server";

/**
 * POST /api/scoring/run
 *
 * Triggers the ML inference pipeline. There are two ways this can work
 * depending on your deployment setup — see the comments below.
 *
 * OPTION A (GitHub Actions / local server):
 *   Set SCORING_WEBHOOK_URL in .env.local to a URL that triggers
 *   run_inference.py externally (e.g. a GitHub Actions webhook or a small
 *   FastAPI endpoint running on a server). The route will POST to that URL.
 *
 * OPTION B (no external runner yet):
 *   If SCORING_WEBHOOK_URL is not set, the route returns a clear message
 *   telling the user to run the script manually. This is fine for demos.
 */
export async function POST() {
  const webhookUrl = process.env.SCORING_WEBHOOK_URL;
  const start = Date.now();

  if (!webhookUrl) {
    return NextResponse.json({
      succeeded: false,
      message:
        "No SCORING_WEBHOOK_URL configured. Run `python jobs/run_inference.py` manually " +
        "with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set, then refresh this page.",
      durationMs: 0,
    });
  }

  try {
    const upstream = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Pass the Supabase creds so the runner can connect
      body: JSON.stringify({
        supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabase_key: process.env.SUPABASE_SERVICE_ROLE_KEY,
      }),
    });

    if (!upstream.ok) {
      throw new Error(`Upstream responded ${upstream.status}`);
    }

    return NextResponse.json({
      succeeded: true,
      message: "Scoring job triggered successfully. Refresh the priority queue in a few seconds.",
      durationMs: Date.now() - start,
    });
  } catch (err) {
    return NextResponse.json(
      {
        succeeded: false,
        message: `Scoring trigger failed: ${err instanceof Error ? err.message : String(err)}`,
        durationMs: Date.now() - start,
      },
      { status: 502 }
    );
  }
}
