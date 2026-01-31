import { useState, useEffect } from "react";

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
  minDuration?: number;
}

const LoadingScreen = ({ onLoadingComplete, minDuration = 1500 }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const duration = minDuration;
    let animationId: number;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress < 100) {
        animationId = requestAnimationFrame(updateProgress);
      } else {
        setIsComplete(true);
        setTimeout(() => {
          setIsHiding(true);
          setTimeout(() => {
            onLoadingComplete?.();
          }, 300);
        }, 200);
      }
    };

    animationId = requestAnimationFrame(updateProgress);

    const timeout = setTimeout(() => {
      cancelAnimationFrame(animationId);
      setIsComplete(true);
      setIsHiding(true);
      onLoadingComplete?.();
    }, minDuration + 1000);

    return () => {
      cancelAnimationFrame(animationId);
      clearTimeout(timeout);
    };
  }, [minDuration, onLoadingComplete]);

  if (isHiding) {
    return (
      <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center transition-opacity duration-500 opacity-0 pointer-events-none">
      </div>
    );
  }

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-background flex items-center justify-center transition-opacity duration-500 ${
        isComplete ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-primary/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-accent/5 rounded-full animate-spin" style={{ animationDuration: "20s" }} />
      </div>

      <div className="relative flex flex-col items-center gap-8">
        {/* Logo animation */}
        <div className="relative">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 w-32 h-32 rounded-full border-2 border-transparent border-t-primary border-r-primary/50 animate-spin" style={{ animationDuration: "1s" }} />
          
          {/* Inner rotating ring */}
          <div className="absolute inset-2 w-28 h-28 rounded-full border-2 border-transparent border-b-accent border-l-accent/50 animate-spin" style={{ animationDuration: "1.5s", animationDirection: "reverse" }} />
          
          {/* Logo container */}
          <div className={`w-32 h-32 gradient-bg rounded-full flex items-center justify-center shadow-2xl shadow-primary/30 transition-transform duration-500 ${
            isComplete ? "scale-110" : "scale-100"
          }`}>
            <span className="text-primary-foreground font-bold text-5xl">W</span>
          </div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 w-32 h-32 rounded-full bg-primary/20 blur-xl animate-pulse" />
        </div>

        {/* Brand name */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Theme<span className="gradient-text">VN</span>
          </h1>
          <p className="text-muted-foreground text-sm">Premium WordPress Themes</p>
        </div>

        {/* Progress bar */}
        <div className="w-64 space-y-3">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full gradient-bg rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Progress text */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Đang tải...</span>
            <span className="font-mono">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Loading dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div 
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
