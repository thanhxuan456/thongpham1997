import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroMockup from "@/assets/hero-mockup.jpg";

interface HeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Hero = ({ searchQuery, onSearchChange }: HeroProps) => {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" />
      
      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              Hơn 1000+ themes chất lượng cao
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Khám phá{" "}
              <span className="gradient-text">WordPress Themes</span>{" "}
              tốt nhất Việt Nam
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-lg">
              Thư viện themes WordPress cao cấp với thiết kế hiện đại, tối ưu SEO và hỗ trợ kỹ thuật 24/7. Bắt đầu xây dựng website của bạn ngay hôm nay.
            </p>

            {/* Search bar */}
            <div className="flex gap-4 max-w-xl">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Tìm kiếm themes..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              <Button variant="hero" size="xl">
                Tìm kiếm
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-4">
              <div>
                <div className="text-2xl font-bold text-foreground">1000+</div>
                <div className="text-sm text-muted-foreground">Themes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">50K+</div>
                <div className="text-sm text-muted-foreground">Khách hàng</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">4.9★</div>
                <div className="text-sm text-muted-foreground">Đánh giá</div>
              </div>
            </div>
          </div>

          {/* Right content - Hero image */}
          <div className="relative hidden lg:block animate-float">
            <div className="absolute inset-0 gradient-bg rounded-3xl blur-2xl opacity-20 scale-95" />
            <img
              src={heroMockup}
              alt="WordPress Theme Preview"
              className="relative rounded-3xl card-shadow-hover border border-border/50"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
