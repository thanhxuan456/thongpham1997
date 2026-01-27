import { useEffect, useState, RefObject } from "react";

interface UseParallaxOptions {
  speed?: number;
  direction?: "vertical" | "horizontal";
  reverse?: boolean;
}

export const useParallax = (speed: number = 0.5) => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.scrollY * speed);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return offset;
};

// Advanced parallax hook with more options
export const useAdvancedParallax = (options: UseParallaxOptions = {}) => {
  const { speed = 0.5, direction = "vertical", reverse = false } = options;
  const [transform, setTransform] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const value = scrollY * speed * (reverse ? -1 : 1);
      
      if (direction === "vertical") {
        setTransform({ x: 0, y: value });
      } else {
        setTransform({ x: value, y: 0 });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed, direction, reverse]);

  return transform;
};

// Hook for element-based parallax (relative to element position)
export const useElementParallax = (
  ref: RefObject<HTMLElement>,
  speed: number = 0.3
) => {
  const [offset, setOffset] = useState(0);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Check if element is in viewport
      const inView = rect.top < windowHeight && rect.bottom > 0;
      setIsInView(inView);
      
      if (inView) {
        // Calculate offset based on element position
        const elementCenter = rect.top + rect.height / 2;
        const viewportCenter = windowHeight / 2;
        const distance = elementCenter - viewportCenter;
        setOffset(distance * speed);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [ref, speed]);

  return { offset, isInView };
};

// Mouse parallax effect
export const useMouseParallax = (speed: number = 0.02) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      setPosition({
        x: (e.clientX - centerX) * speed,
        y: (e.clientY - centerY) * speed,
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [speed]);

  return position;
};
