import { ReactNode, useRef } from "react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useElementParallax } from "@/hooks/use-parallax";
import { cn } from "@/lib/utils";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  animation?: "fade-up" | "fade-down" | "fade-left" | "fade-right" | "zoom" | "fade";
  delay?: number;
  duration?: number;
  parallax?: boolean;
  parallaxSpeed?: number;
}

const AnimatedSection = ({
  children,
  className = "",
  animation = "fade-up",
  delay = 0,
  duration = 600,
  parallax = false,
  parallaxSpeed = 0.1,
}: AnimatedSectionProps) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const parallaxRef = useRef<HTMLDivElement>(null);
  const { offset } = useElementParallax(parallaxRef, parallaxSpeed);

  const baseStyles = "transition-all ease-out";
  
  const animationStyles = {
    "fade-up": {
      initial: "opacity-0 translate-y-8",
      animate: "opacity-100 translate-y-0",
    },
    "fade-down": {
      initial: "opacity-0 -translate-y-8",
      animate: "opacity-100 translate-y-0",
    },
    "fade-left": {
      initial: "opacity-0 translate-x-8",
      animate: "opacity-100 translate-x-0",
    },
    "fade-right": {
      initial: "opacity-0 -translate-x-8",
      animate: "opacity-100 translate-x-0",
    },
    zoom: {
      initial: "opacity-0 scale-95",
      animate: "opacity-100 scale-100",
    },
    fade: {
      initial: "opacity-0",
      animate: "opacity-100",
    },
  };

  const style = animationStyles[animation];

  const combinedRef = (node: HTMLDivElement | null) => {
    // @ts-ignore - combining refs
    ref.current = node;
    // @ts-ignore
    parallaxRef.current = node;
  };

  return (
    <div
      ref={combinedRef}
      className={cn(
        baseStyles,
        isVisible ? style.animate : style.initial,
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        ...(parallax && isVisible ? { transform: `translateY(${offset}px)` } : {}),
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;
