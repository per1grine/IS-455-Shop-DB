import type { Route } from "next";
import Link from "next/link";
import { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
  activeCustomerLabel?: string;
};

const navItems = [
  { href: "/select-customer", label: "Select Customer" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/place-order", label: "Place Order" },
  { href: "/orders", label: "Orders" },
  { href: "/warehouse/priority", label: "Warehouse Priority" }
] as const satisfies ReadonlyArray<{ href: Route; label: string }>;

export function AppShell({ children, activeCustomerLabel }: AppShellProps) {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="container topbar-inner">
          <Link href="/select-customer" className="brand">
            Student Shop
          </Link>
          <nav className="nav">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="nav-link">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="session-chip">{activeCustomerLabel ?? "Mock frontend"}</div>
        </div>
      </header>
      <main className="container page">{children}</main>
    </div>
  );
}
