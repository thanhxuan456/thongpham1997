import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import CartDrawer from "@/components/CartDrawer";
import { useState } from "react";
import { Users, Award, Target, Heart, ArrowRight, Sparkles, Code, Globe, Rocket } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  const [cartOpen, setCartOpen] = useState(false);

  const values = [
    { icon: Sparkles, title: "Chất lượng", desc: "Themes được kiểm tra kỹ lưỡng trước khi phát hành" },
    { icon: Code, title: "Công nghệ", desc: "Sử dụng công nghệ mới nhất và best practices" },
    { icon: Globe, title: "Địa phương hóa", desc: "Tối ưu cho thị trường Việt Nam và quốc tế" },
    { icon: Rocket, title: "Hiệu suất", desc: "Tốc độ và SEO được ưu tiên hàng đầu" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header onCartClick={() => setCartOpen(true)} />

      <main>
        {/* Hero */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
          <div className="absolute top-20 right-[10%] w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-[10%] w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection animation="fade-up" className="text-center max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
                <Users className="h-4 w-4" />
                Về chúng tôi
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                Đội ngũ đứng sau <span className="gradient-text">ThemeVN</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Chúng tôi là đội ngũ đam mê công nghệ, mang đến những giải pháp WordPress tốt nhất cho cộng đồng Việt Nam.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <AnimatedSection animation="fade-right">
                <div className="relative">
                  <div className="aspect-square max-w-md mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl transform rotate-3" />
                    <div className="absolute inset-4 bg-gradient-to-br from-primary/30 to-accent/30 rounded-3xl transform -rotate-3" />
                    <div className="relative bg-card rounded-3xl card-shadow h-full flex items-center justify-center overflow-hidden">
                      <div className="text-center p-8">
                        <span className="text-9xl">🚀</span>
                        <p className="mt-6 text-xl font-bold text-foreground">Đổi mới không ngừng</p>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
              
              <AnimatedSection animation="fade-left">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 rounded-full text-accent text-sm font-medium mb-4">
                  Sứ mệnh
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Giúp doanh nghiệp Việt <span className="gradient-text">vươn xa</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  ThemeVN được thành lập với sứ mệnh giúp các doanh nghiệp Việt Nam tiếp cận được những giải pháp website chuyên nghiệp với chi phí hợp lý. Chúng tôi tin rằng mọi doanh nghiệp đều xứng đáng có một website đẹp và hiệu quả.
                </p>
                <ul className="space-y-4">
                  {["Themes chất lượng cao với giá cả phải chăng", "Hỗ trợ tiếng Việt 24/7", "Cập nhật liên tục theo xu hướng mới nhất", "Tối ưu SEO và hiệu suất"].map((item) => (
                    <li key={item} className="flex items-center gap-4 text-foreground">
                      <span className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-foreground text-sm">✓</span>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <AnimatedSection animation="fade-up" className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Giá trị <span className="gradient-text">cốt lõi</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Những nguyên tắc định hướng mọi hoạt động của chúng tôi
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <AnimatedSection key={value.title} animation="fade-up" delay={index * 100}>
                  <div className="bg-card p-6 rounded-2xl card-shadow hover:card-shadow-hover transition-all hover:-translate-y-1 h-full">
                    <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center mb-4">
                      <value.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-primary to-accent rounded-3xl p-8 md:p-12 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-40 h-40 border border-white/20 rounded-full" />
                <div className="absolute bottom-0 right-0 w-60 h-60 border border-white/20 rounded-full" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
                {[
                  { icon: Users, value: "50,000+", label: "Khách hàng" },
                  { icon: Award, value: "1,000+", label: "Themes" },
                  { icon: Target, value: "99%", label: "Hài lòng" },
                  { icon: Heart, value: "5+", label: "Năm kinh nghiệm" },
                ].map((stat, index) => (
                  <AnimatedSection key={stat.label} animation="zoom" delay={index * 100}>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <stat.icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-white/70">{stat.label}</div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <AnimatedSection animation="fade-up" className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
                👥 Đội ngũ
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Những người <span className="gradient-text">tuyệt vời</span>
              </h2>
              <p className="text-muted-foreground">Đội ngũ tâm huyết đứng sau ThemeVN</p>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { name: "Thông Phạm", role: "Founder & CEO", emoji: "👨‍💻", desc: "Full-stack developer với hơn 10 năm kinh nghiệm" },
                { name: "Minh Nguyễn", role: "Lead Designer", emoji: "🎨", desc: "UI/UX designer đam mê tạo ra trải nghiệm tuyệt vời" },
                { name: "Hà Trần", role: "Support Manager", emoji: "💬", desc: "Chuyên gia hỗ trợ khách hàng tận tâm" },
              ].map((member, index) => (
                <AnimatedSection key={member.name} animation="fade-up" delay={index * 100}>
                  <div className="bg-card p-8 rounded-2xl card-shadow text-center group hover:card-shadow-hover transition-all hover:-translate-y-2">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl group-hover:scale-110 transition-transform">
                      {member.emoji}
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-1">{member.name}</h3>
                    <p className="text-primary font-medium text-sm mb-3">{member.role}</p>
                    <p className="text-sm text-muted-foreground">{member.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <AnimatedSection animation="fade-up" className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Sẵn sàng bắt đầu?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Khám phá bộ sưu tập themes WordPress chất lượng cao của chúng tôi ngay hôm nay.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-8 py-4 gradient-bg text-primary-foreground font-medium rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/30"
              >
                Xem tất cả Themes
                <ArrowRight className="h-5 w-5" />
              </Link>
            </AnimatedSection>
          </div>
        </section>
      </main>

      <Footer />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export default About;
