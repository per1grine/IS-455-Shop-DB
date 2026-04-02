import { ScoringButton } from "@/components/scoring-button";
import { warehouseQueue } from "@/lib/mock-data";

export default function WarehousePriorityPage() {
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
            {warehouseQueue.map((item) => (
              <tr key={item.orderId}>
                <td>#{item.orderId}</td>
                <td>{item.customerName}</td>
                <td>{item.customerState}</td>
                <td>${item.orderTotal.toFixed(2)}</td>
                <td><span className="badge">{item.priorityBucket} ({item.priorityScore.toFixed(1)})</span></td>
                <td>{item.estimatedShipHours} hrs</td>
                <td>{item.delayDays} days</td>
                <td>{item.carrier}</td>
                <td>{item.predictionReason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
