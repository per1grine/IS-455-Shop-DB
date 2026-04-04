#!/usr/bin/env python3
"""Export all shop.db tables to CSV files in the database/ folder."""
import sqlite3
import csv
from pathlib import Path

db_path = Path(__file__).resolve().parent / "shop.db"
out_dir = Path(__file__).resolve().parent

if not db_path.exists():
    raise FileNotFoundError(f"Database not found: {db_path}")

with sqlite3.connect(db_path) as conn:
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    tables = [
        row[0]
        for row in cursor.execute(
            "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
        ).fetchall()
    ]

    for table in tables:
        rows = cursor.execute(f"SELECT * FROM [{table}]").fetchall()
        out_path = out_dir / f"{table}.csv"
        with open(out_path, "w", newline="", encoding="utf-8") as f:
            if rows:
                writer = csv.DictWriter(f, fieldnames=rows[0].keys())
                writer.writeheader()
                writer.writerows([dict(r) for r in rows])
            else:
                # Write header only for empty tables
                cols = [d[0] for d in cursor.execute(f"SELECT * FROM [{table}] LIMIT 0").description or []]
                writer = csv.DictWriter(f, fieldnames=cols)
                writer.writeheader()
        print(f"Exported {len(rows):>6} rows → {out_path.name}")

print("\nDone. CSVs are ready to import into Supabase.")
