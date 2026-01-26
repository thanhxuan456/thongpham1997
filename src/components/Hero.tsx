import { Search, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import WaveDivider from "@/components/WaveDivider";
import { useParallax } from "@/hooks/use-parallax";

interface HeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Hero = ({ searchQuery, onSearchChange }: HeroProps) => {
  const parallaxOffset = useParallax(0.4);

  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Video Background with Parallax */}
      <div 
        className="absolute inset-0 z-0"
        style={{ transform: `translateY(${parallaxOffset}px)` }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-[120%] object-cover"
        >
          <source
            src="https://cdn.pixabay.com/video/2020/05/25/40130-424930970_large.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-accent/70 z-[1]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent z-[1]" />
      
      {/* Animated grid pattern */}
      <div className="absolute inset-0 z-[1] opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            transform: `translateY(${parallaxOffset * 0.2}px)`,
          }}
        />
      </div>

      {/* Animated floating elements with parallax */}
      <div className="absolute inset-0 z-[2] overflow-hidden pointer-events-none">
        <div 
          className="absolute top-20 left-[10%] w-4 h-4 bg-white/20 rounded-full blur-sm animate-float" 
          style={{ 
            animationDelay: "0s",
            transform: `translateY(${parallaxOffset * 0.3}px)`,
          }} 
        />
        <div 
          className="absolute top-40 left-[25%] w-2 h-2 bg-white/30 rounded-full animate-float" 
          style={{ 
            animationDelay: "1s",
            transform: `translateY(${parallaxOffset * 0.5}px)`,
          }} 
        />
        <div 
          className="absolute top-32 right-[20%] w-6 h-6 bg-white/15 rounded-full blur-sm animate-float" 
          style={{ 
            animationDelay: "2s",
            transform: `translateY(${parallaxOffset * 0.4}px)`,
          }} 
        />
        <div 
          className="absolute bottom-40 left-[15%] w-3 h-3 bg-accent/40 rounded-full animate-float" 
          style={{ 
            animationDelay: "0.5s",
            transform: `translateY(${parallaxOffset * 0.6}px)`,
          }} 
        />
        <div 
          className="absolute bottom-60 right-[30%] w-4 h-4 bg-white/20 rounded-full blur-sm animate-float" 
          style={{ 
            animationDelay: "1.5s",
            transform: `translateY(${parallaxOffset * 0.35}px)`,
          }} 
        />
        <div 
          className="absolute top-[60%] left-[5%] w-20 h-20 border border-white/10 rounded-full animate-pulse-slow" 
          style={{ 
            transform: `translateY(${parallaxOffset * 0.2}px)`,
          }} 
        />
        <div 
          className="absolute top-[30%] right-[8%] w-32 h-32 border border-white/5 rounded-full" 
          style={{ 
            transform: `translateY(${parallaxOffset * 0.15}px)`,
          }} 
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10 py-24 lg:py-32">
        <div 
          className="max-w-4xl mx-auto text-center space-y-8"
          style={{ transform: `translateY(${parallaxOffset * -0.1}px)` }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium border border-white/20 animate-fade-in">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            Hơn 1000+ themes chất lượng cao
          </div>
          
          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight text-white animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Khám phá{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-white via-accent-foreground to-accent">
                WordPress Themes
              </span>
              <span className="absolute -bottom-2 left-0 w-full h-3 bg-accent/30 rounded-full blur-sm" />
            </span>{" "}
            <br className="hidden md:block" />
            tốt nhất Việt Nam
          </h1>
          
          {/* Description */}
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Thư viện themes WordPress cao cấp với thiết kế hiện đại, tối ưu SEO và hỗ trợ kỹ thuật 24/7. Bắt đầu xây dựng website của bạn ngay hôm nay.
          </p>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Tìm kiếm themes..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-white/95 backdrop-blur-sm border-0 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/50 transition-all shadow-xl"
              />
            </div>
            <Button variant="hero" size="xl" className="h-14 px-8 bg-accent hover:bg-accent/90 text-accent-foreground shadow-xl shadow-accent/30">
              Tìm kiếm
            </Button>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Button variant="outline" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm">
              <Play className="mr-2 h-4 w-4" />
              Xem video giới thiệu
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 pt-8 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <div className="text-center group">
              <div className="text-3xl md:text-4xl font-bold text-white group-hover:scale-110 transition-transform">1000+</div>
              <div className="text-sm text-white/70">Premium Themes</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl md:text-4xl font-bold text-white group-hover:scale-110 transition-transform">50K+</div>
              <div className="text-sm text-white/70">Khách hàng hài lòng</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl md:text-4xl font-bold text-white group-hover:scale-110 transition-transform">4.9★</div>
              <div className="text-sm text-white/70">Đánh giá trung bình</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl md:text-4xl font-bold text-white group-hover:scale-110 transition-transform">24/7</div>
              <div className="text-sm text-white/70">Hỗ trợ kỹ thuật</div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider at bottom */}
      <WaveDivider direction="down" className="absolute bottom-0 left-0 right-0 z-10" />
    </section>
  );
};

export default Hero;
