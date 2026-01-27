-- Create table to store chat ratings
CREATE TABLE public.chat_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID,
  user_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  is_suspicious BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT true,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_ratings ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a rating
CREATE POLICY "Anyone can submit ratings"
ON public.chat_ratings
FOR INSERT
WITH CHECK (true);

-- Only admins can view all ratings
CREATE POLICY "Only admins can view ratings"
ON public.chat_ratings
FOR SELECT
USING (is_admin());

-- Only admins can update ratings (mark as suspicious/verified)
CREATE POLICY "Only admins can update ratings"
ON public.chat_ratings
FOR UPDATE
USING (is_admin());

-- Only admins can delete ratings
CREATE POLICY "Only admins can delete ratings"
ON public.chat_ratings
FOR DELETE
USING (is_admin());