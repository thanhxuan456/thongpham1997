import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <Button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full shadow-lg transition-all duration-300 group
        bg-gradient-to-br from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90
        ${isVisible 
          ? "opacity-100 translate-y-0 pointer-events-auto" 
          : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      size="icon"
      aria-label="Back to top"
    >
      <ArrowUp className="h-5 w-5 text-primary-foreground transition-transform duration-300 group-hover:-translate-y-0.5" />
      
      {/* Animated ring */}
      <span className="absolute inset-0 rounded-full border-2 border-primary-foreground/30 animate-ping opacity-75" />
    </Button>
  );
};

export default BackToTop;
