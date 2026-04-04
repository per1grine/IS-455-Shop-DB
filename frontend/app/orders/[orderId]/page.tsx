import { notFound } from "next/navigation";
import { requireCustomer } from "@/lib/session";
import { supabaseServer } from "@/lib/supabaseServer";

type OrderDetailPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = await params;
  const customer = await requireCustomer();

  const { data: order } = await supabaseServer
    .from('orders')
    .select(`
      order_id, customer_id, order_datetime, payment_method, device_type,
      billing_zip, shipping_zip, shipping_state,
      order_subtotal, shipping_fee, tax_amount, order_total
    `)
    .eq('order_id', Number(orderId))
    .eq('customer_id', customer.customer_id)
    .single();

  if (!order) {
    notFound();
  }

  const [{ data: lines }, { data: predictions }] = await Promise.all([
    supabaseServer
      .from('order_items')
      .select(`quantity, unit_price, line_total, products (product_name, sku, category)`)
      .eq('order_id', Number(orderId)),
    supabaseServer
      .from('order_predictions')
      .select('priority_bucket, predicted_priority_score, prediction_reason')
      .eq('order_id', Number(orderId))
      .maybeSingle(),
  ]);

  const prediction = predictions;

  return (
    <div className="stack-xl">
      <section className="hero">
        <div className="eyebrow">Order Detail</div>
        <h1 className="hero-title">Order #{order.order_id}</h1>
        <p className="hero-copy">
          {customer.full_name} | {order.order_datetime} | {order.shipping_state}
        </p>
      </section>

      <div className="grid grid-2">
        <section className="panel" style={{ padding: "1.5rem" }}>
          <div className="eyebrow">Line Items</div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {(lines ?? []).map((line, index) => {
                  const product = Array.isArray(line.products) ? line.products[0] : line.products;
                  return (
                    <tr key={index}>
                      <td>{product?.product_name}</td>
                      <td>{product?.sku}</td>
                      <td>{line.quantity}</td>
                      <td>${line.unit_price.toFixed(2)}</td>
                      <td>${line.line_total.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="stack-lg">
          <div className="panel" style={{ padding: "1.5rem" }}>
            <div className="eyebrow">Totals</div>
            <div className="stack-sm">
              <div className="row-between"><span>Subtotal</span><strong>${order.order_subtotal.toFixed(2)}</strong></div>
              <div className="row-between"><span>Shipping</span><strong>${order.shipping_fee.toFixed(2)}</strong></div>
              <div className="row-between"><span>Tax</span><strong>${order.tax_amount.toFixed(2)}</strong></div>
              <div className="row-between"><span>Order Total</span><strong>${order.order_total.toFixed(2)}</strong></div>
            </div>
          </div>

          <div className="panel" style={{ padding: "1.5rem" }}>
            <div className="eyebrow">Prediction</div>
            <p className="muted">Priority bucket: <span className="badge">{prediction?.priority_bucket ?? 'unscored'}</span></p>
            <p className="muted">Priority score: {prediction?.predicted_priority_score?.toFixed(1) ?? 'N/A'}</p>
            <p className="muted">Billing ZIP: {order.billing_zip}</p>
            <p className="muted">Shipping ZIP: {order.shipping_zip}</p>
            <p className="muted">Reason: {prediction?.prediction_reason ?? 'N/A'}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
