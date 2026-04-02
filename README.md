# Student Shop App

This repo now contains:

- `StudentShopApp/`: ASP.NET Core MVC app backed by `shop.db`
- `frontend/`: Next.js frontend prototype for Vercel
- `jobs/`: Python inference scripts

The MVC app uses `Microsoft.Data.Sqlite` directly and stores the selected `customer_id` in a cookie instead of using authentication.

## Routes

- `GET/POST /select-customer`
- `GET /dashboard`
- `GET/POST /place-order`
- `GET /orders`
- `GET /orders/{orderId}`
- `GET /warehouse/priority`
- `POST /scoring/run`

## Prerequisites

- .NET SDK 10.0 or newer
- Python 3 available as `python3`
- Node.js and npm for the Next.js frontend

## Repo Layout

```text
ml_pipeline_app/
  StudentShopApp/    # ASP.NET Core MVC backend + server-rendered UI
  frontend/          # Next.js frontend prototype
  jobs/              # Python scoring scripts
  shop.db            # SQLite database
```

## Terminal Commands

Run these from the repo root.

### Backend

First time:

```bash
dotnet restore StudentShopApp/StudentShopApp.csproj
dotnet run --project StudentShopApp/StudentShopApp.csproj
```

After that:

```bash
dotnet run --project StudentShopApp/StudentShopApp.csproj
```

Open the backend on the local ASP.NET Core URL and start with `/select-customer`.

### Frontend

First time:

```bash
cd frontend
npm install
npm run dev
```

After that:

```bash
cd frontend
npm run dev
```

### Python Scoring Script

```bash
python3 jobs/run_inference.py
```

### Optional Build Checks

```bash
dotnet build StudentShopApp/StudentShopApp.csproj
```

```bash
cd frontend
npm run build
```

## Frontend Notes

The `frontend/` app is a separate App Router project intended for Vercel deployment later. Right now it mirrors the same pages with mock data and lightweight API routes:

- `/select-customer`
- `/dashboard`
- `/place-order`
- `/orders`
- `/orders/[orderId]`
- `/warehouse/priority`

The current ASP.NET MVC app is still the working backend reference implementation.

## Key Files

- App project: `StudentShopApp/`
- Frontend project: `frontend/`
- SQLite database: `shop.db`
- Python scoring job: `jobs/run_inference.py`
- App configuration: `StudentShopApp/appsettings.json`

## Migration Note

When you move to Supabase/Postgres later:

- keep the MVC app as the backend reference implementation
- replace the repository behind `IShopRepository` in the ASP.NET app
- swap the mock data inside `frontend/` for Supabase queries or API calls

That gives you a clean seam for moving from local SQLite to a hosted Postgres stack without redesigning the UI twice.
