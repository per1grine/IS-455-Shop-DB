import { SelectCustomerForm } from "@/components/select-customer-form";
import { supabase } from "@/lib/supabaseClient";

export default async function SelectCustomerPage() {
  const { data: customers, error } = await supabase
    .from('customer_summary')
    .select('*')
    .order('full_name');

  if (error) {
    console.error(error);
    return <p>Failed to load customers.</p>;
  }

  return (
    <div className="stack-xl">
      <section className="hero">
        <div className="eyebrow">Student Shop</div>
        <h1 className="hero-title">Choose a customer and start acting as them.</h1>
        <p className="hero-copy">
          Select a customer to browse and place orders on their behalf.
        </p>
      </section>
      <section className="panel" style={{ padding: "1.5rem" }}>
        <div className="row-between" style={{ marginBottom: "1rem" }}>
          <div>
            <div className="eyebrow">Session Setup</div>
            <h2 className="section-title">Select Customer</h2>
            <p className="section-copy">The selected customer ID is stored in a cookie.</p>
          </div>
          <div className="metric" style={{ minWidth: "170px" }}>
            <div className="metric-label">Customers</div>
            <div className="metric-value">{customers.length}</div>
          </div>
        </div>
        <SelectCustomerForm customers={customers} />
      </section>
    </div>
  );
}
