import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Star, ShoppingCart, ExternalLink, Check, Calendar, Tag, Monitor, Tablet, Smartphone, Maximize2, FileText, Headphones, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Theme } from "@/types/theme";
import { useCart } from "@/contexts/CartContext";

interface ThemePreviewModalProps {
  theme: Theme | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

type DeviceType = "desktop" | "tablet" | "mobile";

const deviceSizes: Record<DeviceType, { width: string; height: string }> = {
  desktop: { width: "100%", height: "100%" },
  tablet: { width: "768px", height: "100%" },
  mobile: { width: "375px", height: "100%" },
};

const ThemePreviewModal = ({ theme, isOpen, onClose }: ThemePreviewModalProps) => {
  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [device, setDevice] = useState<DeviceType>("desktop");

  if (!isOpen || !theme) return null;

  const inCart = isInCart(theme.id);

  const handleFullPreview = () => {
    onClose();
    navigate(`/preview/${theme.id}`);
  };

  if (showLivePreview && theme.demoUrl) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        {/* Preview Header */}
        <div className="h-14 bg-card border-b border-border flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowLivePreview(false)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
              <span className="hidden sm:inline">Đóng Preview</span>
            </button>
            <div className="h-6 w-px bg-border" />
            <span className="font-medium text-foreground">{theme.name}</span>
          </div>

          {/* Device Selector */}
          <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
            <button
              onClick={() => setDevice("desktop")}
              className={`p-2 rounded-md transition-colors ${device === "desktop" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              title="Desktop"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDevice("tablet")}
              className={`p-2 rounded-md transition-colors ${device === "tablet" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              title="Tablet"
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={`p-2 rounded-md transition-colors ${device === "mobile" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              title="Mobile"
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFullPreview}
              className="gap-2"
            >
              <Maximize2 className="h-4 w-4" />
              <span className="hidden sm:inline">Toàn màn hình</span>
            </Button>
            <Button
              variant={inCart ? "secondary" : "gradient"}
              size="sm"
              onClick={() => addToCart(theme)}
              disabled={inCart}
              className="gap-2"
            >
              {inCart ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
              {inCart ? "Đã thêm" : "Mua ngay"}
            </Button>
          </div>
        </div>

        {/* Iframe Container */}
        <div className="h-[calc(100vh-56px)] bg-muted flex items-start justify-center p-4 overflow-auto">
          <div
            className="bg-card rounded-lg shadow-xl overflow-hidden transition-all duration-300"
            style={{
              width: deviceSizes[device].width,
              height: device === "desktop" ? "calc(100vh - 88px)" : "calc(100vh - 88px)",
              maxWidth: "100%",
            }}
          >
            <iframe
              src={theme.demoUrl}
              className="w-full h-full border-0"
              title={`Preview ${theme.name}`}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden card-shadow-hover animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center text-foreground hover:bg-card transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Image */}
          <div className="relative aspect-[4/3] md:aspect-auto md:h-full">
            <img
              src={theme.image}
              alt={theme.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
            
            {/* Preview buttons on image */}
            {theme.demoUrl && (
              <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 gap-2 bg-white/90 backdrop-blur-sm hover:bg-white"
                  onClick={() => setShowLivePreview(true)}
                >
                  <Monitor className="h-4 w-4" />
                  Xem trực tiếp
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2 bg-white/90 backdrop-blur-sm hover:bg-white"
                  onClick={() => window.open(theme.demoUrl, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto max-h-[60vh] md:max-h-[90vh]">
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                    {theme.category}
                  </span>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="font-medium">{theme.rating}</span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-foreground">{theme.name}</h2>
                <p className="text-muted-foreground mt-2">{theme.description}</p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-foreground">
                  {formatPrice(theme.price)}
                </span>
                {theme.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(theme.originalPrice)}
                  </span>
                )}
              </div>

              {/* Support Info */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-secondary rounded-xl">
                  <FileText className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <div className="text-xs text-muted-foreground">Tài liệu</div>
                  <div className="text-sm font-medium text-foreground">Đầy đủ</div>
                </div>
                <div className="text-center p-3 bg-secondary rounded-xl">
                  <RefreshCw className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <div className="text-xs text-muted-foreground">Cập nhật</div>
                  <div className="text-sm font-medium text-foreground">Trọn đời</div>
                </div>
                <div className="text-center p-3 bg-secondary rounded-xl">
                  <Headphones className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <div className="text-xs text-muted-foreground">Hỗ trợ</div>
                  <div className="text-sm font-medium text-foreground">6 tháng</div>
                </div>
              </div>

              {/* Meta info */}
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Cập nhật: {theme.lastUpdated}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  Version: {theme.version}
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Tính năng nổi bật</h3>
                <div className="flex flex-wrap gap-2">
                  {theme.features.map((feature) => (
                    <span
                      key={feature}
                      className="text-sm bg-secondary text-secondary-foreground px-3 py-1.5 rounded-lg"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Compatibility */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Tương thích</h3>
                <ul className="space-y-2">
                  {theme.compatibility.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
                <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">
                    {theme.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-foreground">{theme.author}</div>
                  <div className="text-sm text-muted-foreground">{theme.sales} đã bán</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant={inCart ? "secondary" : "hero"}
                  size="lg"
                  className="flex-1 gap-2"
                  onClick={() => addToCart(theme)}
                  disabled={inCart}
                >
                  {inCart ? (
                    <>
                      <Check className="h-5 w-5" />
                      Đã thêm vào giỏ
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      Thêm vào giỏ
                    </>
                  )}
                </Button>
                {theme.demoUrl && (
                  <Button
                    variant="hero-outline"
                    size="lg"
                    className="gap-2"
                    onClick={() => setShowLivePreview(true)}
                  >
                    <Monitor className="h-5 w-5" />
                    Preview
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemePreviewModal;
