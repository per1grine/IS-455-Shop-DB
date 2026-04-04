# Supabase Setup — Database Import

Follow these steps in order. All the files you need are in this folder.

---

## Step 1 — Create the tables

1. Go to supabase.com and open the project
2. In the left sidebar click SQL Editor
3. Click New query
4. Open the file 01_create_tables.sql from this folder, copy all of it, and paste it in
5. Click Run (or press Ctrl+Enter)
6. You should see "Success. No rows returned" — that means it worked

This creates all 7 tables with the correct columns and relationships.

---

## Step 2 — Import the CSV data

You will import one CSV file per table. The order matters — import customers and
products before orders, and orders before order_items and shipments.

Import in this exact order:

| # | Table | CSV file | Row count |
|---|-------|----------|-----------|
| 1 | customers | customers.csv | 250 |
| 2 | products | products.csv | 100 |
| 3 | orders | orders.csv | 5,000 |
| 4 | order_items | order_items.csv | 15,022 |
| 5 | shipments | shipments.csv | 5,000 |
| 6 | product_reviews | product_reviews.csv | 3,000 |
| 7 | order_predictions | order_predictions.csv | 5,000 |

Do NOT import sqlite_sequence.csv — skip that one entirely.

How to import each file:
1. In the left sidebar click Table Editor
2. Click the table name (e.g. customers)
3. Click the Import Data button in the top right corner
4. Choose the matching CSV file from this folder
5. Supabase will preview the columns — make sure they match, then click Import
6. Wait for it to finish before moving to the next table

If you get a foreign key error, it means you imported in the wrong order.
Delete the rows from that table and re-import after the table it depends on is done.

---

## Step 3 — Disable row-level security

By default Supabase blocks all reads unless you set up authentication rules.
Since this is a class project we just turn that off.

1. Go to SQL Editor → New query
2. Open the file 03_disable_rls.sql, copy all of it, and paste it in
3. Click Run
4. You should see "Success. No rows returned"

---

## Step 4 — Create the views

The app queries three special views that join tables together.
You need to create these or the app will show blank pages.

1. Go to SQL Editor → New query
2. Open the file 02_create_views.sql, copy all of it, and paste it in
3. Click Run
4. You should see "Success. No rows returned"

The three views created are:
- customer_summary (used by the select-customer and dashboard pages)
- order_summary (used by the orders list and dashboard)
- warehouse_priority_queue (used by the warehouse priority page)

---

## Step 5 — Verify the import

Run this in SQL Editor to confirm all row counts look right:

```sql
SELECT 'customers' AS tbl, COUNT(*) AS rows FROM customers
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL SELECT 'shipments', COUNT(*) FROM shipments
UNION ALL SELECT 'product_reviews', COUNT(*) FROM product_reviews
UNION ALL SELECT 'order_predictions', COUNT(*) FROM order_predictions;
```

Expected: 250 / 100 / 5000 / 15022 / 5000 / 3000 / 5000

Then check the views loaded correctly:

```sql
SELECT COUNT(*) FROM customer_summary;
SELECT COUNT(*) FROM order_summary;
SELECT COUNT(*) FROM warehouse_priority_queue;
```

customer_summary should return 250, order_summary should return 5000.
warehouse_priority_queue will return a smaller number — that is normal,
it only shows late or high-priority orders.

---

Once this all looks good, go back to SUPABASE_README.md and continue with Part 2.
