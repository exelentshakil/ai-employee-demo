-- Traffic logging for the AI Employee demo.
-- Run this in the Supabase SQL editor before using the /traffic dashboard.

CREATE TABLE IF NOT EXISTS public.traffic_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  path text NOT NULL,
  ip_address text,
  city text,
  region text,
  country text,
  user_agent text
);

CREATE INDEX IF NOT EXISTS traffic_logs_created_at_idx
  ON public.traffic_logs (created_at DESC);

ALTER TABLE public.traffic_logs ENABLE ROW LEVEL SECURITY;

-- Only the service role (server-side) may read or write. No anon access.
DROP POLICY IF EXISTS "Service role full access" ON public.traffic_logs;
CREATE POLICY "Service role full access"
  ON public.traffic_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
