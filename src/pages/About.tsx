import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import CartDrawer from "@/components/CartDrawer";
import { useState } from "react";
import { Users, Award, Target, Heart } from "lucide-react";

const About = () => {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onCartClick={() => setCartOpen(true)} />

      <main>
        {/* Hero */}
        <section className="py-20 bg-gradient-to-br from-primary/10 via-transparent to-accent/10">
          <div className="container mx-auto px-4">
            <AnimatedSection animation="fade-up" className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Về <span className="gradient-text">ThemeVN</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Chúng tôi là đội ngũ đam mê công nghệ, mang đến những giải pháp WordPress tốt nhất cho cộng đồng Việt Nam.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <AnimatedSection animation="fade-right">
                <div className="relative">
                  <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl" />
                  <div className="absolute inset-8 bg-card rounded-2xl card-shadow flex items-center justify-center">
                    <span className="text-8xl">🚀</span>
                  </div>
                </div>
              </AnimatedSection>
              
              <AnimatedSection animation="fade-left">
                <h2 className="text-3xl font-bold text-foreground mb-4">Sứ mệnh của chúng tôi</h2>
                <p className="text-muted-foreground mb-6">
                  ThemeVN được thành lập với sứ mệnh giúp các doanh nghiệp Việt Nam tiếp cận được những giải pháp website chuyên nghiệp với chi phí hợp lý. Chúng tôi tin rằng mọi doanh nghiệp đều xứng đáng có một website đẹp và hiệu quả.
                </p>
                <ul className="space-y-3">
                  {["Themes chất lượng cao với giá cả phải chăng", "Hỗ trợ tiếng Việt 24/7", "Cập nhật liên tục theo xu hướng mới nhất", "Tối ưu SEO và hiệu suất"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-foreground">
                      <span className="w-2 h-2 bg-accent rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: Users, value: "50,000+", label: "Khách hàng" },
                { icon: Award, value: "1,000+", label: "Themes" },
                { icon: Target, value: "99%", label: "Hài lòng" },
                { icon: Heart, value: "5", label: "Năm kinh nghiệm" },
              ].map((stat, index) => (
                <AnimatedSection key={stat.label} animation="zoom" delay={index * 100}>
                  <div className="text-center">
                    <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <stat.icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                    <div className="text-muted-foreground">{stat.label}</div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <AnimatedSection animation="fade-up" className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Đội ngũ của chúng tôi</h2>
              <p className="text-muted-foreground">Những người đứng sau ThemeVN</p>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { name: "Thông Phạm", role: "Founder & CEO", emoji: "👨‍💻" },
                { name: "Minh Nguyễn", role: "Lead Designer", emoji: "🎨" },
                { name: "Hà Trần", role: "Support Manager", emoji: "💬" },
              ].map((member, index) => (
                <AnimatedSection key={member.name} animation="fade-up" delay={index * 100}>
                  <div className="bg-card p-6 rounded-2xl card-shadow text-center">
                    <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                      {member.emoji}
                    </div>
                    <h3 className="font-semibold text-foreground">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export default About;
