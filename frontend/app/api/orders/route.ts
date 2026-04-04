import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(request: NextRequest) {
  const customerId = request.nextUrl.searchParams.get("customerId");

  let query = supabaseServer
    .from("order_summary")
    .select("*")
    .order("order_datetime", { ascending: false });

  if (customerId) {
    query = query.eq("customer_id", Number(customerId));
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
