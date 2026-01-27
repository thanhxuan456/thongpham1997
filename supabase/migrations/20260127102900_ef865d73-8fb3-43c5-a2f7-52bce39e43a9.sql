-- Create menu_items table for dynamic menu management
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_location TEXT NOT NULL DEFAULT 'header',
  parent_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT,
  icon TEXT,
  target TEXT DEFAULT '_self',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  css_class TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Anyone can view active menu items
CREATE POLICY "Active menu items are viewable by everyone"
ON public.menu_items
FOR SELECT
USING (is_active = true OR is_admin());

-- Only admins can manage menu items
CREATE POLICY "Only admins can insert menu items"
ON public.menu_items
FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Only admins can update menu items"
ON public.menu_items
FOR UPDATE
USING (is_admin());

CREATE POLICY "Only admins can delete menu items"
ON public.menu_items
FOR DELETE
USING (is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_menu_items_updated_at
BEFORE UPDATE ON public.menu_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default menu items
INSERT INTO public.menu_items (menu_location, title, url, icon, sort_order) VALUES
('header', 'Trang chủ', '/', 'Home', 0),
('header', 'Themes', '/themes', 'Palette', 1),
('header', 'Giới thiệu', '/about', 'Info', 2),
('header', 'Blog', '/blog', 'FileText', 3),
('header', 'Hỗ trợ', '/support', 'HelpCircle', 4),
('footer', 'Chính sách bảo mật', '/policy?tab=privacy', 'Shield', 0),
('footer', 'Điều khoản sử dụng', '/policy?tab=terms', 'FileText', 1),
('footer', 'Chính sách hoàn tiền', '/policy?tab=refund', 'RefreshCw', 2),
('footer', 'Liên hệ', '/support', 'Mail', 3);

-- Add bank info settings
INSERT INTO public.settings (key, value, description, is_secret) VALUES
('BANK_NAME', '', 'Tên ngân hàng', false),
('BANK_CODE', '', 'Mã ngân hàng (VietQR)', false),
('BANK_ACCOUNT_NUMBER', '', 'Số tài khoản', false),
('BANK_ACCOUNT_NAME', '', 'Tên chủ tài khoản', false),
('BANK_BRANCH', '', 'Chi nhánh', false)
ON CONFLICT (key) DO NOTHING;