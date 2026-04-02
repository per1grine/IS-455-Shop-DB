import { NextResponse } from "next/server";

import { getOrder } from "@/lib/mock-data";

type RouteProps = {
  params: Promise<{ orderId: string }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  const { orderId } = await params;
  const order = getOrder(Number(orderId));

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}
