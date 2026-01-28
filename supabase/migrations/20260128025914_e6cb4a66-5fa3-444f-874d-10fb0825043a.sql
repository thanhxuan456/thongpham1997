-- Drop the existing policy that has the security vulnerability
DROP POLICY IF EXISTS "Users can view own profile or admins view all" ON public.profiles;

-- Create a properly secured policy that only allows users to view their own profile or admins to view all
CREATE POLICY "Users can view own profile or admins view all" 
ON public.profiles 
FOR SELECT 
USING ((user_id = auth.uid()) OR is_admin());