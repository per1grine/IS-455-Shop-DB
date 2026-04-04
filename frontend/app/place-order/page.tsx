import { PlaceOrderForm } from "@/components/place-order-form";
import { requireCustomer } from "@/lib/session";
import { supabaseServer } from "@/lib/supabaseServer";

export default async function PlaceOrderPage() {
  const customer = await requireCustomer();
  const { data: products } = await supabaseServer
    .from('products')
    .select('product_id, product_name, category, price')
    .eq('is_active', true)
    .order('category')
    .order('product_name');

  return (
    <div className="stack-xl">
      <section className="hero">
        <div className="eyebrow">Order Entry</div>
        <h1 className="hero-title">Place an order for {customer.full_name}</h1>
        <p className="hero-copy">
          Select products and fill in shipping details to create a new order.
        </p>
      </section>

      <section className="panel" style={{ padding: "1.5rem" }}>
        <PlaceOrderForm customer={customer} products={products ?? []} />
      </section>
    </div>
  );
}
