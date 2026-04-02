import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { CUSTOMER_COOKIE, getCustomer } from "@/lib/mock-data";

export async function getActiveCustomer() {
  const cookieStore = await cookies();
  const rawCustomerId = cookieStore.get(CUSTOMER_COOKIE)?.value;
  const customerId = rawCustomerId ? Number(rawCustomerId) : undefined;

  if (!customerId || Number.isNaN(customerId)) {
    return undefined;
  }

  return getCustomer(customerId);
}

export async function requireCustomer() {
  const customer = await getActiveCustomer();

  if (!customer) {
    redirect("/select-customer");
  }

  return customer;
}
