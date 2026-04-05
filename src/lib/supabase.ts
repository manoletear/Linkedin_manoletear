// Supabase client - optional, only used when SUPABASE_URL is configured.
// The system works without Supabase using local SQLite storage.

import { env } from "../config/env";

export function getSupabase() {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  // Lazy import to avoid errors when @supabase/supabase-js is not needed
  const { createClient } = require("@supabase/supabase-js");
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
}
