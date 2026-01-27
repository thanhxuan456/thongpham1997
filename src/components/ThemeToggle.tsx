import { Sun, Moon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    toggleTheme();
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className="relative overflow-hidden rounded-xl group"
      aria-label="Toggle theme"
    >
      {/* Background glow effect */}
      <div 
        className={`absolute inset-0 transition-all duration-500 ${
          theme === "dark" 
            ? "bg-gradient-to-br from-indigo-500/20 to-purple-600/20" 
            : "bg-gradient-to-br from-amber-500/20 to-orange-500/20"
        } opacity-0 group-hover:opacity-100`}
      />
      
      {/* Sparkle effects */}
      {isAnimating && (
        <>
          <Sparkles className="absolute h-3 w-3 text-accent animate-ping top-0 left-1" />
          <Sparkles className="absolute h-3 w-3 text-primary animate-ping bottom-0 right-1 animation-delay-100" />
          <Sparkles className="absolute h-2 w-2 text-accent animate-ping top-1 right-0 animation-delay-200" />
        </>
      )}
      
      {/* Icon container with rotation animation */}
      <div className="relative w-5 h-5">
        {/* Sun icon */}
        <Sun 
          className={`h-5 w-5 absolute inset-0 transition-all duration-500 ease-spring ${
            theme === "dark" 
              ? "rotate-180 scale-0 opacity-0" 
              : "rotate-0 scale-100 opacity-100"
          }`}
          style={{
            filter: theme === "light" ? "drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))" : "none"
          }}
        />
        
        {/* Moon icon */}
        <Moon 
          className={`h-5 w-5 absolute inset-0 transition-all duration-500 ease-spring ${
            theme === "dark" 
              ? "rotate-0 scale-100 opacity-100" 
              : "-rotate-180 scale-0 opacity-0"
          }`}
          style={{
            filter: theme === "dark" ? "drop-shadow(0 0 8px rgba(139, 92, 246, 0.6))" : "none"
          }}
        />
      </div>
      
      {/* Ripple effect on click */}
      {isAnimating && (
        <span 
          className={`absolute inset-0 rounded-xl animate-ping-once ${
            theme === "dark" ? "bg-indigo-400/30" : "bg-amber-400/30"
          }`}
        />
      )}
    </Button>
  );
};

export default ThemeToggle;
