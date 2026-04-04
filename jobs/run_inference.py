#!/usr/bin/env python3
"""
run_inference.py
Pulls orders from Supabase, runs fraud scoring with the trained model,
and writes predictions back to the order_predictions table.
"""
import os
import json
import math
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, UTC
from pathlib import Path

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parent.parent
MODEL_PATH   = PROJECT_ROOT / "ML" / "model1.sav"
META_PATH    = PROJECT_ROOT / "ML" / "model1.meta.json"

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

# Numeric features the model was trained on (skewfix columns are derived below)
BASE_NUM_FEATURES = [
    "promo_used", "order_subtotal", "shipping_fee", "tax_amount",
    "order_total", "risk_score", "quantity", "unit_price", "line_total",
    "promised_days", "actual_days", "late_delivery", "rating",
    "predicted_priority_score", "estimated_ship_hours",
]

SKEW_FEATURES = [
    "order_subtotal", "shipping_fee", "tax_amount", "order_total",
    "risk_score", "quantity", "unit_price", "line_total",
    "promised_days", "actual_days", "rating",
    "predicted_priority_score", "estimated_ship_hours",
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def skewfix(series: pd.Series) -> pd.Series:
    """Log1p transform used during training to reduce skewness."""
    return np.log1p(series.clip(lower=0))


def build_feature_df(rows: list[dict]) -> pd.DataFrame:
    df = pd.DataFrame(rows)

    # Fill missing numerics with 0
    for col in BASE_NUM_FEATURES:
        if col not in df.columns:
            df[col] = 0
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    # Derive skewfix columns
    for col in SKEW_FEATURES:
        df[f"{col}_skewfix"] = skewfix(df[col])

    all_features = BASE_NUM_FEATURES + [f"{c}_skewfix" for c in SKEW_FEATURES]
    return df[all_features]


def priority_bucket(score: float) -> str:
    if score >= 0.6:
        return "high"
    if score >= 0.3:
        return "medium"
    return "low"


def estimated_hours(score: float) -> float:
    """Higher fraud probability → more manual review time."""
    return round(4 + score * 20, 1)


def prediction_reason(score: float, row: dict) -> str:
    parts = []
    if score >= 0.6:
        parts.append("high fraud probability")
    if row.get("risk_score", 0) > 70:
        parts.append("elevated risk score")
    if row.get("late_delivery", 0):
        parts.append("late delivery flagged")
    if row.get("order_total", 0) > 500:
        parts.append("large order value")
    return ", ".join(parts) if parts else "routine order"


# ---------------------------------------------------------------------------
# Supabase helpers (uses requests — no extra SDK needed)
# ---------------------------------------------------------------------------
def supabase_get(table: str, select: str = "*", filters: dict | None = None) -> list[dict]:
    import urllib.request, urllib.parse
    params = {"select": select}
    if filters:
        params.update(filters)
    url = f"{SUPABASE_URL}/rest/v1/{table}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    })
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def supabase_upsert(table: str, rows: list[dict]) -> None:
    import urllib.request
    body = json.dumps(rows).encode()
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    req = urllib.request.Request(url, data=body, method="POST", headers={
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    })
    with urllib.request.urlopen(req) as resp:
        resp.read()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main() -> int:
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars must be set.")
        return 1

    if not MODEL_PATH.exists():
        print(f"ERROR: Model not found at {MODEL_PATH}")
        return 1

    print(f"Loading model from {MODEL_PATH}")
    model = joblib.load(MODEL_PATH)

    # Pull data needed for features (mirrors the training join)
    print("Fetching orders from Supabase...")
    orders = supabase_get("orders")
    order_items = supabase_get("order_items", select="order_id,quantity,unit_price,line_total")
    shipments = supabase_get("shipments", select="order_id,promised_days,actual_days,late_delivery")
    reviews = supabase_get("product_reviews", select="customer_id,rating")
    predictions = supabase_get("order_predictions", select="order_id,predicted_priority_score,estimated_ship_hours")

    print(f"  {len(orders)} orders | {len(order_items)} items | {len(shipments)} shipments")

    # Build lookup tables (take first match per order for simplicity)
    items_map = {}
    for r in order_items:
        items_map.setdefault(r["order_id"], r)

    ship_map = {}
    for r in shipments:
        ship_map.setdefault(r["order_id"], r)

    # Average rating per customer
    ratings = pd.DataFrame(reviews) if reviews else pd.DataFrame(columns=["customer_id", "rating"])
    avg_rating = ratings.groupby("customer_id")["rating"].mean().to_dict() if not ratings.empty else {}

    # Existing predictions lookup
    pred_map = {r["order_id"]: r for r in predictions}

    # Assemble flat rows for the model
    flat_rows = []
    for o in orders:
        oid = o["order_id"]
        item = items_map.get(oid, {})
        ship = ship_map.get(oid, {})
        pred = pred_map.get(oid, {})
        row = {
            **o,
            "quantity":                item.get("quantity", 0),
            "unit_price":              item.get("unit_price", 0),
            "line_total":              item.get("line_total", 0),
            "promised_days":           ship.get("promised_days", 0),
            "actual_days":             ship.get("actual_days", 0),
            "late_delivery":           ship.get("late_delivery", 0),
            "rating":                  avg_rating.get(o["customer_id"], 3.0),
            "predicted_priority_score": pred.get("predicted_priority_score", 0),
            "estimated_ship_hours":    pred.get("estimated_ship_hours", 0),
        }
        flat_rows.append(row)

    df_features = build_feature_df(flat_rows)

    print("Running model predictions...")
    proba = model.predict_proba(df_features)[:, 1]  # P(fraud=1)

    # Build upsert payload
    scored_at = datetime.now(UTC).isoformat()
    upsert_rows = []
    for i, o in enumerate(orders):
        score = float(proba[i])
        upsert_rows.append({
            "order_id":                o["order_id"],
            "predicted_priority_score": round(score * 100, 2),
            "priority_bucket":         priority_bucket(score),
            "estimated_ship_hours":    estimated_hours(score),
            "prediction_reason":       prediction_reason(score, flat_rows[i]),
            "scored_at":               scored_at,
        })

    print(f"Writing {len(upsert_rows)} predictions to Supabase...")
    # Upsert in batches of 500
    batch_size = 500
    for i in range(0, len(upsert_rows), batch_size):
        supabase_upsert("order_predictions", upsert_rows[i:i + batch_size])
        print(f"  Upserted rows {i+1}–{min(i+batch_size, len(upsert_rows))}")

    high   = sum(1 for r in upsert_rows if r["priority_bucket"] == "high")
    medium = sum(1 for r in upsert_rows if r["priority_bucket"] == "medium")
    low    = sum(1 for r in upsert_rows if r["priority_bucket"] == "low")

    print(f"\nDone. {len(upsert_rows)} orders scored at {scored_at}")
    print(f"  High priority:   {high}")
    print(f"  Medium priority: {medium}")
    print(f"  Low priority:    {low}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
