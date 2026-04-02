#!/usr/bin/env python3
import sqlite3
from datetime import UTC, datetime
from pathlib import Path


def main() -> int:
    project_root = Path(__file__).resolve().parent.parent
    db_path = project_root / "shop.db"

    if not db_path.exists():
        print(f"Database not found: {db_path}")
        return 1

    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        order_count = cursor.execute("SELECT COUNT(*) FROM orders").fetchone()[0]
        late_count = cursor.execute("SELECT COUNT(*) FROM shipments WHERE late_delivery = 1").fetchone()[0]
        prediction_count = cursor.execute("SELECT COUNT(*) FROM order_predictions").fetchone()[0]

    print("Inference pipeline placeholder completed.")
    print(f"Timestamp: {datetime.now(UTC).isoformat()}")
    print(f"Orders in database: {order_count}")
    print(f"Late deliveries flagged: {late_count}")
    print(f"Existing prediction rows: {prediction_count}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
