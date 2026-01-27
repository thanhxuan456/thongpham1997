-- Create support tickets table
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  user_phone TEXT,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ticket messages table
CREATE TABLE public.ticket_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
  sender_type TEXT NOT NULL DEFAULT 'user', -- 'user' or 'admin'
  sender_id UUID,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table for admin
CREATE TABLE public.admin_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'support',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- RLS for support_tickets
CREATE POLICY "Users can view their own tickets" ON public.support_tickets
FOR SELECT USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can create tickets" ON public.support_tickets
FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Admins can update tickets" ON public.support_tickets
FOR UPDATE USING (is_admin());

-- RLS for ticket_messages
CREATE POLICY "Users can view messages of their tickets" ON public.ticket_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.support_tickets 
    WHERE id = ticket_messages.ticket_id 
    AND (user_id = auth.uid() OR is_admin())
  )
);

CREATE POLICY "Users can send messages to their tickets" ON public.ticket_messages
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.support_tickets 
    WHERE id = ticket_messages.ticket_id 
    AND (user_id = auth.uid() OR is_admin())
  )
);

CREATE POLICY "Admins can update messages" ON public.ticket_messages
FOR UPDATE USING (is_admin());

-- RLS for admin_notifications
CREATE POLICY "Only admins can view notifications" ON public.admin_notifications
FOR SELECT USING (is_admin());

CREATE POLICY "System can insert notifications" ON public.admin_notifications
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update notifications" ON public.admin_notifications
FOR UPDATE USING (is_admin());

-- Enable realtime for live chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;

-- Triggers for updated_at
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();