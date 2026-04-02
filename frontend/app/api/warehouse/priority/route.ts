import { NextResponse } from "next/server";

import { warehouseQueue } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(warehouseQueue);
}
