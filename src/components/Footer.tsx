import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Send, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import WaveDivider from "@/components/WaveDivider";

const Footer = () => {
  return (
    <footer className="relative mt-20">
      {/* Wave divider at top */}
      <WaveDivider direction="up" className="relative z-10" fillClassName="fill-primary" />
      
      {/* Main footer with gradient background */}
      <div className="bg-gradient-to-br from-primary via-primary to-primary/90 relative -mt-1">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-[10%] w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-[15%] w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          {/* Newsletter section */}
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Đăng ký nhận thông tin mới nhất
            </h3>
            <p className="text-white/70 mb-6">
              Nhận thông tin về themes mới, khuyến mãi và tips hữu ích về WordPress
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Email của bạn..."
                className="flex-1 h-12 px-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              />
              <Button className="h-12 px-6 bg-accent hover:bg-accent/90 text-accent-foreground">
                <Send className="mr-2 h-4 w-4" />
                Đăng ký
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                  <span className="text-white font-bold text-xl">W</span>
                </div>
                <span className="font-bold text-2xl text-white">ThemeVN</span>
              </div>
              <p className="text-white/70">
                Thư viện WordPress themes cao cấp hàng đầu Việt Nam. Chất lượng, uy tín và hỗ trợ tận tâm.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all border border-white/10">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all border border-white/10">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all border border-white/10">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all border border-white/10">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-white mb-6 text-lg">Liên kết nhanh</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Trang chủ
                  </Link>
                </li>
                <li>
                  <Link to="/" className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Tất cả Themes
                  </Link>
                </li>
                <li>
                  <Link to="/" className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Danh mục
                  </Link>
                </li>
                <li>
                  <Link to="/" className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Ưu đãi đặc biệt
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold text-white mb-6 text-lg">Hỗ trợ</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Hướng dẫn cài đặt
                  </Link>
                </li>
                <li>
                  <Link to="/" className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Câu hỏi thường gặp
                  </Link>
                </li>
                <li>
                  <Link to="/" className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Chính sách bảo hành
                  </Link>
                </li>
                <li>
                  <Link to="/" className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Liên hệ hỗ trợ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-white mb-6 text-lg">Liên hệ</h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-white/70">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5 text-accent" />
                  </div>
                  <span>support@themevn.vn</span>
                </li>
                <li className="flex items-center gap-3 text-white/70">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <Phone className="h-5 w-5 text-accent" />
                  </div>
                  <span>1900 1234</span>
                </li>
                <li className="flex items-start gap-3 text-white/70">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-accent" />
                  </div>
                  <span>123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/60 text-sm flex items-center gap-1">
              © 2024 ThemeVN. Made with <Heart className="h-4 w-4 text-accent fill-accent" /> in Vietnam
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="/" className="text-white/60 hover:text-white transition-colors">
                Điều khoản sử dụng
              </Link>
              <Link to="/" className="text-white/60 hover:text-white transition-colors">
                Chính sách bảo mật
              </Link>
              <Link to="/" className="text-white/60 hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
