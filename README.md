# IS-455 Shop DB

End-to-end ML pipeline project for IS 455. Includes a Next.js frontend connected to Supabase, an ASP.NET Core MVC reference backend, a Python ML inference job, and a fraud-detection model trained on the shop database.

---

## Project Structure

```
IS-455-Shop-DB/
├── .github/workflows/     # GitHub Actions cron job for daily ML scoring
├── ML/                    # Jupyter notebook + trained model
│   ├── Pipeline.ipynb     # CRISP-DM fraud detection pipeline
│   ├── model1.sav         # Trained Logistic Regression model (joblib)
│   └── model1.meta.json   # Model metadata
├── database/              # Database files and Supabase setup instructions
│   ├── shop.db            # SQLite source database
│   ├── *.csv              # Exported table data (for Supabase import)
│   ├── 01_create_tables.sql
│   ├── 02_create_views.sql
│   ├── 03_disable_rls.sql
│   ├── SUPABASE_SETUP.md  # Step-by-step data import instructions
│   └── SUPABASE_README.md # Full setup guide for Supabase + GitHub Actions
├── jobs/
│   └── run_inference.py   # ML scoring script (reads/writes Supabase)
├── frontend/              # Next.js 15 frontend (Vercel deployment)
└── StudentShopApp/        # ASP.NET Core MVC backend (reference implementation)
```

---

## Pages

| Path | Description |
|------|-------------|
| `/select-customer` | Pick a customer to act as (stored in cookie) |
| `/dashboard` | Customer summary metrics + recent orders |
| `/place-order` | Create a new order and save it to the database |
| `/orders` | Full order history for the active customer |
| `/orders/[id]` | Order detail with line items and fraud prediction |
| `/warehouse/priority` | Late delivery priority queue + Run Scoring button |

---

## Prerequisites

- Node.js 18+ (Next.js frontend)
- .NET SDK 10.0+ (ASP.NET backend)
- Python 3.11+ with joblib, scikit-learn, numpy, pandas (ML scoring job)
- Supabase project configured (see `database/SUPABASE_README.md`)

---

## Run the Next.js Frontend

```bash
cd frontend
npm install
npm run dev
```

Requires `frontend/.env.local` with Supabase credentials. See `database/SUPABASE_README.md`.

---

## Run the ASP.NET Backend (reference only)

```bash
dotnet restore StudentShopApp/StudentShopApp.csproj
dotnet run --project StudentShopApp/StudentShopApp.csproj
```

Open the local URL and navigate to `/select-customer`.

---

## Run the ML Scoring Job Manually

```bash
export SUPABASE_URL=https://qqznlvcexvgdqfmeiznw.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
python jobs/run_inference.py
```

This also runs automatically every day at 6am UTC via GitHub Actions once secrets are configured.

---

## Supabase Setup

See `database/SUPABASE_README.md` for the full guide covering:
- Importing all tables and data into Supabase
- Creating the views the frontend depends on
- Adding GitHub secrets for the daily cron job

---

## Architecture

```
GitHub Actions (daily 6am UTC)
  → jobs/run_inference.py
  → loads ML/model1.sav (Logistic Regression fraud classifier)
  → reads orders, shipments, reviews from Supabase
  → writes fraud predictions to order_predictions table

Next.js frontend (Vercel)
  → all pages read from Supabase views
  → /place-order writes new orders directly to Supabase
  → /warehouse/priority "Run Scoring" button triggers the pipeline
```
