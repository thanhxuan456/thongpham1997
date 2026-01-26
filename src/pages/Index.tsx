import { useState, useMemo, useRef, useCallback } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryFilter from "@/components/CategoryFilter";
import ThemeCard from "@/components/ThemeCard";
import ThemePreviewModal from "@/components/ThemePreviewModal";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import CouponBanner from "@/components/CouponBanner";
import { themes, categories } from "@/data/themes";
import { Theme } from "@/types/theme";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const themesSectionRef = useRef<HTMLElement>(null);

  // Coupon end date - 3 days from now
  const couponEndDate = new Date();
  couponEndDate.setDate(couponEndDate.getDate() + 3);

  const filteredThemes = useMemo(() => {
    return themes.filter((theme) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = query === "" ||
        theme.name.toLowerCase().includes(query) ||
        theme.description.toLowerCase().includes(query) ||
        theme.category.toLowerCase().includes(query) ||
        theme.features.some(f => f.toLowerCase().includes(query)) ||
        theme.author.toLowerCase().includes(query);
      const matchesCategory =
        selectedCategory === "Tất cả" || theme.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const scrollToThemes = useCallback(() => {
    setTimeout(() => {
      themesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, []);

  const handleSearch = useCallback(() => {
    // Reset category when searching
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
    // Clear search when selecting category
    if (category !== "Tất cả") {
      setSearchQuery("");
    }
  }, []);

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

        {/* Themes Section */}
        <section id="themes-section" ref={themesSectionRef} className="py-16 pt-24 scroll-mt-20">
          <div className="container mx-auto px-4">
            {/* Section Header */}
            <AnimatedSection animation="fade-up" className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                WordPress Themes <span className="gradient-text">nổi bật</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Khám phá bộ sưu tập themes được tuyển chọn kỹ lưỡng, thiết kế chuyên nghiệp và tối ưu hiệu suất.
              </p>
            </AnimatedSection>

            {/* Search Results Info */}
            {searchQuery && (
              <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                <p className="text-muted-foreground">
                  Tìm thấy <span className="font-semibold text-foreground">{filteredThemes.length}</span> kết quả 
                  cho "<span className="font-semibold text-primary">{searchQuery}</span>"
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("Tất cả");
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Xóa tìm kiếm
                </button>
              </div>
            )}

            {/* Category Filter */}
            <AnimatedSection animation="fade-up" delay={100} className="mb-10">
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
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
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🔍</span>
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
                  className="text-primary hover:underline font-medium"
                >
                  Xem tất cả themes
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gradient-to-b from-secondary/30 to-background relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-[10%] w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-[10%] w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection animation="fade-up" className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Tại sao chọn <span className="gradient-text">ThemeVN?</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Chúng tôi cam kết mang đến những giá trị tốt nhất cho khách hàng
              </p>
            </AnimatedSection>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <AnimatedSection animation="fade-up" delay={0}>
                <div className="bg-card p-8 rounded-2xl card-shadow text-center group hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1">
                  <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl">🎨</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    Thiết kế chuyên nghiệp
                  </h3>
                  <p className="text-muted-foreground">
                    Tất cả themes được thiết kế bởi đội ngũ chuyên gia với tiêu chuẩn cao nhất.
                  </p>
                </div>
              </AnimatedSection>
              
              <AnimatedSection animation="fade-up" delay={150}>
                <div className="bg-card p-8 rounded-2xl card-shadow text-center group hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1">
                  <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl">🚀</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    Tối ưu tốc độ
                  </h3>
                  <p className="text-muted-foreground">
                    Themes được tối ưu hóa để đạt điểm PageSpeed cao nhất và SEO tốt nhất.
                  </p>
                </div>
              </AnimatedSection>
              
              <AnimatedSection animation="fade-up" delay={300}>
                <div className="bg-card p-8 rounded-2xl card-shadow text-center group hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1">
                  <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl">🛟</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    Hỗ trợ 24/7
                  </h3>
                  <p className="text-muted-foreground">
                    Đội ngũ hỗ trợ kỹ thuật luôn sẵn sàng giúp đỡ bạn bất cứ lúc nào.
                  </p>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-primary via-primary to-accent rounded-3xl p-12 relative overflow-hidden">
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
                </AnimatedSection>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <AnimatedSection animation="zoom" delay={0} className="text-center">
                    <div className="text-4xl md:text-5xl font-bold text-white mb-2">1000+</div>
                    <div className="text-white/70">Premium Themes</div>
                  </AnimatedSection>
                  <AnimatedSection animation="zoom" delay={100} className="text-center">
                    <div className="text-4xl md:text-5xl font-bold text-white mb-2">50K+</div>
                    <div className="text-white/70">Khách hàng</div>
                  </AnimatedSection>
                  <AnimatedSection animation="zoom" delay={200} className="text-center">
                    <div className="text-4xl md:text-5xl font-bold text-white mb-2">99%</div>
                    <div className="text-white/70">Hài lòng</div>
                  </AnimatedSection>
                  <AnimatedSection animation="zoom" delay={300} className="text-center">
                    <div className="text-4xl md:text-5xl font-bold text-white mb-2">24/7</div>
                    <div className="text-white/70">Hỗ trợ</div>
                  </AnimatedSection>
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
