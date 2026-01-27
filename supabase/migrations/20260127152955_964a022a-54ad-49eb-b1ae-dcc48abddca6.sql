-- Add RLS policies to otp_codes table (currently has no policies - security vulnerability)
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Only service role (edge functions) can access otp_codes table
-- Deny all access from regular users - this table should only be accessed by edge functions
CREATE POLICY "Deny all user access to otp_codes"
ON public.otp_codes
FOR ALL
USING (false);

-- Update orders table RLS to explicitly check for authenticated users
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
USING (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR is_admin()));

DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
CREATE POLICY "Users can create orders"
ON public.orders
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Update profiles table RLS to explicitly check for authenticated users
DROP POLICY IF EXISTS "Users can view own profile or admins view all" ON public.profiles;
CREATE POLICY "Users can view own profile or admins view all"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR is_admin()));