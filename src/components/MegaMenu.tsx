import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ChevronDown, 
  ShoppingBag, 
  Palette, 
  Newspaper, 
  Building2, 
  UtensilsCrossed, 
  Rocket, 
  Hotel,
  Star,
  TrendingUp,
  Sparkles,
  ArrowRight,
  FileText,
  Shield,
  CreditCard,
  RotateCcw
} from "lucide-react";
import { categories, themes } from "@/data/themes";

interface MegaMenuProps {
  className?: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  "E-Commerce": <ShoppingBag className="h-5 w-5" />,
  "Portfolio": <Palette className="h-5 w-5" />,
  "Blog": <Newspaper className="h-5 w-5" />,
  "Business": <Building2 className="h-5 w-5" />,
  "Restaurant": <UtensilsCrossed className="h-5 w-5" />,
  "Landing Page": <Rocket className="h-5 w-5" />,
  "Hotel & Resort": <Hotel className="h-5 w-5" />,
};

const MegaMenu = ({ className = "" }: MegaMenuProps) => {
  const [themesOpen, setThemesOpen] = useState(false);
  const [policiesOpen, setPoliciesOpen] = useState(false);
  const themesTimeoutRef = useRef<NodeJS.Timeout>();
  const policiesTimeoutRef = useRef<NodeJS.Timeout>();
  const navigate = useNavigate();

  // Get featured themes (top rated)
  const featuredThemes = themes
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  const handleThemesMouseEnter = () => {
    if (themesTimeoutRef.current) {
      clearTimeout(themesTimeoutRef.current);
    }
    setThemesOpen(true);
  };

  const handleThemesMouseLeave = () => {
    themesTimeoutRef.current = setTimeout(() => {
      setThemesOpen(false);
    }, 150);
  };

  const handlePoliciesMouseEnter = () => {
    if (policiesTimeoutRef.current) {
      clearTimeout(policiesTimeoutRef.current);
    }
    setPoliciesOpen(true);
  };

  const handlePoliciesMouseLeave = () => {
    policiesTimeoutRef.current = setTimeout(() => {
      setPoliciesOpen(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (themesTimeoutRef.current) clearTimeout(themesTimeoutRef.current);
      if (policiesTimeoutRef.current) clearTimeout(policiesTimeoutRef.current);
    };
  }, []);

  const navigateToCategory = (category: string) => {
    setThemesOpen(false);
    navigate(`/?category=${encodeURIComponent(category)}`);
    setTimeout(() => {
      document.getElementById("themes-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Themes Mega Menu */}
      <div
        className="relative"
        onMouseEnter={handleThemesMouseEnter}
        onMouseLeave={handleThemesMouseLeave}
      >
        <button
          className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
            themesOpen 
              ? "text-primary bg-primary/10" 
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Themes
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${themesOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Mega Menu Dropdown */}
        {themesOpen && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[800px] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-fade-in z-50">
            <div className="grid grid-cols-12 gap-0">
              {/* Categories Column */}
              <div className="col-span-4 bg-secondary/30 p-6">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Danh mục
                </h3>
                <div className="space-y-1">
                  {categories.filter(c => c !== "Tất cả").map((category) => (
                    <button
                      key={category}
                      onClick={() => navigateToCategory(category)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-foreground hover:bg-primary/10 hover:text-primary transition-colors group"
                    >
                      <span className="w-9 h-9 bg-card rounded-lg flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                        {categoryIcons[category] || <Sparkles className="h-5 w-5" />}
                      </span>
                      <div>
                        <div className="font-medium text-sm">{category}</div>
                        <div className="text-xs text-muted-foreground">
                          {themes.filter(t => t.category === category).length} themes
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Featured Themes Column */}
              <div className="col-span-5 p-6 border-l border-border">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Themes nổi bật
                </h3>
                <div className="space-y-3">
                  {featuredThemes.map((theme) => (
                    <Link
                      key={theme.id}
                      to={`/preview/${theme.id}`}
                      onClick={() => setThemesOpen(false)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary transition-colors group"
                    >
                      <img
                        src={theme.image}
                        alt={theme.name}
                        className="w-16 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                          {theme.name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                            {theme.rating}
                          </span>
                          <span>•</span>
                          <span>{theme.sales.toLocaleString()} sales</span>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-primary">
                        {(theme.price / 1000).toFixed(0)}K
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Promo Column */}
              <div className="col-span-3 p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-l border-border">
                <div className="h-full flex flex-col">
                  <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center mb-4">
                    <Sparkles className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">Giảm 25%</h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">
                    Áp dụng mã THEMEVN25 cho đơn hàng đầu tiên
                  </p>
                  <button
                    onClick={() => {
                      setThemesOpen(false);
                      navigate("/");
                      setTimeout(() => {
                        document.getElementById("themes-section")?.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                    }}
                    className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    Khám phá ngay
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Policies Dropdown */}
      <div
        className="relative"
        onMouseEnter={handlePoliciesMouseEnter}
        onMouseLeave={handlePoliciesMouseLeave}
      >
        <button
          className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
            policiesOpen 
              ? "text-primary bg-primary/10" 
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <FileText className="h-4 w-4" />
          Chính sách
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${policiesOpen ? "rotate-180" : ""}`} />
        </button>

        {policiesOpen && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-card rounded-xl shadow-xl border border-border overflow-hidden animate-fade-in z-50">
            <div className="p-2">
              <Link
                to="/policy?tab=terms"
                onClick={() => setPoliciesOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors group"
              >
                <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                <span className="text-sm font-medium text-foreground">Điều khoản sử dụng</span>
              </Link>
              <Link
                to="/policy?tab=privacy"
                onClick={() => setPoliciesOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors group"
              >
                <Shield className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                <span className="text-sm font-medium text-foreground">Chính sách bảo mật</span>
              </Link>
              <Link
                to="/policy?tab=payment"
                onClick={() => setPoliciesOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors group"
              >
                <CreditCard className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                <span className="text-sm font-medium text-foreground">Phương thức thanh toán</span>
              </Link>
              <Link
                to="/policy?tab=refund"
                onClick={() => setPoliciesOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors group"
              >
                <RotateCcw className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                <span className="text-sm font-medium text-foreground">Chính sách hoàn tiền</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MegaMenu;
