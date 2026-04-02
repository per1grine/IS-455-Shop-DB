"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Customer } from "@/lib/mock-data";
import { CUSTOMER_COOKIE } from "@/lib/mock-data";

type SelectCustomerFormProps = {
  customers: Customer[];
};

export function SelectCustomerForm({ customers }: SelectCustomerFormProps) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState<string>(String(customers[0]?.customerId ?? ""));

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!customerId) {
      return;
    }

    document.cookie = `${CUSTOMER_COOKIE}=${customerId}; path=/; max-age=2592000; samesite=lax`;
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form className="stack-lg" onSubmit={handleSubmit}>
      <label className="stack-sm">
        <span className="field-label">Customer</span>
        <select
          className="input"
          value={customerId}
          onChange={(event) => setCustomerId(event.target.value)}
        >
          {customers.map((customer) => (
            <option key={customer.customerId} value={customer.customerId}>
              {customer.fullName} ({customer.email}) | {customer.segment} / {customer.loyaltyTier} | {customer.state}
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
