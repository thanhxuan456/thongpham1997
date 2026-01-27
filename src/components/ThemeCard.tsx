import { Star, ShoppingCart, Eye, Check, Heart, Sparkles, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Theme } from "@/types/theme";
import { useCart } from "@/contexts/CartContext";
import { useRef, useState } from "react";
import { useElementParallax } from "@/hooks/use-parallax";

interface ThemeCardProps {
  theme: Theme;
  onPreview: (theme: Theme) => void;
  searchQuery?: string;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

// Highlight matching text
const HighlightText = ({ text, query }: { text: string; query?: string }) => {
  if (!query || !query.trim()) {
    return <>{text}</>;
  }

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <mark key={index} className="bg-accent/30 text-foreground rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
};

const ThemeCard = ({ theme, onPreview, searchQuery }: ThemeCardProps) => {
  const { addToCart, isInCart } = useCart();
  const inCart = isInCart(theme.id);
  const cardRef = useRef<HTMLDivElement>(null);
  const { offset, isInView } = useElementParallax(cardRef, 0.03);
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const discount = theme.originalPrice
    ? Math.round(((theme.originalPrice - theme.price) / theme.originalPrice) * 100)
    : 0;

  return (
    <div 
      ref={cardRef}
      className="group relative bg-card rounded-2xl border border-border overflow-hidden transition-all duration-500 hover:-translate-y-3 hover:border-primary/30"
      style={{
        transform: isInView ? `translateY(${offset}px)` : undefined,
        boxShadow: isHovered 
          ? "0 25px 50px -12px rgba(var(--primary), 0.25), 0 0 0 1px rgba(var(--primary), 0.1)" 
          : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient border effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {/* Shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden">
        <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 group-hover:left-full transition-all duration-1000 ease-out" />
      </div>

      {/* Image container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={theme.image}
          alt={theme.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
        
        {/* Actions overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => onPreview(theme)}
            className="gap-2 backdrop-blur-md bg-background/95 hover:bg-background text-foreground shadow-xl border border-border/50 dark:bg-background/90 dark:hover:bg-background dark:border-border"
          >
            <Eye className="h-4 w-4" />
            Xem trước
          </Button>
        </div>

        {/* Like button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className={`absolute top-3 right-14 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
            isLiked 
              ? "bg-red-500 text-white scale-110" 
              : "bg-card/90 backdrop-blur-sm text-muted-foreground hover:text-red-500 hover:bg-card"
          }`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
        </button>

        {/* Badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 gradient-accent-bg text-accent-foreground text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg animate-pulse">
            <Sparkles className="h-3 w-3" />
            -{discount}%
          </div>
        )}

        {/* Category */}
        <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm text-foreground text-xs font-medium px-3 py-1.5 rounded-full shadow-md">
          <HighlightText text={theme.category} query={searchQuery} />
        </div>

        {/* Downloads indicator */}
        <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm text-muted-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Download className="h-3 w-3" />
          {theme.sales}+
        </div>
      </div>

      {/* Content */}
      <div className="relative p-5 space-y-4">
        {/* Header */}
        <div>
          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-1">
            <HighlightText text={theme.name} query={searchQuery} />
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2 group-hover:text-muted-foreground/80 transition-colors">
            <HighlightText text={theme.description} query={searchQuery} />
          </p>
        </div>

        {/* Rating & Author */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-3.5 w-3.5 ${
                    i < Math.floor(theme.rating) 
                      ? "fill-amber-400 text-amber-400" 
                      : "fill-muted text-muted"
                  }`} 
                />
              ))}
            </div>
            <span className="font-medium text-foreground">{theme.rating}</span>
            <span className="text-muted-foreground">({theme.sales})</span>
          </div>
          <span className="text-muted-foreground text-xs">
            bởi <span className="text-primary font-medium"><HighlightText text={theme.author} query={searchQuery} /></span>
          </span>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1.5">
          {theme.features.slice(0, 3).map((feature, index) => (
            <span
              key={feature}
              className={`text-xs px-2.5 py-1 rounded-full transition-all duration-300 ${
                index === 0 
                  ? "bg-primary/10 text-primary" 
                  : "bg-secondary text-secondary-foreground"
              } group-hover:scale-105`}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <HighlightText text={feature} query={searchQuery} />
            </span>
          ))}
          {theme.features.length > 3 && (
            <span className="text-xs px-2 py-1 text-muted-foreground">
              +{theme.features.length - 3}
            </span>
          )}
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50 group-hover:border-primary/20 transition-colors">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {formatPrice(theme.price)}
              </span>
              {theme.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(theme.originalPrice)}
                </span>
              )}
            </div>
          </div>
          
          <Button
            variant={inCart ? "secondary" : "gradient"}
            size="sm"
            onClick={() => addToCart(theme)}
            disabled={inCart}
            className={`gap-2 transition-all duration-300 ${
              !inCart && "hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
            }`}
          >
            {inCart ? (
              <>
                <Check className="h-4 w-4" />
                Đã thêm
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                Mua ngay
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ThemeCard;
