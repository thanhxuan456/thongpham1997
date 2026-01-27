-- Create email_templates table
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Only admins can manage email templates
CREATE POLICY "Only admins can view email templates"
ON public.email_templates
FOR SELECT
USING (is_admin());

CREATE POLICY "Only admins can insert email templates"
ON public.email_templates
FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Only admins can update email templates"
ON public.email_templates
FOR UPDATE
USING (is_admin());

CREATE POLICY "Only admins can delete email templates"
ON public.email_templates
FOR DELETE
USING (is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default email templates
INSERT INTO public.email_templates (name, slug, subject, html_content, variables) VALUES
('OTP Đăng ký', 'otp-signup', 'Mã xác thực đăng ký - {{store_name}}', 
'<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="text-align: center; padding: 20px;"><h1 style="color: #6366f1;">{{store_name}}</h1></div><div style="background: #f8fafc; border-radius: 12px; padding: 30px; text-align: center;"><h2 style="margin: 0 0 10px;">Mã xác thực của bạn</h2><p style="color: #64748b;">Sử dụng mã bên dưới để hoàn tất đăng ký:</p><div style="background: #6366f1; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; border-radius: 8px; margin: 20px 0;">{{otp_code}}</div><p style="color: #64748b; font-size: 14px;">Mã có hiệu lực trong 10 phút</p></div><div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;"><p>© {{year}} {{store_name}}. All rights reserved.</p></div></body></html>',
ARRAY['store_name', 'otp_code', 'year']),

('OTP Đăng nhập', 'otp-login', 'Mã xác thực đăng nhập - {{store_name}}',
'<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="text-align: center; padding: 20px;"><h1 style="color: #6366f1;">{{store_name}}</h1></div><div style="background: #f8fafc; border-radius: 12px; padding: 30px; text-align: center;"><h2 style="margin: 0 0 10px;">Xác thực đăng nhập</h2><p style="color: #64748b;">Mã OTP để đăng nhập vào tài khoản:</p><div style="background: #6366f1; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; border-radius: 8px; margin: 20px 0;">{{otp_code}}</div><p style="color: #64748b; font-size: 14px;">Mã có hiệu lực trong 10 phút</p></div><div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;"><p>© {{year}} {{store_name}}. All rights reserved.</p></div></body></html>',
ARRAY['store_name', 'otp_code', 'year']),

('OTP Đặt lại mật khẩu', 'otp-reset-password', 'Đặt lại mật khẩu - {{store_name}}',
'<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="text-align: center; padding: 20px;"><h1 style="color: #6366f1;">{{store_name}}</h1></div><div style="background: #f8fafc; border-radius: 12px; padding: 30px; text-align: center;"><h2 style="margin: 0 0 10px;">Đặt lại mật khẩu</h2><p style="color: #64748b;">Mã OTP để đặt lại mật khẩu:</p><div style="background: #f59e0b; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; border-radius: 8px; margin: 20px 0;">{{otp_code}}</div><p style="color: #64748b; font-size: 14px;">Mã có hiệu lực trong 10 phút</p><p style="color: #ef4444; font-size: 12px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p></div><div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;"><p>© {{year}} {{store_name}}. All rights reserved.</p></div></body></html>',
ARRAY['store_name', 'otp_code', 'year']),

('Xác nhận đơn hàng', 'order-confirmation', 'Xác nhận đơn hàng #{{order_id}} - {{store_name}}',
'<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="text-align: center; padding: 20px;"><h1 style="color: #6366f1;">{{store_name}}</h1></div><div style="background: #f8fafc; border-radius: 12px; padding: 30px;"><h2 style="color: #22c55e; margin: 0 0 20px;">✓ Đơn hàng đã được xác nhận!</h2><p>Xin chào <strong>{{customer_name}}</strong>,</p><p>Cảm ơn bạn đã đặt hàng. Đơn hàng <strong>#{{order_id}}</strong> đã được xác nhận.</p><div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;"><h3 style="margin: 0 0 15px;">Chi tiết đơn hàng</h3>{{order_items}}<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 15px 0;"><p style="text-align: right; font-size: 18px;"><strong>Tổng cộng: {{total_amount}}</strong></p></div></div><div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;"><p>© {{year}} {{store_name}}. All rights reserved.</p></div></body></html>',
ARRAY['store_name', 'order_id', 'customer_name', 'order_items', 'total_amount', 'year']),

('Chào mừng thành viên', 'welcome', 'Chào mừng đến với {{store_name}}!',
'<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="text-align: center; padding: 20px;"><h1 style="color: #6366f1;">{{store_name}}</h1></div><div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 12px; padding: 40px; text-align: center; color: white;"><h1 style="margin: 0 0 10px;">🎉 Chào mừng!</h1><p style="font-size: 18px; opacity: 0.9;">Xin chào {{customer_name}},</p><p style="opacity: 0.9;">Cảm ơn bạn đã đăng ký tài khoản tại {{store_name}}.</p></div><div style="padding: 30px; text-align: center;"><p>Khám phá hàng ngàn themes chất lượng cao cho website của bạn.</p><a href="{{shop_url}}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">Khám phá ngay</a></div><div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;"><p>© {{year}} {{store_name}}. All rights reserved.</p></div></body></html>',
ARRAY['store_name', 'customer_name', 'shop_url', 'year']);