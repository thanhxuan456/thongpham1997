import { Star, ShoppingCart, Eye, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Theme } from "@/types/theme";
import { useCart } from "@/contexts/CartContext";
import { useRef } from "react";
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

  const discount = theme.originalPrice
    ? Math.round(((theme.originalPrice - theme.price) / theme.originalPrice) * 100)
    : 0;

  return (
    <div 
      ref={cardRef}
      className="group bg-card rounded-2xl border border-border overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-2 hover:border-primary/20"
      style={{
        transform: isInView ? `translateY(${offset}px)` : undefined,
      }}
    >
      {/* Image container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={theme.image}
          alt={theme.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => onPreview(theme)}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Xem trước
          </Button>
        </div>

        {/* Badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 gradient-accent-bg text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
            -{discount}%
          </div>
        )}

        {/* Category */}
        <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm text-foreground text-xs font-medium px-3 py-1 rounded-full">
          <HighlightText text={theme.category} query={searchQuery} />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Header */}
        <div>
          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
            <HighlightText text={theme.name} query={searchQuery} />
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            <HighlightText text={theme.description} query={searchQuery} />
          </p>
        </div>

        {/* Rating & Sales */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="font-medium text-foreground">{theme.rating}</span>
            <span className="text-muted-foreground">({theme.sales} bán)</span>
          </div>
          <span className="text-muted-foreground">
            <HighlightText text={theme.author} query={searchQuery} />
          </span>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2">
          {theme.features.slice(0, 3).map((feature) => (
            <span
              key={feature}
              className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md"
            >
              <HighlightText text={feature} query={searchQuery} />
            </span>
          ))}
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-foreground">
              {formatPrice(theme.price)}
            </span>
            {theme.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(theme.originalPrice)}
              </span>
            )}
          </div>
          
          <Button
            variant={inCart ? "secondary" : "gradient"}
            size="sm"
            onClick={() => addToCart(theme)}
            disabled={inCart}
            className="gap-2"
          >
            {inCart ? (
              <>
                <Check className="h-4 w-4" />
                Đã thêm
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                Mua
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ThemeCard;
