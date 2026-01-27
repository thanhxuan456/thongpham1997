-- Add rate limiting settings to settings table
INSERT INTO public.settings (key, value, description, is_secret)
VALUES 
  ('OTP_RATE_LIMIT_WINDOW', '60', 'Thời gian (giây) giữa các lần gửi OTP cho cùng 1 email', false),
  ('OTP_RATE_LIMIT_MAX_ATTEMPTS', '3', 'Số lần gửi OTP tối đa trong khoảng thời gian rate limit', false),
  ('OTP_RATE_LIMIT_BLOCK_DURATION', '300', 'Thời gian khóa (giây) khi vượt quá giới hạn gửi OTP', false)
ON CONFLICT (key) DO UPDATE SET 
  description = EXCLUDED.description,
  is_secret = EXCLUDED.is_secret;