-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create restricted policy - users can only view their own profile or admins can view all
CREATE POLICY "Users can view own profile or admins view all"
ON public.profiles
FOR SELECT
USING (user_id = auth.uid() OR is_admin());