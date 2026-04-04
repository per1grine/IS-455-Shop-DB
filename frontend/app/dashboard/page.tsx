import Link from "next/link";
import { requireCustomer } from "@/lib/session";
import { supabaseServer } from "@/lib/supabaseServer";

export default async function DashboardPage() {
  const customer = await requireCustomer();
  const { data: recentOrders } = await supabaseServer
      .from('order_summary')
      .select('*')
      .eq('customer_id', customer.customer_id)
      .order('order_datetime', { ascending: false })
      .limit(5);
const orders = recentOrders ?? [];

  return (
    <div className="stack-xl">
      <section className="hero">
        <div className="eyebrow">Customer Dashboard</div>
        <h1 className="hero-title">{customer.full_name}</h1>
        <p className="hero-copy">
          {customer.email} | {customer.city}, {customer.state} | {customer.customer_segment} / {customer.loyalty_tier}
        </p>
      </section>

      <section className="grid grid-4">
        <div className="metric"><div className="metric-label">Total Orders</div><div className="metric-value">{customer.total_orders}</div></div>
        <div className="metric"><div className="metric-label">Total Spent</div><div className="metric-value">${Number(customer.total_spent).toFixed(0)}</div></div>
        <div className="metric"><div className="metric-label">Average Order</div><div className="metric-value">${Number(customer.average_order).toFixed(0)}</div></div>
        <div className="metric"><div className="metric-label">Last Order</div><div className="metric-value" style={{ fontSize: "1rem" }}>{customer.last_order_date ?? "None"}</div></div>
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
              {orders.map((order) => (
                <tr key={order.order_id}>
                  <td><Link href={`/orders/${order.order_id}`}>#{order.order_id}</Link></td>
                  <td>{order.order_datetime}</td>
                  <td>${order.order_total.toFixed(2)}</td>
                  <td>{order.payment_method}</td>
                  <td>{order.device_type}</td>
                  <td><span className="badge">{order.priority_bucket ?? 'unscored'} ({order.predicted_priority_score?.toFixed(1) ?? 'N/A'}))</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
