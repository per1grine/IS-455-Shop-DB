import { notFound } from "next/navigation";

import { getOrder } from "@/lib/mock-data";

type OrderDetailPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = await params;
  const order = getOrder(Number(orderId));

  if (!order) {
    notFound();
  }

  return (
    <div className="stack-xl">
      <section className="hero">
        <div className="eyebrow">Order Detail</div>
        <h1 className="hero-title">Order #{order.orderId}</h1>
        <p className="hero-copy">
          {order.customerName} | {order.orderDateTime} | {order.shippingState}
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
                {order.lines.map((line) => (
                  <tr key={`${order.orderId}-${line.productId}`}>
                    <td>{line.productName}</td>
                    <td>{line.sku}</td>
                    <td>{line.quantity}</td>
                    <td>${line.unitPrice.toFixed(2)}</td>
                    <td>${line.lineTotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="stack-lg">
          <div className="panel" style={{ padding: "1.5rem" }}>
            <div className="eyebrow">Totals</div>
            <div className="stack-sm">
              <div className="row-between"><span>Subtotal</span><strong>${order.subtotal.toFixed(2)}</strong></div>
              <div className="row-between"><span>Shipping</span><strong>${order.shippingFee.toFixed(2)}</strong></div>
              <div className="row-between"><span>Tax</span><strong>${order.taxAmount.toFixed(2)}</strong></div>
              <div className="row-between"><span>Order Total</span><strong>${order.total.toFixed(2)}</strong></div>
            </div>
          </div>

          <div className="panel" style={{ padding: "1.5rem" }}>
            <div className="eyebrow">Prediction</div>
            <p className="muted">Priority bucket: <span className="badge">{order.priorityBucket}</span></p>
            <p className="muted">Priority score: {order.priorityScore.toFixed(1)}</p>
            <p className="muted">Billing ZIP: {order.billingZip}</p>
            <p className="muted">Shipping ZIP: {order.shippingZip}</p>
            <p className="muted">Reason: {order.predictionReason}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
