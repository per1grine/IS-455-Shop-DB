import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

type RouteProps = {
  params: Promise<{ orderId: string }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  const { orderId } = await params;

  const { data: order, error: orderError } = await supabaseServer
    .from("order_summary")
    .select("*")
    .eq("order_id", Number(orderId))
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const { data: items } = await supabaseServer
    .from("order_items")
    .select("*, products(product_name, category)")
    .eq("order_id", Number(orderId));

  return NextResponse.json({ ...order, items: items ?? [] });
}
