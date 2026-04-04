import { ScoringButton } from "@/components/scoring-button";
import { supabaseServer } from "@/lib/supabaseServer";

export default async function WarehousePriorityPage() {
  const { data: queue } = await supabaseServer
    .from("warehouse_priority_queue")
    .select("*");

  const items = queue ?? [];

  return (
    <section className="panel" style={{ padding: "1.5rem" }}>
      <div className="row-between" style={{ marginBottom: "1rem" }}>
        <div>
          <div className="eyebrow">Warehouse Queue</div>
          <h1 className="section-title">Late delivery priority queue</h1>
          <p className="section-copy">
            Orders flagged for late delivery or high fraud risk, sorted by
            priority score.
          </p>
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
              <th>ETA (hrs)</th>
              <th>Delay (days)</th>
              <th>Carrier</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center" }}>
                  No items in queue.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const delayDays =
                  item.actual_days != null && item.promised_days != null
                    ? item.actual_days - item.promised_days
                    : null;

                return (
                  <tr key={item.order_id}>
                    <td>#{item.order_id}</td>
                    <td>{item.customer_name}</td>
                    <td>{item.shipping_state}</td>
                    <td>${Number(item.order_total).toFixed(2)}</td>
                    <td>
                      <span className="badge">
                        {item.priority_bucket ?? "—"} (
                        {item.predicted_priority_score != null
                          ? Number(item.predicted_priority_score).toFixed(1)
                          : "N/A"}
                        )
                      </span>
                    </td>
                    <td>{item.estimated_ship_hours ?? "—"}</td>
                    <td>{delayDays != null ? `+${delayDays}` : "—"}</td>
                    <td>{item.carrier ?? "—"}</td>
                    <td>{item.prediction_reason ?? "—"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
