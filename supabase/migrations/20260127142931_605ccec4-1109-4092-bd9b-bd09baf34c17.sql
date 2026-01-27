-- Add affiliate columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS affiliate_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS affiliate_percentage NUMERIC DEFAULT 10,
ADD COLUMN IF NOT EXISTS affiliate_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS affiliate_earnings NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(user_id);

-- Create index for affiliate code lookup
CREATE INDEX IF NOT EXISTS idx_profiles_affiliate_code ON public.profiles(affiliate_code);

-- Create affiliate referrals tracking table
CREATE TABLE IF NOT EXISTS public.affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_user_id UUID NOT NULL,
  referred_user_id UUID NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  commission_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on affiliate_referrals
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;

-- RLS policies for affiliate_referrals
CREATE POLICY "Users can view their own referrals" 
ON public.affiliate_referrals 
FOR SELECT 
USING (affiliate_user_id = auth.uid() OR is_admin());

CREATE POLICY "System can insert referrals" 
ON public.affiliate_referrals 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Only admins can update referrals" 
ON public.affiliate_referrals 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Only admins can delete referrals" 
ON public.affiliate_referrals 
FOR DELETE 
USING (is_admin());