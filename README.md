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

## Run

```bash
dotnet restore StudentShopApp/StudentShopApp.csproj
dotnet run --project StudentShopApp/StudentShopApp.csproj
```

Open the app on the local ASP.NET Core URL and start with `/select-customer`.

## Run The Next.js Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend is a separate App Router project intended for Vercel deployment later. Right now it mirrors the same pages with mock data and lightweight API routes:

- `/select-customer`
- `/dashboard`
- `/place-order`
- `/orders`
- `/orders/[orderId]`
- `/warehouse/priority`

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
