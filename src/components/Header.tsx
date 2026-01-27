import { ShoppingCart, Search, Menu, X, Sun, Moon, Home, Info, HeadphonesIcon, Newspaper, User, LogOut, Shield, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import MegaMenu from "./MegaMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onCartClick?: () => void;
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

const Header = ({ onCartClick, onSearch, searchQuery = "" }: HeaderProps) => {
  const { getTotalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [scrolled, setScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(localSearchQuery);
    }
    if (location.pathname !== "/") {
      navigate(`/?search=${encodeURIComponent(localSearchQuery)}`);
    } else {
      const themesSection = document.getElementById("themes-section");
      if (themesSection) {
        themesSection.scrollIntoView({ behavior: "smooth" });
      }
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

  const navLinks = [
    { to: "/", label: "Trang chủ", icon: Home },
    { to: "/about", label: "Giới thiệu", icon: Info },
    { to: "/support", label: "Hỗ trợ", icon: HeadphonesIcon },
    { to: "/blog", label: "Blog", icon: Newspaper },
  ];

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-card/95 backdrop-blur-xl shadow-lg border-b border-border" 
          : "bg-card/80 backdrop-blur-lg border-b border-border/50"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <span className="text-primary-foreground font-bold text-lg">W</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-xl text-foreground">ThemeVN</span>
              <span className="text-xs text-muted-foreground block -mt-0.5">Premium Themes</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  location.pathname === link.to
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
            
            {/* Mega Menu */}
            <MegaMenu />
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
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
                className="hidden md:flex relative z-10 rounded-xl"
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
              className="relative overflow-hidden rounded-xl"
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
            
            {/* Cart */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative rounded-xl" 
              onClick={onCartClick}
            >
              <ShoppingCart className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 gradient-accent-bg text-accent-foreground text-xs rounded-full flex items-center justify-center font-bold animate-scale-in">
                  {getTotalItems()}
                </span>
              )}
            </Button>

            {/* Login/User Button */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden md:flex rounded-xl">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <Download className="h-4 w-4 mr-2" />
                      Tài khoản & Downloads
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer">
                          <Shield className="h-4 w-4 mr-2" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-destructive cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="gradient" size="sm" className="hidden md:flex rounded-xl shadow-lg shadow-primary/20">
                  Đăng nhập
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-xl"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-2">
              {/* Mobile Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Tìm kiếm themes..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full h-12 pl-10 pr-4 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
              
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-colors ${
                    location.pathname === link.to
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}
              
              {/* Themes */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/");
                  setTimeout(() => {
                    document.getElementById("themes-section")?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                className="flex items-center gap-3 py-3 px-4 rounded-xl text-foreground hover:bg-secondary text-left"
              >
                <span className="text-lg">🎨</span>
                Xem tất cả Themes
              </button>
              
              <Link
                to="/policy"
                className="flex items-center gap-3 py-3 px-4 rounded-xl text-foreground hover:bg-secondary"
              >
                <span className="text-lg">📋</span>
                Chính sách
              </Link>

              {user ? (
                <Button 
                  variant="outline" 
                  className="mt-4 h-12 rounded-xl text-destructive border-destructive/30"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Đăng xuất
                </Button>
              ) : (
                <Link to="/auth">
                  <Button variant="gradient" className="mt-4 h-12 rounded-xl w-full">
                    Đăng nhập
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
