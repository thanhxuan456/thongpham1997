import { ShoppingCart, Search, Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

interface HeaderProps {
  onCartClick: () => void;
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

const Header = ({ onCartClick, onSearch, searchQuery = "" }: HeaderProps) => {
  const { getTotalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(localSearchQuery);
    }
    // Scroll to themes section
    const themesSection = document.getElementById("themes-section");
    if (themesSection) {
      themesSection.scrollIntoView({ behavior: "smooth" });
    }
    setSearchOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
    if (e.key === "Escape") {
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">W</span>
            </div>
            <span className="font-bold text-xl text-foreground">ThemeVN</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Trang chủ
            </Link>
            <a 
              href="#themes-section" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => {
                e.preventDefault();
                navigate("/");
                setTimeout(() => {
                  document.getElementById("themes-section")?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
            >
              Themes
            </a>
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Danh mục
            </Link>
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Hỗ trợ
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search Button & Expandable Input */}
            <div className="relative flex items-center">
              <div
                className={`absolute right-0 flex items-center transition-all duration-300 overflow-hidden ${
                  searchOpen ? "w-64 opacity-100" : "w-0 opacity-0"
                }`}
              >
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={() => {
                    if (!localSearchQuery) {
                      setTimeout(() => setSearchOpen(false), 200);
                    }
                  }}
                  className="w-full h-9 pl-3 pr-8 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {localSearchQuery && (
                  <button
                    onClick={() => {
                      setLocalSearchQuery("");
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex relative z-10"
                onClick={() => {
                  if (searchOpen && localSearchQuery) {
                    handleSearch();
                  } else {
                    setSearchOpen(!searchOpen);
                  }
                }}
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="relative overflow-hidden"
              aria-label="Toggle theme"
            >
              <div className="relative w-5 h-5">
                <Sun 
                  className={`h-5 w-5 absolute inset-0 transition-all duration-300 ${
                    theme === "dark" 
                      ? "rotate-90 scale-0 opacity-0" 
                      : "rotate-0 scale-100 opacity-100"
                  }`} 
                />
                <Moon 
                  className={`h-5 w-5 absolute inset-0 transition-all duration-300 ${
                    theme === "dark" 
                      ? "rotate-0 scale-100 opacity-100" 
                      : "-rotate-90 scale-0 opacity-0"
                  }`} 
                />
              </div>
            </Button>
            
            <Button variant="ghost" size="icon" className="relative" onClick={onCartClick}>
              <ShoppingCart className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 gradient-accent-bg text-accent-foreground text-xs rounded-full flex items-center justify-center font-semibold">
                  {getTotalItems()}
                </span>
              )}
            </Button>

            <Button variant="gradient" className="hidden md:flex">
              Đăng nhập
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Tìm kiếm themes..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full h-10 pl-10 pr-4 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {localSearchQuery && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    onClick={handleSearch}
                  >
                    Tìm
                  </Button>
                )}
              </div>
              
              <Link to="/" className="text-foreground hover:text-primary transition-colors py-2">
                Trang chủ
              </Link>
              <a 
                href="#themes-section"
                className="text-foreground hover:text-primary transition-colors py-2"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  navigate("/");
                  setTimeout(() => {
                    document.getElementById("themes-section")?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
              >
                Themes
              </a>
              <Link to="/" className="text-foreground hover:text-primary transition-colors py-2">
                Danh mục
              </Link>
              <Link to="/" className="text-foreground hover:text-primary transition-colors py-2">
                Hỗ trợ
              </Link>
              <Button variant="gradient" className="mt-2">
                Đăng nhập
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
