import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Monitor, Tablet, Smartphone, ExternalLink, ShoppingCart, Check, RotateCcw, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { themes } from "@/data/themes";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";

type DeviceType = "desktop" | "tablet" | "mobile";

const deviceSizes: Record<DeviceType, { width: string; label: string }> = {
  desktop: { width: "100%", label: "Desktop" },
  tablet: { width: "768px", label: "Tablet" },
  mobile: { width: "375px", label: "Mobile" },
};

const ThemePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

  const theme = themes.find((t) => t.id === id);

  useEffect(() => {
    // Simulate guest session tracking
    const sessionId = sessionStorage.getItem("guest_session") || `guest_${Date.now()}`;
    sessionStorage.setItem("guest_session", sessionId);
    
    // Track theme view
    const viewedThemes = JSON.parse(sessionStorage.getItem("viewed_themes") || "[]");
    if (id && !viewedThemes.includes(id)) {
      viewedThemes.push(id);
      sessionStorage.setItem("viewed_themes", JSON.stringify(viewedThemes));
    }
  }, [id]);

  if (!theme) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Theme không tồn tại</h1>
          <Button variant="gradient" onClick={() => navigate("/")}>
            Quay về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  const inCart = isInCart(theme.id);

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: theme.name,
        text: `Xem preview theme ${theme.name} tại ThemeVN`,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Đã copy link",
        description: "Link preview đã được copy vào clipboard",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Quay lại</span>
          </Button>
          
          <div className="hidden sm:block h-6 w-px bg-border" />
          
          <div className="hidden sm:block">
            <div className="font-semibold text-foreground">{theme.name}</div>
            <div className="text-xs text-muted-foreground">{theme.category} • {theme.author}</div>
          </div>
        </div>

        {/* Device Selector */}
        <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
          {(Object.keys(deviceSizes) as DeviceType[]).map((d) => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all text-sm ${
                device === d
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {d === "desktop" && <Monitor className="h-4 w-4" />}
              {d === "tablet" && <Tablet className="h-4 w-4" />}
              {d === "mobile" && <Smartphone className="h-4 w-4" />}
              <span className="hidden md:inline">{deviceSizes[d].label}</span>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            title="Refresh"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            title="Share"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          {theme.demoUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(theme.demoUrl, "_blank")}
              className="hidden sm:flex gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Mở tab mới
            </Button>
          )}
          <Button
            variant={inCart ? "secondary" : "gradient"}
            size="sm"
            onClick={() => addToCart(theme)}
            disabled={inCart}
            className="gap-2"
          >
            {inCart ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
            <span className="hidden sm:inline">{inCart ? "Đã thêm" : formatPrice(theme.price)}</span>
          </Button>
        </div>
      </header>

      {/* Preview Area */}
      <div className="flex-1 bg-muted overflow-hidden">
        <div className="h-full flex items-start justify-center p-4 overflow-auto">
          <div
            className={`bg-card rounded-lg shadow-2xl overflow-hidden transition-all duration-300 h-[calc(100vh-120px)] ${
              device !== "desktop" ? "border border-border" : ""
            }`}
            style={{
              width: deviceSizes[device].width,
              maxWidth: "100%",
            }}
          >
            {/* Loading state */}
            {isLoading && (
              <div className="absolute inset-0 bg-card flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Đang tải preview...</p>
                </div>
              </div>
            )}
            
            {theme.demoUrl ? (
              <iframe
                key={iframeKey}
                src={theme.demoUrl}
                className="w-full h-full border-0"
                title={`Preview ${theme.name}`}
                onLoad={() => setIsLoading(false)}
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-secondary">
                <div className="text-center p-8">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Monitor className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Preview chưa khả dụng
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Theme này chưa có demo trực tiếp. Vui lòng liên hệ hỗ trợ.
                  </p>
                  <Button variant="outline" onClick={() => navigate("/support")}>
                    Liên hệ hỗ trợ
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="h-12 bg-card border-t border-border flex items-center justify-center px-4 flex-shrink-0">
        <p className="text-sm text-muted-foreground">
          💡 Bạn đang xem preview của <span className="font-medium text-foreground">{theme.name}</span>. 
          Trải nghiệm đầy đủ tính năng sau khi mua theme.
        </p>
      </div>
    </div>
  );
};

export default ThemePreview;
