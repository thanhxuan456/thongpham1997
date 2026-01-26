import { ShoppingCart, Search, Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";
import { Link } from "react-router-dom";

interface HeaderProps {
  onCartClick: () => void;
}

const Header = ({ onCartClick }: HeaderProps) => {
  const { getTotalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Themes
            </Link>
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Danh mục
            </Link>
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Hỗ trợ
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Search className="h-5 w-5" />
            </Button>

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
              <Link to="/" className="text-foreground hover:text-primary transition-colors py-2">
                Trang chủ
              </Link>
              <Link to="/" className="text-foreground hover:text-primary transition-colors py-2">
                Themes
              </Link>
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
