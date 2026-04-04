-- =============================================================
-- 01_create_tables.sql
-- Run this first in Supabase SQL Editor to create all tables.
-- =============================================================

-- customers
CREATE TABLE IF NOT EXISTS customers (
    customer_id       INTEGER PRIMARY KEY,
    full_name         TEXT NOT NULL,
    email             TEXT,
    gender            TEXT,
    birthdate         DATE,
    created_at        TIMESTAMP,
    city              TEXT,
    state             TEXT,
    zip_code          TEXT,
    customer_segment  TEXT,
    loyalty_tier      TEXT,
    is_active         INTEGER DEFAULT 1
);

-- products
CREATE TABLE IF NOT EXISTS products (
    product_id    INTEGER PRIMARY KEY,
    sku           TEXT,
    product_name  TEXT NOT NULL,
    category      TEXT,
    price         NUMERIC(10,2),
    cost          NUMERIC(10,2),
    is_active     INTEGER DEFAULT 1
);

-- orders
CREATE TABLE IF NOT EXISTS orders (
    order_id        INTEGER PRIMARY KEY,
    customer_id     INTEGER REFERENCES customers(customer_id),
    order_datetime  TIMESTAMP,
    billing_zip     TEXT,
    shipping_zip    TEXT,
    shipping_state  TEXT,
    payment_method  TEXT,
    device_type     TEXT,
    ip_country      TEXT,
    promo_used      INTEGER DEFAULT 0,
    promo_code      TEXT,
    order_subtotal  NUMERIC(10,2),
    shipping_fee    NUMERIC(10,2),
    tax_amount      NUMERIC(10,2),
    order_total     NUMERIC(10,2),
    risk_score      NUMERIC(5,2),
    is_fraud        INTEGER DEFAULT 0
);

-- order_items
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id  INTEGER PRIMARY KEY,
    order_id       INTEGER REFERENCES orders(order_id),
    product_id     INTEGER REFERENCES products(product_id),
    quantity       INTEGER,
    unit_price     NUMERIC(10,2),
    line_total     NUMERIC(10,2)
);

-- shipments
CREATE TABLE IF NOT EXISTS shipments (
    shipment_id      INTEGER PRIMARY KEY,
    order_id         INTEGER REFERENCES orders(order_id),
    ship_datetime    TIMESTAMP,
    carrier          TEXT,
    shipping_method  TEXT,
    distance_band    TEXT,
    promised_days    INTEGER,
    actual_days      INTEGER,
    late_delivery    INTEGER DEFAULT 0
);

-- product_reviews
CREATE TABLE IF NOT EXISTS product_reviews (
    review_id        INTEGER PRIMARY KEY,
    customer_id      INTEGER REFERENCES customers(customer_id),
    product_id       INTEGER REFERENCES products(product_id),
    rating           INTEGER,
    review_datetime  TIMESTAMP,
    review_text      TEXT
);

-- order_predictions
CREATE TABLE IF NOT EXISTS order_predictions (
    prediction_id            INTEGER PRIMARY KEY,
    order_id                 INTEGER REFERENCES orders(order_id),
    predicted_priority_score NUMERIC(5,2),
    priority_bucket          TEXT,
    estimated_ship_hours     NUMERIC(6,2),
    prediction_reason        TEXT,
    scored_at                TIMESTAMP
);
