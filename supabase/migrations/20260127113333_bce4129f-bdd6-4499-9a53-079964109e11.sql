-- Create subscribers table for newsletter
CREATE TABLE public.subscribers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{"new_themes": true, "coupons": true, "tips": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (insert their email)
CREATE POLICY "Anyone can subscribe" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view all subscribers
CREATE POLICY "Only admins can view subscribers" 
ON public.subscribers 
FOR SELECT 
USING (is_admin());

-- Only admins can update subscribers
CREATE POLICY "Only admins can update subscribers" 
ON public.subscribers 
FOR UPDATE 
USING (is_admin());

-- Only admins can delete subscribers
CREATE POLICY "Only admins can delete subscribers" 
ON public.subscribers 
FOR DELETE 
USING (is_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_subscribers_updated_at
BEFORE UPDATE ON public.subscribers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default email templates for newsletter
INSERT INTO public.email_templates (name, slug, subject, html_content, variables, is_active)
VALUES 
  (
    'Thông báo Theme mới',
    'new-theme-notification',
    '🎉 Theme mới: {{theme_name}} đã có mặt tại ThemeVN!',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
  <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 16px 16px 0 0; padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🎨 Theme Mới Ra Mắt!</h1>
  </div>
  <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <h2 style="color: #1f2937; margin: 0 0 15px;">{{theme_name}}</h2>
    <p style="color: #6b7280; line-height: 1.6;">{{theme_description}}</p>
    <div style="margin: 25px 0; padding: 20px; background: #f3f4f6; border-radius: 12px;">
      <p style="margin: 0; color: #374151;">
        <strong style="color: #6366f1; font-size: 24px;">{{theme_price}}</strong>
        <span style="text-decoration: line-through; color: #9ca3af; margin-left: 10px;">{{original_price}}</span>
      </p>
    </div>
    <a href="{{theme_url}}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">Xem Theme Ngay →</a>
  </div>
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p>© {{year}} {{store_name}}. Bạn nhận email này vì đã đăng ký nhận thông tin.</p>
    <a href="{{unsubscribe_url}}" style="color: #6366f1;">Hủy đăng ký</a>
  </div>
</body>
</html>',
    ARRAY['theme_name', 'theme_description', 'theme_price', 'original_price', 'theme_url', 'year', 'store_name', 'unsubscribe_url'],
    true
  ),
  (
    'Thông báo Coupon mới',
    'new-coupon-notification',
    '🎁 Mã giảm giá {{discount_value}} đang chờ bạn!',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); border-radius: 16px 16px 0 0; padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🎁 Ưu Đãi Đặc Biệt!</h1>
  </div>
  <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
    <p style="color: #6b7280; margin: 0 0 20px;">Sử dụng mã sau để nhận ưu đãi:</p>
    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 12px; border: 2px dashed #f59e0b; margin-bottom: 20px;">
      <p style="font-size: 32px; font-weight: bold; color: #b45309; margin: 0; letter-spacing: 4px;">{{coupon_code}}</p>
    </div>
    <h2 style="color: #ef4444; margin: 0 0 10px; font-size: 36px;">{{discount_value}}</h2>
    <p style="color: #6b7280; margin: 0 0 5px;">{{coupon_description}}</p>
    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 25px;">Hết hạn: {{expires_at}}</p>
    <a href="{{shop_url}}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">Mua Sắm Ngay →</a>
  </div>
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p>© {{year}} {{store_name}}. Bạn nhận email này vì đã đăng ký nhận thông tin.</p>
    <a href="{{unsubscribe_url}}" style="color: #f59e0b;">Hủy đăng ký</a>
  </div>
</body>
</html>',
    ARRAY['coupon_code', 'discount_value', 'coupon_description', 'expires_at', 'shop_url', 'year', 'store_name', 'unsubscribe_url'],
    true
  ),
  (
    'Bản tin hàng tuần',
    'weekly-newsletter',
    '📬 Bản tin tuần này từ {{store_name}}',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
  <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 16px 16px 0 0; padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">📬 Bản Tin Hàng Tuần</h1>
    <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0;">Tuần {{week_number}}, {{year}}</p>
  </div>
  <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <h2 style="color: #1f2937; margin: 0 0 15px;">Xin chào {{subscriber_name}}!</h2>
    <p style="color: #6b7280; line-height: 1.6;">{{newsletter_content}}</p>
    
    <div style="margin: 25px 0; padding: 20px; background: #f3f4f6; border-radius: 12px;">
      <h3 style="color: #1f2937; margin: 0 0 15px;">🆕 Theme mới trong tuần</h3>
      {{new_themes_list}}
    </div>
    
    <div style="margin: 25px 0; padding: 20px; background: #fef3c7; border-radius: 12px;">
      <h3 style="color: #b45309; margin: 0 0 10px;">🎁 Khuyến mãi đang diễn ra</h3>
      {{promotions_content}}
    </div>
    
    <div style="text-align: center; margin-top: 25px;">
      <a href="{{shop_url}}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">Khám Phá Ngay →</a>
    </div>
  </div>
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p>© {{year}} {{store_name}}. Bạn nhận email này vì đã đăng ký nhận thông tin.</p>
    <a href="{{unsubscribe_url}}" style="color: #6366f1;">Hủy đăng ký</a>
  </div>
</body>
</html>',
    ARRAY['subscriber_name', 'newsletter_content', 'new_themes_list', 'promotions_content', 'week_number', 'year', 'store_name', 'shop_url', 'unsubscribe_url'],
    true
  ),
  (
    'Chào mừng đăng ký',
    'welcome-subscriber',
    '🎉 Chào mừng bạn đến với {{store_name}}!',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 16px 16px 0 0; padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Chào Mừng Bạn!</h1>
  </div>
  <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <h2 style="color: #1f2937; margin: 0 0 15px;">Cảm ơn bạn đã đăng ký!</h2>
    <p style="color: #6b7280; line-height: 1.6;">Bạn sẽ nhận được thông tin về:</p>
    <ul style="color: #6b7280; line-height: 2;">
      <li>🆕 Theme mới ra mắt</li>
      <li>🎁 Mã giảm giá độc quyền</li>
      <li>💡 Tips & tricks WordPress</li>
      <li>📰 Tin tức công nghệ</li>
    </ul>
    <div style="margin: 25px 0; padding: 20px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; text-align: center;">
      <p style="margin: 0 0 10px; color: #b45309; font-weight: bold;">🎁 Quà tặng đăng ký!</p>
      <p style="font-size: 24px; font-weight: bold; color: #b45309; margin: 0; letter-spacing: 2px;">WELCOME10</p>
      <p style="color: #92400e; font-size: 14px; margin: 10px 0 0;">Giảm 10% cho đơn hàng đầu tiên</p>
    </div>
    <div style="text-align: center;">
      <a href="{{shop_url}}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">Khám Phá Ngay →</a>
    </div>
  </div>
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p>© {{year}} {{store_name}}. Bạn nhận email này vì đã đăng ký nhận thông tin.</p>
  </div>
</body>
</html>',
    ARRAY['year', 'store_name', 'shop_url'],
    true
  )
ON CONFLICT (slug) DO NOTHING;