-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Service role can manage OTP codes" ON public.otp_codes;

-- OTP codes should only be accessible via service role (edge functions)
-- No direct client access allowed - this is secure by design
-- The table has RLS enabled but no policies for anon/authenticated roles
-- Only service role key (used in edge functions) bypasses RLS