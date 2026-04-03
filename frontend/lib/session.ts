import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CUSTOMER_COOKIE } from "@/lib/types";
import { supabase } from "@/lib/supabaseClient";

export async function getActiveCustomer() {
  const cookieStore = await cookies();
  const rawCustomerId = cookieStore.get(CUSTOMER_COOKIE)?.value;
  const customer_id = rawCustomerId ? Number(rawCustomerId) : undefined;

  if (!customer_id || Number.isNaN(customer_id)) {
    return undefined;
  }

  const { data: customer } = await supabase
    .from('customer_summary')
    .select('*')
    .eq('customer_id', customer_id)
    .single();

  return customer ?? undefined;
}

export async function requireCustomer() {
  const customer = await getActiveCustomer();
  if (!customer) {
    redirect("/select-customer");
  }
  return customer;
}