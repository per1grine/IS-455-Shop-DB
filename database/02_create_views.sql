-- =============================================================
-- 02_create_views.sql
-- Run this after importing CSV data.
-- These views are queried directly by the Next.js frontend.
-- =============================================================

-- customer_summary
-- Used by: /select-customer, /dashboard, session management
CREATE OR REPLACE VIEW customer_summary AS
SELECT
    c.customer_id,
    c.full_name,
    c.email,
    c.city,
    c.state,
    c.customer_segment,
    c.loyalty_tier,
    c.is_active,
    COUNT(o.order_id)                                          AS total_orders,
    COALESCE(SUM(o.order_total), 0)                            AS lifetime_value,
    CASE WHEN COUNT(o.order_id) > 0
         THEN COALESCE(SUM(o.order_total), 0) / COUNT(o.order_id)
         ELSE 0 END                                            AS average_order,
    MAX(o.order_datetime)                                      AS last_order_date
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
WHERE c.is_active = 1
GROUP BY
    c.customer_id,
    c.full_name,
    c.email,
    c.city,
    c.state,
    c.customer_segment,
    c.loyalty_tier,
    c.is_active;

-- order_summary
-- Used by: /dashboard (recent orders), /orders (order list)
CREATE OR REPLACE VIEW order_summary AS
SELECT
    o.order_id,
    o.customer_id,
    c.full_name          AS customer_name,
    o.order_datetime,
    o.order_total,
    o.order_subtotal,
    o.shipping_fee,
    o.tax_amount,
    o.payment_method,
    o.device_type,
    o.promo_used,
    o.promo_code,
    o.risk_score,
    o.is_fraud,
    o.shipping_state,
    s.carrier,
    s.shipping_method,
    s.promised_days,
    s.actual_days,
    s.late_delivery,
    p.priority_bucket,
    p.predicted_priority_score,
    p.estimated_ship_hours,
    p.prediction_reason,
    p.scored_at
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
LEFT JOIN shipments s ON s.order_id = o.order_id
LEFT JOIN order_predictions p ON p.order_id = o.order_id;

-- warehouse_priority_queue
-- Used by: /warehouse/priority
-- Shows late or high-risk orders sorted by priority score descending
CREATE OR REPLACE VIEW warehouse_priority_queue AS
SELECT
    o.order_id,
    c.full_name          AS customer_name,
    c.loyalty_tier,
    o.order_datetime,
    o.order_total,
    o.shipping_state,
    s.carrier,
    s.promised_days,
    s.actual_days,
    s.late_delivery,
    p.priority_bucket,
    p.predicted_priority_score,
    p.estimated_ship_hours,
    p.prediction_reason,
    p.scored_at
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
LEFT JOIN shipments s ON s.order_id = o.order_id
LEFT JOIN order_predictions p ON p.order_id = o.order_id
WHERE s.late_delivery = 1
   OR p.priority_bucket = 'high'
ORDER BY p.predicted_priority_score DESC NULLS LAST;
