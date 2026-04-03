import Link from "next/link";
import { supabase } from '../../lib/supabaseClient'

import { getOrdersForCustomer } from "@/lib/mock-data";
import { requireCustomer } from "@/lib/session";

export default async function OrdersPage() {
  const customer = await requireCustomer();
  const customerOrders = getOrdersForCustomer(customer.customerId);

  return (
    <section className="panel" style={{ padding: "1.5rem" }}>
      <div className="eyebrow">Order History</div>
      <h1 className="section-title">{customer.fullName}</h1>
      <p className="section-copy">All mock orders for the active customer.</p>

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
            {customerOrders.map((order) => (
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
  );
}
