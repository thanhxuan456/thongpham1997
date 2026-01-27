-- Create user_downloads table to track purchased themes
CREATE TABLE public.user_downloads (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    theme_id UUID REFERENCES public.themes(id) ON DELETE SET NULL,
    theme_name TEXT NOT NULL,
    download_url TEXT,
    download_count INTEGER NOT NULL DEFAULT 0,
    max_downloads INTEGER DEFAULT 5,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_sessions table to track login sessions
CREATE TABLE public.user_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    session_token TEXT NOT NULL,
    device_info TEXT,
    ip_address TEXT,
    user_agent TEXT,
    is_current BOOLEAN NOT NULL DEFAULT false,
    last_active_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_downloads
CREATE POLICY "Users can view their own downloads"
ON public.user_downloads
FOR SELECT
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "System can insert downloads"
ON public.user_downloads
FOR INSERT
WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can update their own downloads"
ON public.user_downloads
FOR UPDATE
USING (user_id = auth.uid() OR is_admin());

-- RLS policies for user_sessions
CREATE POLICY "Users can view their own sessions"
ON public.user_sessions
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can insert sessions"
ON public.user_sessions
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own sessions"
ON public.user_sessions
FOR DELETE
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own sessions"
ON public.user_sessions
FOR UPDATE
USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_user_downloads_updated_at
BEFORE UPDATE ON public.user_downloads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at
BEFORE UPDATE ON public.user_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();