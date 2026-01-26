import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Star, Eye, ShoppingCart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { themes } from "@/data/themes";
import { Theme } from "@/types/theme";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";

interface FeaturedCarouselProps {
  onPreview?: (theme: Theme) => void;
}

const FeaturedCarousel = ({ onPreview }: FeaturedCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { addToCart } = useCart();

  // Get featured themes (top rated + best sellers)
  const featuredThemes = themes
    .sort((a, b) => (b.rating * b.sales) - (a.rating * a.sales))
    .slice(0, 5);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % featuredThemes.length);
  }, [featuredThemes.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + featuredThemes.length) % featuredThemes.length);
  }, [featuredThemes.length]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const currentTheme = featuredThemes[currentIndex];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
            <Star className="h-4 w-4 fill-primary" />
            Themes nổi bật
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Best Sellers của <span className="gradient-text">tháng này</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Những theme được yêu thích nhất, được hàng nghìn khách hàng tin tưởng sử dụng.
          </p>
        </div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Main Slide */}
          <div className="relative rounded-3xl overflow-hidden bg-card card-shadow">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Image */}
              <div className="relative aspect-[4/3] lg:aspect-auto overflow-hidden">
                <img
                  src={currentTheme.image}
                  alt={currentTheme.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {currentTheme.originalPrice && (
                    <span className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
                      -{Math.round((1 - currentTheme.price / currentTheme.originalPrice) * 100)}%
                    </span>
                  )}
                  <span className="bg-card/90 backdrop-blur-sm text-foreground text-xs font-medium px-3 py-1 rounded-full">
                    {currentTheme.category}
                  </span>
                </div>

                {/* Rating */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-card/90 backdrop-blur-sm rounded-full px-3 py-1.5">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-medium text-foreground">{currentTheme.rating}</span>
                  <span className="text-sm text-muted-foreground">({currentTheme.sales.toLocaleString()} sales)</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 lg:p-12 flex flex-col">
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-2">
                    by {currentTheme.author}
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                    {currentTheme.name}
                  </h3>
                  <p className="text-muted-foreground mb-6 line-clamp-3">
                    {currentTheme.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {currentTheme.features.slice(0, 4).map((feature) => (
                      <span
                        key={feature}
                        className="px-3 py-1 bg-secondary rounded-full text-sm text-muted-foreground"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Highlights */}
                  {currentTheme.highlights && (
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {currentTheme.highlights.slice(0, 4).map((highlight, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-foreground">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                          {highlight}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price & Actions */}
                <div className="pt-6 border-t border-border">
                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-3xl font-bold text-primary">
                      {formatPrice(currentTheme.price)}
                    </span>
                    {currentTheme.originalPrice && (
                      <span className="text-lg text-muted-foreground line-through">
                        {formatPrice(currentTheme.originalPrice)}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="hero"
                      size="lg"
                      onClick={() => addToCart(currentTheme)}
                      className="flex-1"
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Thêm vào giỏ
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => onPreview?.(currentTheme)}
                    >
                      <Eye className="mr-2 h-5 w-5" />
                      Xem trước
                    </Button>
                    {currentTheme.demoUrl && (
                      <Link
                        to={`/preview/${currentTheme.id}`}
                        className="h-12 w-12 flex items-center justify-center border border-border rounded-xl hover:bg-secondary transition-colors"
                      >
                        <ExternalLink className="h-5 w-5 text-muted-foreground" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-border hover:bg-card transition-colors z-10"
          >
            <ChevronLeft className="h-6 w-6 text-foreground" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-border hover:bg-card transition-colors z-10"
          >
            <ChevronRight className="h-6 w-6 text-foreground" />
          </button>

          {/* Dots Navigation */}
          <div className="flex justify-center gap-2 mt-6">
            {featuredThemes.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>

          {/* Thumbnail Preview */}
          <div className="hidden lg:flex justify-center gap-4 mt-8">
            {featuredThemes.map((theme, index) => (
              <button
                key={theme.id}
                onClick={() => setCurrentIndex(index)}
                className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
                  index === currentIndex
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={theme.image}
                  alt={theme.name}
                  className="w-24 h-16 object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCarousel;
