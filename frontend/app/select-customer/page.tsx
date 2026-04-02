import { SelectCustomerForm } from "@/components/select-customer-form";
import { customers } from "@/lib/mock-data";

export default function SelectCustomerPage() {
  return (
    <div className="stack-xl">
      <section className="hero">
        <div className="eyebrow">Frontend Prototype</div>
        <h1 className="hero-title">Choose a customer and start acting as them.</h1>
        <p className="hero-copy">
          This Next.js frontend mirrors the ASP.NET workflow, but uses mock data for now so you can design and deploy the UI separately on Vercel.
        </p>
      </section>

      <section className="panel" style={{ padding: "1.5rem" }}>
        <div className="row-between" style={{ marginBottom: "1rem" }}>
          <div>
            <div className="eyebrow">Session Setup</div>
            <h2 className="section-title">Select Customer</h2>
            <p className="section-copy">The selected customer ID is stored in a cookie, matching the backend app concept.</p>
          </div>
          <div className="metric" style={{ minWidth: "170px" }}>
            <div className="metric-label">Mock Customers</div>
            <div className="metric-value">{customers.length}</div>
          </div>
        </div>
        <SelectCustomerForm customers={customers} />
      </section>
    </div>
  );
}
