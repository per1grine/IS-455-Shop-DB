import { NextResponse } from "next/server";

export async function POST() {
  const pat = process.env.GITHUB_PAT;
  const start = Date.now();

  if (!pat) {
    return NextResponse.json({
      succeeded: false,
      message: "No GITHUB_PAT configured.",
      durationMs: 0,
    });
  }

  try {
    const response = await fetch(
      "https://api.github.com/repos/per1grine/IS-455-Shop-DB/actions/workflows/daily_scoring.yml/dispatches",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${pat}`,
          "Accept": "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ref: "main" }),
      }
    );

    const responseText = await response.text();
    console.log("GitHub status:", response.status);
    console.log("GitHub response:", responseText);

    if (!response.ok) {
      throw new Error(`GitHub responded ${response.status}: ${responseText}`);
    }
    if (!response.ok) {
      throw new Error(`GitHub responded ${response.status}`);
    }

    return NextResponse.json({
      succeeded: true,
      message: "Scoring job triggered! Results will appear in 30–60 seconds.",
      durationMs: Date.now() - start,
    });
  } catch (err) {
    return NextResponse.json({
      succeeded: false,
      message: `Trigger failed: ${err instanceof Error ? err.message : String(err)}`,
      durationMs: Date.now() - start,
    }, { status: 502 });
  }
}
