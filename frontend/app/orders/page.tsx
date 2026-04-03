import Link from "next/link";
import { requireCustomer } from "@/lib/session";
import { supabase } from "@/lib/supabaseClient";

export default async function OrdersPage() {
  const customer = await requireCustomer();
  const { data: orders } = await supabase
    .from('order_summary')
    .select('*')
    .eq('customer_id', customer.customer_id)
    .order('order_datetime', { ascending: false });

  const orderList = orders ?? [];

  return (
    <section className="panel" style={{ padding: "1.5rem" }}>
      <div className="eyebrow">Order History</div>
      <h1 className="section-title">{customer.full_name}</h1>
      <p className="section-copy">All orders for the active customer.</p>

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
            {orderList.map((order) => (
              <tr key={order.order_id}>
                <td><Link href={`/orders/${order.order_id}`}>#{order.order_id}</Link></td>
                <td>{order.order_datetime}</td>
                <td>${order.order_total.toFixed(2)}</td>
                <td>{order.payment_method}</td>
                <td>{order.device_type}</td>
                <td><span className="badge">{order.priority_bucket} ({order.predicted_priority_score?.toFixed(1) ?? 'N/A'})</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
