import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FilterBar from "@/components/FilterBar";
import ThemeCard from "@/components/ThemeCard";
import ThemePreviewModal from "@/components/ThemePreviewModal";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import CouponBanner from "@/components/CouponBanner";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import { themes, categories } from "@/data/themes";
import { Theme } from "@/types/theme";
import { Sparkles, Zap, Shield, HeadphonesIcon } from "lucide-react";

// Calculate max price from themes
const maxPrice = Math.max(...themes.map((t) => t.price));

const Index = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const themesSectionRef = useRef<HTMLElement>(null);

  // Handle URL params for category
  useEffect(() => {
    const category = searchParams.get("category");
    if (category && categories.includes(category)) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  // Coupon end date - 3 days from now
  const couponEndDate = new Date();
  couponEndDate.setDate(couponEndDate.getDate() + 3);

  const filteredThemes = useMemo(() => {
    return themes.filter((theme) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        query === "" ||
        theme.name.toLowerCase().includes(query) ||
        theme.description.toLowerCase().includes(query) ||
        theme.category.toLowerCase().includes(query) ||
        theme.features.some((f) => f.toLowerCase().includes(query)) ||
        theme.author.toLowerCase().includes(query);
      const matchesCategory =
        selectedCategory === "Tất cả" || theme.category === selectedCategory;
      const matchesPrice =
        theme.price >= priceRange[0] && theme.price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [searchQuery, selectedCategory, priceRange]);

  const scrollToThemes = useCallback(() => {
    setTimeout(() => {
      themesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, []);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      setSelectedCategory("Tất cả");
    }
    scrollToThemes();
  }, [searchQuery, scrollToThemes]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    if (category !== "Tất cả") {
      setSearchQuery("");
    }
  }, []);

  const features = [
    { icon: Sparkles, title: "Thiết kế chuyên nghiệp", desc: "Themes được thiết kế bởi đội ngũ chuyên gia với tiêu chuẩn cao nhất." },
    { icon: Zap, title: "Tối ưu tốc độ", desc: "Themes được tối ưu hóa để đạt điểm PageSpeed cao nhất và SEO tốt nhất." },
    { icon: Shield, title: "Bảo mật cao", desc: "Code sạch, tuân thủ chuẩn WordPress và được cập nhật thường xuyên." },
    { icon: HeadphonesIcon, title: "Hỗ trợ 24/7", desc: "Đội ngũ hỗ trợ kỹ thuật luôn sẵn sàng giúp đỡ bạn bất cứ lúc nào." },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Coupon Banner */}
      <CouponBanner
        couponCode="THEMEVN25"
        discountText="🔥 Ưu đãi đặc biệt: Giảm 25% cho tất cả themes!"
        endDate={couponEndDate}
      />

      <Header 
        onCartClick={() => setCartOpen(true)} 
        onSearch={handleSearchChange}
        searchQuery={searchQuery}
      />
      
      <main>
        {/* Hero Section */}
        <Hero 
          searchQuery={searchQuery} 
          onSearchChange={handleSearchChange}
          onSearch={handleSearch}
        />

        {/* Featured Carousel */}
        <FeaturedCarousel onPreview={setPreviewTheme} />

        {/* Features Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 to-background" />
          <div className="absolute top-20 left-[10%] w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-[10%] w-80 h-80 bg-accent/5 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection animation="fade-up" className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
                Tại sao chọn chúng tôi?
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Trải nghiệm <span className="gradient-text">tốt nhất</span> cho bạn
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Chúng tôi cam kết mang đến những giá trị tốt nhất cho khách hàng
              </p>
            </AnimatedSection>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <AnimatedSection key={feature.title} animation="fade-up" delay={index * 100}>
                  <div className="bg-card p-6 rounded-2xl card-shadow text-center group hover:card-shadow-hover transition-all duration-300 hover:-translate-y-2 border border-border/50">
                    <div className="w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/20">
                      <feature.icon className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.desc}
                    </p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Themes Section */}
        <section id="themes-section" ref={themesSectionRef} className="py-16 scroll-mt-20">
          <div className="container mx-auto px-4">
            {/* Section Header */}
            <AnimatedSection animation="fade-up" className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 rounded-full text-accent text-sm font-medium mb-4">
                🎨 Bộ sưu tập themes
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                WordPress Themes <span className="gradient-text">nổi bật</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Khám phá bộ sưu tập themes được tuyển chọn kỹ lưỡng, thiết kế chuyên nghiệp và tối ưu hiệu suất.
              </p>
            </AnimatedSection>

            {/* Enhanced Filter Bar */}
            <AnimatedSection animation="fade-up" delay={100} className="mb-10">
              <FilterBar
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
                maxPrice={maxPrice}
                themesCount={filteredThemes.length}
              />
            </AnimatedSection>

            {/* Themes Grid */}
            {filteredThemes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredThemes.map((theme, index) => (
                  <AnimatedSection
                    key={theme.id}
                    animation="fade-up"
                    delay={Math.min(index * 100, 500)}
                  >
                    <ThemeCard
                      theme={theme}
                      onPreview={setPreviewTheme}
                      searchQuery={searchQuery}
                    />
                  </AnimatedSection>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-5xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Không tìm thấy theme nào
                </h3>
                <p className="text-muted-foreground mb-6">
                  Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("Tất cả");
                  }}
                  className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                >
                  Xem tất cả themes
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-primary via-primary to-accent rounded-3xl p-8 md:p-12 relative overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-40 h-40 border border-white/20 rounded-full" />
                <div className="absolute bottom-0 right-0 w-60 h-60 border border-white/20 rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-white/10 rounded-full" />
              </div>

              <div className="relative z-10">
                <AnimatedSection animation="fade-up" className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Được tin dùng bởi hàng nghìn khách hàng
                  </h2>
                  <p className="text-white/70 max-w-xl mx-auto">
                    Hãy tham gia cùng cộng đồng những người đã thành công với ThemeVN
                  </p>
                </AnimatedSection>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[
                    { value: "1000+", label: "Premium Themes" },
                    { value: "50K+", label: "Khách hàng" },
                    { value: "99%", label: "Hài lòng" },
                    { value: "24/7", label: "Hỗ trợ" },
                  ].map((stat, index) => (
                    <AnimatedSection key={stat.label} animation="zoom" delay={index * 100} className="text-center">
                      <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                      <div className="text-white/70">{stat.label}</div>
                    </AnimatedSection>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Modals */}
      <ThemePreviewModal
        theme={previewTheme}
        isOpen={!!previewTheme}
        onClose={() => setPreviewTheme(null)}
      />

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export default Index;
