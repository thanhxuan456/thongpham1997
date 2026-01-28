-- Insert missing settings that are used in the admin form
INSERT INTO public.settings (key, value, description, is_secret)
VALUES 
  ('META_TITLE', 'ThemeVN - Nền tảng WordPress Themes hàng đầu Việt Nam', 'Tiêu đề website cho SEO', false),
  ('META_DESCRIPTION', 'Khám phá hàng trăm WordPress themes chất lượng cao được thiết kế chuyên nghiệp, tối ưu SEO và tốc độ tải nhanh.', 'Mô tả website cho SEO', false),
  ('META_KEYWORDS', 'wordpress themes, theme wordpress vietnam, mua theme wordpress', 'Từ khóa SEO', false),
  ('GTM_ID', '', 'Google Tag Manager ID', false)
ON CONFLICT (key) DO NOTHING;