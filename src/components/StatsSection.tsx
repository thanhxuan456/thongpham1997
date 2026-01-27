import { Package, Users, ThumbsUp, Headphones, Anchor, Ship } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const StatsSection = () => {
  const stats = [
    { value: "1000+", label: "Premium Themes", icon: Package },
    { value: "50K+", label: "Khách hàng", icon: Users },
    { value: "99%", label: "Hài lòng", icon: ThumbsUp },
    { value: "24/7", label: "Hỗ trợ", icon: Headphones },
  ];

  return (
    <section className="relative overflow-hidden -mt-1">
      {/* Top Wave */}
      <div className="w-full overflow-hidden leading-none rotate-180 bg-gradient-to-r from-primary via-[hsl(var(--primary)/0.9)] to-accent">
        <svg
          className="relative block w-full h-[60px] md:h-[80px]"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V120H0Z"
            className="fill-background"
          />
        </svg>
      </div>

      {/* Main Content */}
      <div className="bg-gradient-to-r from-primary via-[hsl(var(--primary)/0.9)] to-accent py-16 md:py-24 relative">
        {/* Animated Background Elements - Container/Ship Theme */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Shipping containers floating */}
          <div className="absolute top-10 left-[5%] opacity-10 animate-pulse">
            <div className="w-32 h-12 bg-white/20 rounded-sm border-2 border-white/30 flex items-center justify-center">
              <div className="w-full h-full grid grid-cols-4 gap-px p-1">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white/30 rounded-sm" />
                ))}
              </div>
            </div>
          </div>
          
          <div className="absolute top-20 right-[10%] opacity-10 animate-pulse" style={{ animationDelay: '1s' }}>
            <div className="w-40 h-14 bg-white/20 rounded-sm border-2 border-white/30 flex items-center justify-center">
              <div className="w-full h-full grid grid-cols-5 gap-px p-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white/30 rounded-sm" />
                ))}
              </div>
            </div>
          </div>

          <div className="absolute bottom-20 left-[15%] opacity-10 animate-pulse" style={{ animationDelay: '0.5s' }}>
            <div className="w-28 h-10 bg-white/20 rounded-sm border-2 border-white/30 flex items-center justify-center">
              <div className="w-full h-full grid grid-cols-3 gap-px p-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white/30 rounded-sm" />
                ))}
              </div>
            </div>
          </div>

          {/* Decorative circles */}
          <div className="absolute top-1/4 right-[5%] w-64 h-64 border border-white/10 rounded-full" />
          <div className="absolute bottom-1/4 left-[8%] w-48 h-48 border border-white/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white/5 rounded-full" />

          {/* Ship icon decoration */}
          <Ship className="absolute bottom-10 right-[20%] w-20 h-20 text-white/5" />
          <Anchor className="absolute top-16 left-[40%] w-16 h-16 text-white/5" />
        </div>

        {/* Container Visual Elements */}
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection animation="fade-up" className="text-center mb-16">
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
              <Ship className="w-5 h-5 text-white" />
              <span className="text-white/90 text-sm font-medium">Đối tác tin cậy của bạn</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 italic">
              Được tin dùng bởi hàng nghìn khách hàng
            </h2>
            <p className="text-white/70 max-w-xl mx-auto text-lg">
              Hãy tham gia cùng cộng đồng những người đã thành công với ThemeVN
            </p>
          </AnimatedSection>

          {/* Stats Grid - Container Style Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <AnimatedSection key={stat.label} animation="zoom" delay={index * 100}>
                <div className="relative group">
                  {/* Container-style card */}
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 md:p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/10">
                    {/* Container ridges decoration */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-white/5 via-white/20 to-white/5 rounded-t-xl" />
                    
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4 mx-auto group-hover:bg-white/20 transition-colors">
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Value */}
                    <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 text-center tracking-tight">
                      {stat.value}
                    </div>

                    {/* Label */}
                    <div className="text-white/70 text-center font-medium">
                      {stat.label}
                    </div>

                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-4 right-4 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Bottom decorative elements */}
          <AnimatedSection animation="fade-up" delay={400} className="mt-12 text-center">
            <div className="inline-flex items-center gap-4 text-white/50 text-sm">
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-white/30" />
              <span>🚢 Đảm bảo chất lượng & Giao hàng nhanh chóng</span>
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-white/30" />
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="w-full overflow-hidden leading-none bg-gradient-to-r from-primary via-[hsl(var(--primary)/0.9)] to-accent">
        <svg
          className="relative block w-full h-[60px] md:h-[80px]"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.1,118.92,156.63,69.08,321.39,56.44Z"
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
};

export default StatsSection;
