/**
 * Server-only Supabase client that uses the service role key.
 * Never import this in client components — use supabaseClient.ts instead.
 * The service role key bypasses RLS and is needed for write operations
 * like upserting order_predictions from the scoring route.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseServer = createClient(url, key);
