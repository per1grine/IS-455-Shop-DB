import Link from "next/link";

import { getOrdersForCustomer } from "@/lib/mock-data";
import { requireCustomer } from "@/lib/session";

export default async function DashboardPage() {
  const customer = await requireCustomer();
  const recentOrders = getOrdersForCustomer(customer.customerId).slice(0, 5);

  return (
    <div className="stack-xl">
      <section className="hero">
        <div className="eyebrow">Customer Dashboard</div>
        <h1 className="hero-title">{customer.fullName}</h1>
        <p className="hero-copy">
          {customer.email} | {customer.city}, {customer.state} | {customer.segment} / {customer.loyaltyTier}
        </p>
      </section>

      <section className="grid grid-4">
        <div className="metric"><div className="metric-label">Total Orders</div><div className="metric-value">{customer.orderCount}</div></div>
        <div className="metric"><div className="metric-label">Total Spent</div><div className="metric-value">${customer.totalSpent.toFixed(0)}</div></div>
        <div className="metric"><div className="metric-label">Average Order</div><div className="metric-value">${customer.averageOrder.toFixed(0)}</div></div>
        <div className="metric"><div className="metric-label">Last Order</div><div className="metric-value" style={{ fontSize: "1rem" }}>{customer.lastOrderDate}</div></div>
      </section>

      <section className="panel" style={{ padding: "1.5rem" }}>
        <div className="row-between" style={{ marginBottom: "1rem" }}>
          <div>
            <div className="eyebrow">Recent Orders</div>
            <h2 className="section-title">Latest customer activity</h2>
            <p className="section-copy">This is the frontend mirror of the MVC dashboard.</p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Link href="/orders" className="button button-secondary">View Orders</Link>
            <Link href="/place-order" className="button button-primary">Place Order</Link>
          </div>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Device</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.orderId}>
                  <td><Link href={`/orders/${order.orderId}`}>#{order.orderId}</Link></td>
                  <td>{order.orderDateTime}</td>
                  <td>${order.total.toFixed(2)}</td>
                  <td>{order.paymentMethod}</td>
                  <td>{order.deviceType}</td>
                  <td><span className="badge">{order.priorityBucket} ({order.priorityScore.toFixed(1)})</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
