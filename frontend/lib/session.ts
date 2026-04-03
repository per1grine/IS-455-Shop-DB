import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import supabase from "@/lib/supabaseClient";
import

export async function getActiveCustomer() {
  const cookieStore = await cookies();
  const rawCustomerId = cookieStore.get(CUSTOMER_COOKIE)?.value;
  const customer_id = rawCustomerId ? Number(rawCustomerId) : undefined;

  if (!customer_id || Number.isNaN(customer_id)) {
    return undefined;
  }

  return getCustomer(customer_id);
}

export async function requireCustomer() {
  const customer = await getActiveCustomer();

  if (!customer) {
    redirect("/select-customer");
  }

  return customer;
}
