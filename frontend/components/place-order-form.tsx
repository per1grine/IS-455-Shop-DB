"use client";

import { useState } from "react";

import type { Customer, Product } from "@/lib/mock-data";

type PlaceOrderFormProps = {
  customer: Customer;
  products: Product[];
};

type RowState = {
  productId: string;
  quantity: string;
};

const emptyRows = Array.from({ length: 5 }, () => ({ productId: "", quantity: "" }));

export function PlaceOrderForm({ customer, products }: PlaceOrderFormProps) {
  const [billingZip, setBillingZip] = useState("");
  const [shippingZip, setShippingZip] = useState("");
  const [shippingState, setShippingState] = useState(customer.state);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [deviceType, setDeviceType] = useState("desktop");
  const [ipCountry, setIpCountry] = useState("US");
  const [promoUsed, setPromoUsed] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [rows, setRows] = useState<RowState[]>(emptyRows);
  const [status, setStatus] = useState<string>("");

  function updateRow(index: number, nextRow: RowState) {
    setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? nextRow : row)));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const lineItems = rows.filter((row) => row.productId && Number(row.quantity) > 0);
    if (lineItems.length === 0) {
      setStatus("Add at least one product with a quantity greater than zero.");
      return;
    }

    const subtotal = lineItems.reduce((sum, row) => {
      const product = products.find((item) => item.productId === Number(row.productId));
      return sum + (product ? product.price * Number(row.quantity) : 0);
    }, 0);

    const shippingFee = subtotal >= 100 ? 5 : 12;
    const taxAmount = subtotal * 0.08;
    const total = subtotal + shippingFee + taxAmount;

    setStatus(
      `Mock order created for ${customer.fullName}. Payment ${paymentMethod}, device ${deviceType}, total $${total.toFixed(2)}. Replace this with Supabase or API persistence later.`
    );
  }

  return (
    <form className="stack-xl" onSubmit={handleSubmit}>
      <div className="grid grid-3">
        <label className="stack-sm">
          <span className="field-label">Billing ZIP</span>
          <input className="input" value={billingZip} onChange={(event) => setBillingZip(event.target.value)} />
        </label>
        <label className="stack-sm">
          <span className="field-label">Shipping ZIP</span>
          <input className="input" value={shippingZip} onChange={(event) => setShippingZip(event.target.value)} />
        </label>
        <label className="stack-sm">
          <span className="field-label">Shipping State</span>
          <input className="input" value={shippingState} onChange={(event) => setShippingState(event.target.value)} />
        </label>
      </div>

      <div className="grid grid-3">
        <label className="stack-sm">
          <span className="field-label">Payment Method</span>
          <select className="input" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
            <option value="card">card</option>
            <option value="paypal">paypal</option>
            <option value="bank">bank</option>
            <option value="crypto">crypto</option>
          </select>
        </label>
        <label className="stack-sm">
          <span className="field-label">Device Type</span>
          <select className="input" value={deviceType} onChange={(event) => setDeviceType(event.target.value)}>
            <option value="desktop">desktop</option>
            <option value="mobile">mobile</option>
            <option value="tablet">tablet</option>
          </select>
        </label>
        <label className="stack-sm">
          <span className="field-label">IP Country</span>
          <input className="input" value={ipCountry} onChange={(event) => setIpCountry(event.target.value)} />
        </label>
      </div>

      <div className="grid grid-2">
        <label className="toggle">
          <input type="checkbox" checked={promoUsed} onChange={(event) => setPromoUsed(event.target.checked)} />
          <span>Promo Applied</span>
        </label>
        <label className="stack-sm">
          <span className="field-label">Promo Code</span>
          <input className="input" value={promoCode} onChange={(event) => setPromoCode(event.target.value)} />
        </label>
      </div>

      <div className="panel">
        <div className="eyebrow">Line Items</div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td>
                    <select
                      className="input"
                      value={row.productId}
                      onChange={(event) => updateRow(index, { ...row, productId: event.target.value })}
                    >
                      <option value="">Select a product</option>
                      {products.map((product) => (
                        <option key={product.productId} value={product.productId}>
                          {product.name} ({product.category}) - ${product.price.toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      className="input"
                      value={row.quantity}
                      onChange={(event) => updateRow(index, { ...row, quantity: event.target.value })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="row-between">
        <div className="note">Shipping is $5 above $100 subtotal, otherwise $12. Tax is 8%.</div>
        <button type="submit" className="button button-primary">
          Create Mock Order
        </button>
      </div>

      {status ? <div className="status">{status}</div> : null}
    </form>
  );
}
