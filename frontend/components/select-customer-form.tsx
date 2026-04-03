"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Customer } from "@/lib/types";
import { CUSTOMER_COOKIE } from "@/lib/types";

type SelectCustomerFormProps = {
  customers: Customer[];
};

export function SelectCustomerForm({ customers }: SelectCustomerFormProps) {
  const router = useRouter();
  const [customer_id, setCustomerId] = useState<string>(String(customers[0]?.customer_id ?? ""));

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log("handleSubmit fired, customer_id:", customer_id);
    if (!customer_id) {
      return;
    }
    document.cookie = `${CUSTOMER_COOKIE}=${customer_id}; path=/; max-age=2592000; samesite=lax`;
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form className="stack-lg" onSubmit={handleSubmit}>
      <label className="stack-sm">
        <span className="field-label">Customer</span>
        <select
          className="input"
          value={customer_id}
          onChange={(event) => setCustomerId(event.target.value)}
        >
          {customers.map((customer) => (
            <option key={customer.customer_id} value={customer.customer_id}>
              {customer.full_name} ({customer.email}) | {customer.customer_segment} / {customer.loyalty_tier} | {customer.state}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="button button-primary">
        Use This Customer
      </button>
    </form>
  );
}
