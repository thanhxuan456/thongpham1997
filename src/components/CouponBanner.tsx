import { useState, useEffect } from "react";
import { X, Gift, Copy, Check } from "lucide-react";

interface CouponBannerProps {
  couponCode: string;
  discountText: string;
  endDate: Date;
}

const CouponBanner = ({ couponCode, discountText, endDate }: CouponBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isVisible) return null;

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 min-w-[40px] text-center">
        <span className="text-white font-bold text-lg tabular-nums">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-[10px] text-white/70 mt-0.5 uppercase">{label}</span>
    </div>
  );

  return (
    <div className="relative bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-[gradient_3s_ease_infinite] overflow-hidden">
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]" />
      
      <div className="container mx-auto px-4 py-2.5 relative">
        <div className="flex items-center justify-center gap-3 md:gap-6 flex-wrap">
          {/* Icon & Text */}
          <div className="flex items-center gap-2 text-white">
            <Gift className="h-4 w-4 animate-bounce" />
            <span className="text-sm font-medium">{discountText}</span>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-1.5">
            <TimeBlock value={timeLeft.days} label="Ngày" />
            <span className="text-white/60 font-bold">:</span>
            <TimeBlock value={timeLeft.hours} label="Giờ" />
            <span className="text-white/60 font-bold">:</span>
            <TimeBlock value={timeLeft.minutes} label="Phút" />
            <span className="text-white/60 font-bold">:</span>
            <TimeBlock value={timeLeft.seconds} label="Giây" />
          </div>

          {/* Coupon Code */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 text-white text-sm font-semibold hover:bg-white/30 transition-all group"
          >
            <span className="tracking-wider">{couponCode}</span>
            {copied ? (
              <Check className="h-4 w-4 text-green-300" />
            ) : (
              <Copy className="h-4 w-4 group-hover:scale-110 transition-transform" />
            )}
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-1"
          aria-label="Đóng"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default CouponBanner;
