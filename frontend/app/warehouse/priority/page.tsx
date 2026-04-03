import { ScoringButton } from "@/components/scoring-button";
import { supabase } from "@/lib/supabaseClient";

export default async function WarehousePriorityPage() {
  const { data: queue } = await supabase
    .from('warehouse_priority_queue')
    .select('*');

  const items = queue ?? [];

  return (
    <section className="panel" style={{ padding: "1.5rem" }}>
      <div className="row-between" style={{ marginBottom: "1rem" }}>
        <div>
          <div className="eyebrow">Warehouse Queue</div>
          <h1 className="section-title">Late delivery priority queue</h1>
          <p className="section-copy">Frontend view for the orders/customers/predictions join.</p>
        </div>
        <ScoringButton />
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>State</th>
              <th>Total</th>
              <th>Priority</th>
              <th>ETA</th>
              <th>Delay</th>
              <th>Carrier</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.order_id}>
                <td>#{item.order_id}</td>
                <td>{item.customer_name}</td>
                <td>{item.customer_state}</td>
                <td>${item.order_total.toFixed(2)}</td>
                <td><span className="badge">{item.priority_bucket} ({item.priority_score?.toFixed(1) ?? 'N/A'})</span></td>
                <td>{item.estimated_ship_hours} hrs</td>
                <td>{item.delay_days} days</td>
                <td>{item.carrier}</td>
                <td>{item.prediction_reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
