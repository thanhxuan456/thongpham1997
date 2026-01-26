import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import CartDrawer from "@/components/CartDrawer";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { 
  Book, 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Video, 
  HelpCircle,
  Send,
  Headphones,
  FileText,
  Zap
} from "lucide-react";

const faqs = [
  {
    question: "Làm thế nào để cài đặt theme?",
    answer: "Sau khi mua theme, bạn sẽ nhận được file ZIP qua email. Đăng nhập vào WordPress Dashboard > Appearance > Themes > Add New > Upload Theme, chọn file ZIP và click Install Now. Sau đó Active theme là xong."
  },
  {
    question: "Theme có được cập nhật miễn phí không?",
    answer: "Có, tất cả các theme đều được cập nhật miễn phí trọn đời. Bạn sẽ nhận được thông báo qua email mỗi khi có phiên bản mới."
  },
  {
    question: "Tôi có thể sử dụng theme cho nhiều website không?",
    answer: "Mỗi license cho phép sử dụng trên 1 website. Nếu bạn cần sử dụng cho nhiều website, vui lòng liên hệ để được tư vấn gói Extended License."
  },
  {
    question: "Chính sách hoàn tiền như thế nào?",
    answer: "Chúng tôi có chính sách hoàn tiền trong vòng 7 ngày nếu theme không hoạt động như mô tả. Vui lòng liên hệ support để được hỗ trợ."
  },
  {
    question: "Theme có hỗ trợ Elementor/Gutenberg không?",
    answer: "Hầu hết các theme của chúng tôi đều tương thích với cả Elementor và Gutenberg. Vui lòng kiểm tra phần 'Tương thích' của từng theme để biết chi tiết."
  },
];

const Support = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const supportCards = [
    { icon: Book, title: "Tài liệu hướng dẫn", desc: "Hướng dẫn chi tiết cài đặt và sử dụng", color: "from-blue-500 to-blue-600" },
    { icon: Video, title: "Video tutorials", desc: "Video hướng dẫn từng bước cụ thể", color: "from-purple-500 to-purple-600" },
    { icon: MessageCircle, title: "Chat trực tiếp", desc: "Nhắn tin với support team 24/7", color: "from-green-500 to-green-600" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header onCartClick={() => setCartOpen(true)} />

      <main>
        {/* Hero */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
          <div className="absolute top-20 left-[20%] w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-[15%] w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection animation="fade-up" className="text-center max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
                <Headphones className="h-4 w-4" />
                Trung tâm hỗ trợ
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                Chúng tôi ở đây <span className="gradient-text">để giúp bạn</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Tìm câu trả lời nhanh hoặc liên hệ trực tiếp với đội ngũ support tận tâm của chúng tôi.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {supportCards.map((item, index) => (
                <AnimatedSection key={item.title} animation="fade-up" delay={index * 100}>
                  <a
                    href="#"
                    className="block bg-card p-8 rounded-2xl card-shadow hover:card-shadow-hover transition-all hover:-translate-y-2 group border border-border/50"
                  >
                    <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg`}>
                      <item.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </a>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <AnimatedSection animation="fade-up" className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 rounded-full text-accent text-sm font-medium mb-4">
                <HelpCircle className="h-4 w-4" />
                FAQ
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Câu hỏi <span className="gradient-text">thường gặp</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Tìm câu trả lời cho những thắc mắc phổ biến nhất
              </p>
            </AnimatedSection>

            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <AnimatedSection key={index} animation="fade-up" delay={index * 50}>
                  <div className="bg-card rounded-2xl overflow-hidden card-shadow border border-border/50">
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full p-6 flex items-center justify-between text-left"
                    >
                      <span className="font-medium text-foreground pr-4">{faq.question}</span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openFaq === index ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                        {openFaq === index ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </button>
                    {openFaq === index && (
                      <div className="px-6 pb-6 text-muted-foreground animate-fade-in">
                        <div className="pt-4 border-t border-border">
                          {faq.answer}
                        </div>
                      </div>
                    )}
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              <AnimatedSection animation="fade-right">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
                  <Mail className="h-4 w-4" />
                  Liên hệ
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Gửi yêu cầu <span className="gradient-text">hỗ trợ</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Không tìm thấy câu trả lời? Đừng ngại liên hệ với chúng tôi. Đội ngũ support sẽ phản hồi trong vòng 24 giờ.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-5 bg-card rounded-2xl card-shadow border border-border/50 group hover:border-primary/30 transition-colors">
                    <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Email</div>
                      <div className="text-muted-foreground">support@themevn.vn</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-5 bg-card rounded-2xl card-shadow border border-border/50 group hover:border-primary/30 transition-colors">
                    <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Hotline</div>
                      <div className="text-muted-foreground">1900 1234</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-5 bg-card rounded-2xl card-shadow border border-border/50 group hover:border-primary/30 transition-colors">
                    <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Giờ làm việc</div>
                      <div className="text-muted-foreground">8:00 - 22:00 (Thứ 2 - CN)</div>
                    </div>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-4 mt-8">
                  <div className="text-center p-4 bg-secondary/50 rounded-xl">
                    <div className="text-2xl font-bold text-primary">&lt;2h</div>
                    <div className="text-xs text-muted-foreground">Phản hồi TB</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/50 rounded-xl">
                    <div className="text-2xl font-bold text-primary">99%</div>
                    <div className="text-xs text-muted-foreground">Hài lòng</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/50 rounded-xl">
                    <div className="text-2xl font-bold text-primary">24/7</div>
                    <div className="text-xs text-muted-foreground">Hỗ trợ</div>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection animation="fade-left">
                <div className="bg-card p-8 rounded-3xl card-shadow border border-border/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
                      <Send className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">Gửi tin nhắn</h3>
                  </div>
                  <form className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Họ tên</label>
                        <input
                          type="text"
                          className="w-full h-12 px-4 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          placeholder="Nhập họ tên"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                        <input
                          type="email"
                          className="w-full h-12 px-4 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Chủ đề</label>
                      <select className="w-full h-12 px-4 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                        <option>Hỗ trợ cài đặt</option>
                        <option>Báo lỗi</option>
                        <option>Yêu cầu tính năng</option>
                        <option>Thanh toán</option>
                        <option>Khác</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Nội dung</label>
                      <textarea
                        className="w-full h-32 px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                        placeholder="Mô tả vấn đề của bạn..."
                      />
                    </div>
                    <Button variant="hero" size="lg" className="w-full h-12 rounded-xl">
                      <Send className="mr-2 h-5 w-5" />
                      Gửi yêu cầu
                    </Button>
                  </form>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export default Support;
