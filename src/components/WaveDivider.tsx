interface WaveDividerProps {
  direction?: "up" | "down";
  className?: string;
  fillClassName?: string;
}

const WaveDivider = ({ direction = "down", className = "", fillClassName = "fill-background" }: WaveDividerProps) => {
  // Wave down: curves pointing downward (hero bottom going into content)
  // Wave up: curves pointing upward (content going into footer)
  
  if (direction === "down") {
    return (
      <div className={`w-full overflow-hidden leading-none ${className}`}>
        <svg
          className="relative block w-full h-[60px] md:h-[100px]"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.1,118.92,156.63,69.08,321.39,56.44Z"
            className={fillClassName}
          />
        </svg>
      </div>
    );
  }

  // Wave up for footer
  return (
    <div className={`w-full overflow-hidden leading-none ${className}`}>
      <svg
        className="relative block w-full h-[60px] md:h-[100px]"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V120H0Z"
          className={fillClassName}
        />
      </svg>
    </div>
  );
};

export default WaveDivider;
