import { NextRequest, NextResponse } from "next/server";

import { getOrdersForCustomer } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const customerId = Number(request.nextUrl.searchParams.get("customerId"));
  return NextResponse.json(getOrdersForCustomer(customerId));
}
