import { Link } from "react-router-dom";
import { Sun, Moon, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { memo } from "react";

const AuthHeader = memo(() => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <span className="text-primary-foreground font-bold text-lg">T</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-xl text-foreground">ThemeVN</span>
              <span className="text-xs text-muted-foreground block -mt-0.5">Premium Themes</span>
            </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Home Link */}
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-xl bg-card/30 backdrop-blur-sm hover:bg-card/50">
                <Home className="h-5 w-5" />
              </Button>
            </Link>

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="relative overflow-hidden rounded-xl bg-card/30 backdrop-blur-sm hover:bg-card/50"
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
          </div>
        </div>
      </div>
    </header>
  );
});

AuthHeader.displayName = "AuthHeader";

export default AuthHeader;
