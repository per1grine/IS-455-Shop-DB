import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    succeeded: true,
    command: "python jobs/run_inference.py",
    durationMs: 148,
    message: "Mock scoring run completed. Replace this route with a Supabase edge function, external API, or backend call later."
  });
}
