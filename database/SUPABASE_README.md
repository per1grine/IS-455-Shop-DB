# Supabase Setup — What You Need To Do

Hi! This file explains everything you need to do on the Supabase side.
Do the parts in order. Should take about 20–30 minutes total.

---

## Before you start — the app will show an error until this is done

If you open the app right now you will see a red error page that says
"supabaseKey is required." That is normal — it just means the Supabase
credentials are not configured yet. Follow the steps below and the error
will go away.

---

## Part 1 — Load the database

Open the file SUPABASE_SETUP.md in this same folder and follow those steps.
It will walk you through creating the tables, importing the data from the CSV files,
and creating the views the app depends on.

Come back here when that is done.

---

## Part 2 — Get the service role key and add it to the project

The app needs a special Supabase key to write predictions back to the database.

1. Go to supabase.com and open the project
2. In the left sidebar click Settings (gear icon at the bottom)
3. Click API
4. Under "Project API keys" find the row labeled service_role — it says "secret" next to it
5. Click the eye icon to reveal it, then copy the full key
6. Open the file frontend/.env.local in the repo
7. Paste the key here:

   SUPABASE_SERVICE_ROLE_KEY=paste_your_key_here

Save the file. Do not commit this file to GitHub — it is already in .gitignore.

---

## Part 3 — Add secrets to GitHub so the daily scoring job can run

The ML model runs automatically every day via GitHub Actions. For it to connect to
Supabase, it needs the credentials stored as GitHub secrets.

1. Go to the GitHub repo in your browser
2. Click Settings (top menu of the repo, not your profile)
3. In the left sidebar click Secrets and variables → Actions
4. Click "New repository secret" and add each of these three secrets:

   Secret 1:
   Name:  SUPABASE_URL
   Value: https://qqznlvcexvgdqfmeiznw.supabase.co

   Secret 2:
   Name:  SUPABASE_SERVICE_ROLE_KEY
   Value: (same service role key you copied in Part 2)

   Secret 3:
   Name:  SUPABASE_ANON_KEY
   Value: sb_secret_UQgyCaBIqf37gxh5CWliZQ_9ZyfiHUj

5. Make sure the code has been pushed to GitHub (the file .github/workflows/daily_scoring.yml
   needs to be in the repo for the action to run)

---

## Part 4 — Test the scoring job manually

Before waiting for the daily schedule, run the job once to make sure it works.

1. Go to the GitHub repo → click the Actions tab
2. In the left sidebar click "Daily ML Scoring"
3. Click the "Run workflow" button on the right, then click the green "Run workflow" button
4. Wait about 30–60 seconds, then click the run to see the logs
5. You should see output like:
      Loading model...
      Fetching orders from Supabase...
      5000 orders | 15022 items | 5000 shipments
      Writing 5000 predictions to Supabase...
      Done.

If it fails, copy the error from the logs and send it over.

---

## Part 5 — Verify everything worked

1. Go to the Supabase dashboard → Table Editor → order_predictions
2. Check that the scored_at column shows today's date on recent rows
3. Open the frontend app and go to /warehouse/priority
4. The priority queue table should be populated with orders

---

## Part 6 — Add the env vars to Vercel (for the deployed site)

The .env.local file only works when running the app locally. For the live
Vercel deployment, you need to add the same keys in the Vercel dashboard.

1. Go to vercel.com and open the project
2. Click Settings → Environment Variables
3. Add each of these three variables:

   Name:  NEXT_PUBLIC_SUPABASE_URL
   Value: https://qqznlvcexvgdqfmeiznw.supabase.co

   Name:  NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: sb_secret_UQgyCaBIqf37gxh5CWliZQ_9ZyfiHUj

   Name:  SUPABASE_SERVICE_ROLE_KEY
   Value: (same service role key from Part 2)

4. After adding them, go to Deployments and click Redeploy on the latest
   deployment so the new variables take effect

Without this step the live site will show the same "supabaseKey is required"
error even after the local app is working fine.

---

## Summary of what runs automatically after this

Once the GitHub secrets are set, the ML scoring job runs every day at 6am UTC
(about midnight Mountain Time). It pulls orders from Supabase, scores them with
the fraud model, and writes the results back. The warehouse priority queue updates
automatically.

You do not need to do anything on a daily basis after setup is complete.
