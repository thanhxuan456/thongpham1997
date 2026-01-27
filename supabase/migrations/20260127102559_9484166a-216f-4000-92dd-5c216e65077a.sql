-- Create settings table to store admin configurations including API keys
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  description TEXT,
  is_secret BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view and manage settings
CREATE POLICY "Only admins can view settings"
ON public.settings
FOR SELECT
USING (is_admin());

CREATE POLICY "Only admins can insert settings"
ON public.settings
FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Only admins can update settings"
ON public.settings
FOR UPDATE
USING (is_admin());

CREATE POLICY "Only admins can delete settings"
ON public.settings
FOR DELETE
USING (is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default API settings
INSERT INTO public.settings (key, value, description, is_secret) VALUES
('RESEND_API_KEY', '', 'API key for Resend email service', true),
('GOOGLE_ANALYTICS_ID', '', 'Google Analytics tracking ID', false),
('FACEBOOK_PIXEL_ID', '', 'Facebook Pixel ID for ads tracking', false),
('MOMO_PARTNER_CODE', '', 'MoMo payment partner code', true),
('MOMO_ACCESS_KEY', '', 'MoMo payment access key', true),
('VNPAY_TMN_CODE', '', 'VNPay terminal code', true),
('VNPAY_HASH_SECRET', '', 'VNPay hash secret', true),
('ZALOPAY_APP_ID', '', 'ZaloPay application ID', true),
('ZALOPAY_KEY1', '', 'ZaloPay key 1', true),
('STORE_NAME', 'ThemeHub Vietnam', 'Store display name', false),
('STORE_EMAIL', 'contact@themehub.vn', 'Store contact email', false),
('STORE_PHONE', '+84 123 456 789', 'Store phone number', false),
('STORE_ADDRESS', '123 Nguyễn Huệ, Quận 1, TP.HCM', 'Store address', false),
('CURRENCY', 'VND', 'Default currency', false),
('LANGUAGE', 'vi', 'Default language', false);