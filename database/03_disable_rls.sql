-- =============================================================
-- 03_disable_rls.sql
-- Run this after creating tables so the frontend anon key can
-- read data without authentication. Fine for a class project.
-- =============================================================

ALTER TABLE customers        DISABLE ROW LEVEL SECURITY;
ALTER TABLE products         DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders           DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items      DISABLE ROW LEVEL SECURITY;
ALTER TABLE shipments        DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews  DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_predictions DISABLE ROW LEVEL SECURITY;
