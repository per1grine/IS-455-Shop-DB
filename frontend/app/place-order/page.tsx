import { PlaceOrderForm } from "@/components/place-order-form";
import { products } from "@/lib/mock-data";
import { requireCustomer } from "@/lib/session";

export default async function PlaceOrderPage() {
  const customer = await requireCustomer();

  return (
    <div className="stack-xl">
      <section className="hero">
        <div className="eyebrow">Order Entry</div>
        <h1 className="hero-title">Place an order for {customer.fullName}</h1>
        <p className="hero-copy">
          Build the user experience now, then swap the mock submit for Supabase or an API call later.
        </p>
      </section>

      <section className="panel" style={{ padding: "1.5rem" }}>
        <PlaceOrderForm customer={customer} products={products} />
      </section>
    </div>
  );
}
