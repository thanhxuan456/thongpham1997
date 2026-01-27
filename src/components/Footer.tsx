import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Send, Heart, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import WaveDivider from "@/components/WaveDivider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng nhập email hợp lệ",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("subscribers")
        .insert({ email: email.trim().toLowerCase() });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Đã đăng ký",
            description: "Email này đã được đăng ký nhận tin trước đó!",
          });
        } else {
          throw error;
        }
      } else {
        setIsSubscribed(true);
        toast({
          title: "Đăng ký thành công! 🎉",
          description: "Cảm ơn bạn đã đăng ký nhận tin từ ThemeVN!",
        });
        setEmail("");
        
        // Reset success state after 5 seconds
        setTimeout(() => setIsSubscribed(false), 5000);
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể đăng ký. Vui lòng thử lại sau.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            
            {isSubscribed ? (
              <div className="flex flex-col items-center gap-3 p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl animate-in fade-in duration-500">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
                <h4 className="text-xl font-semibold text-white">Đăng ký thành công!</h4>
                <p className="text-white/70">
                  Cảm ơn bạn! Hãy kiểm tra email để nhận ưu đãi WELCOME10 giảm 10%.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email của bạn..."
                  disabled={isSubmitting}
                  className="flex-1 h-12 px-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all disabled:opacity-50"
                />
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 px-6 bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Đăng ký
                    </>
                  )}
                </Button>
              </form>
            )}
            
            {/* Benefits list */}
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              {[
                "🆕 Theme mới ra mắt",
                "🎁 Mã giảm giá độc quyền",
                "💡 Tips WordPress"
              ].map((benefit) => (
                <span 
                  key={benefit}
                  className="text-sm text-white/70 bg-white/10 px-3 py-1 rounded-full"
                >
                  {benefit}
                </span>
              ))}
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
                <a 
                  href="#" 
                  className="social-icon-btn w-10 h-10 rounded-full flex items-center justify-center text-white/70 transition-all duration-300 border-2 border-transparent bg-white/10 backdrop-blur-sm hover:text-[#1877F2] hover:border-[#1877F2] hover:bg-[#1877F2]/10 hover:scale-110"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="social-icon-btn w-10 h-10 rounded-full flex items-center justify-center text-white/70 transition-all duration-300 border-2 border-transparent bg-white/10 backdrop-blur-sm hover:text-[#1DA1F2] hover:border-[#1DA1F2] hover:bg-[#1DA1F2]/10 hover:scale-110"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="social-icon-btn w-10 h-10 rounded-full flex items-center justify-center text-white/70 transition-all duration-300 border-2 border-transparent bg-white/10 backdrop-blur-sm hover:text-[#E4405F] hover:border-[#E4405F] hover:bg-[#E4405F]/10 hover:scale-110"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="social-icon-btn w-10 h-10 rounded-full flex items-center justify-center text-white/70 transition-all duration-300 border-2 border-transparent bg-white/10 backdrop-blur-sm hover:text-[#FF0000] hover:border-[#FF0000] hover:bg-[#FF0000]/10 hover:scale-110"
                >
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
                  <Link to="/about" className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Giới thiệu
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold text-white mb-6 text-lg">Hỗ trợ</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/support" className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Trung tâm hỗ trợ
                  </Link>
                </li>
                <li>
                  <Link to="/policy" className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Chính sách hoàn tiền
                  </Link>
                </li>
                <li>
                  <Link to="/policy" className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Điều khoản sử dụng
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
