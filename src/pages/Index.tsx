import { useState, useMemo } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryFilter from "@/components/CategoryFilter";
import ThemeCard from "@/components/ThemeCard";
import ThemePreviewModal from "@/components/ThemePreviewModal";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { themes, categories } from "@/data/themes";
import { Theme } from "@/types/theme";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  const filteredThemes = useMemo(() => {
    return themes.filter((theme) => {
      const matchesSearch =
        theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        theme.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "Tất cả" || theme.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      <Header onCartClick={() => setCartOpen(true)} />
      
      <main>
        {/* Hero Section */}
        <Hero searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        {/* Themes Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                WordPress Themes <span className="gradient-text">nổi bật</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Khám phá bộ sưu tập themes được tuyển chọn kỹ lưỡng, thiết kế chuyên nghiệp và tối ưu hiệu suất.
              </p>
            </div>

            {/* Category Filter */}
            <div className="mb-10">
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>

            {/* Themes Grid */}
            {filteredThemes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredThemes.map((theme) => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    onPreview={setPreviewTheme}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">
                  Không tìm thấy theme nào phù hợp.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Tại sao chọn <span className="gradient-text">ThemeVN?</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card p-8 rounded-2xl card-shadow text-center">
                <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🎨</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Thiết kế chuyên nghiệp
                </h3>
                <p className="text-muted-foreground">
                  Tất cả themes được thiết kế bởi đội ngũ chuyên gia với tiêu chuẩn cao nhất.
                </p>
              </div>
              
              <div className="bg-card p-8 rounded-2xl card-shadow text-center">
                <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🚀</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Tối ưu tốc độ
                </h3>
                <p className="text-muted-foreground">
                  Themes được tối ưu hóa để đạt điểm PageSpeed cao nhất và SEO tốt nhất.
                </p>
              </div>
              
              <div className="bg-card p-8 rounded-2xl card-shadow text-center">
                <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🛟</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Hỗ trợ 24/7
                </h3>
                <p className="text-muted-foreground">
                  Đội ngũ hỗ trợ kỹ thuật luôn sẵn sàng giúp đỡ bạn bất cứ lúc nào.
                </p>
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
