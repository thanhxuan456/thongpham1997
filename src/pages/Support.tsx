import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import CartDrawer from "@/components/CartDrawer";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Book, MessageCircle, Mail, Phone, Clock, ChevronDown, ChevronUp, FileText, Video, HelpCircle } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-background">
      <Header onCartClick={() => setCartOpen(true)} />

      <main>
        {/* Hero */}
        <section className="py-20 bg-gradient-to-br from-primary/10 via-transparent to-accent/10">
          <div className="container mx-auto px-4">
            <AnimatedSection animation="fade-up" className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Trung tâm <span className="gradient-text">Hỗ trợ</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Chúng tôi luôn sẵn sàng hỗ trợ bạn. Tìm câu trả lời nhanh hoặc liên hệ trực tiếp với đội ngũ support.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { icon: Book, title: "Tài liệu hướng dẫn", desc: "Hướng dẫn chi tiết cài đặt và sử dụng", href: "#docs" },
                { icon: Video, title: "Video tutorials", desc: "Video hướng dẫn từng bước", href: "#videos" },
                { icon: MessageCircle, title: "Chat trực tiếp", desc: "Nhắn tin với support team", href: "#chat" },
              ].map((item, index) => (
                <AnimatedSection key={item.title} animation="fade-up" delay={index * 100}>
                  <a
                    href={item.href}
                    className="block bg-card p-6 rounded-2xl card-shadow hover:card-shadow-hover transition-all hover:-translate-y-1"
                  >
                    <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center mb-4">
                      <item.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </a>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <AnimatedSection animation="fade-up" className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                <HelpCircle className="inline-block mr-2 h-8 w-8" />
                Câu hỏi thường gặp
              </h2>
            </AnimatedSection>

            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <AnimatedSection key={index} animation="fade-up" delay={index * 50}>
                  <div className="bg-card rounded-xl overflow-hidden card-shadow">
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full p-5 flex items-center justify-between text-left"
                    >
                      <span className="font-medium text-foreground">{faq.question}</span>
                      {openFaq === index ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    {openFaq === index && (
                      <div className="px-5 pb-5 text-muted-foreground animate-fade-in">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              <AnimatedSection animation="fade-right">
                <h2 className="text-3xl font-bold text-foreground mb-6">Liên hệ hỗ trợ</h2>
                <p className="text-muted-foreground mb-8">
                  Không tìm thấy câu trả lời? Đừng ngại liên hệ với chúng tôi. Đội ngũ support sẽ phản hồi trong vòng 24 giờ.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-secondary rounded-xl">
                    <Mail className="h-6 w-6 text-primary" />
                    <div>
                      <div className="font-medium text-foreground">Email</div>
                      <div className="text-muted-foreground">support@themevn.vn</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-secondary rounded-xl">
                    <Phone className="h-6 w-6 text-primary" />
                    <div>
                      <div className="font-medium text-foreground">Hotline</div>
                      <div className="text-muted-foreground">1900 1234</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-secondary rounded-xl">
                    <Clock className="h-6 w-6 text-primary" />
                    <div>
                      <div className="font-medium text-foreground">Giờ làm việc</div>
                      <div className="text-muted-foreground">8:00 - 22:00 (Thứ 2 - CN)</div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection animation="fade-left">
                <div className="bg-card p-8 rounded-2xl card-shadow">
                  <h3 className="text-xl font-semibold text-foreground mb-6">Gửi yêu cầu hỗ trợ</h3>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Họ tên</label>
                      <input
                        type="text"
                        className="w-full h-12 px-4 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Nhập họ tên"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                      <input
                        type="email"
                        className="w-full h-12 px-4 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Chủ đề</label>
                      <select className="w-full h-12 px-4 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
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
                        className="w-full h-32 px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        placeholder="Mô tả vấn đề của bạn..."
                      />
                    </div>
                    <Button variant="hero" size="lg" className="w-full">
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
