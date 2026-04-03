import type { Metadata } from "next";
import { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { getActiveCustomer } from "@/lib/session";

import "./globals.css";

export const metadata: Metadata = {
  title: "Student Shop Frontend",
  description: "Next.js frontend for the student shop workflow."
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const customer = await getActiveCustomer();
  const label = customer ? `Acting as: ${customer.full_name}` : "No customer selected";

  return (
    <html lang="en">
      <body>
        <AppShell activeCustomerLabel={label}>{children}</AppShell>
      </body>
    </html>
  );
}
