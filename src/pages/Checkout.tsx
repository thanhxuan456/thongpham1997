import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Shield, Check, Lock, Truck, Gift, ChevronRight, Sparkles, Tag, X, Loader2, QrCode, Copy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import AnimatedSection from "@/components/AnimatedSection";
import WaveDivider from "@/components/WaveDivider";
import { supabase } from "@/integrations/supabase/client";
import { trackPurchase } from "@/components/AnalyticsProvider";
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

interface AppliedCoupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  max_discount_amount: number | null;
}

interface BankSettings {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"transfer" | "card">("transfer");
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [bankSettings, setBankSettings] = useState<BankSettings | null>(null);
  const [copied, setCopied] = useState(false);

  // Pre-fill email if user is logged in
  useEffect(() => {
    if (user?.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: user.email || "" }));
    }
  }, [user]);

  // Fetch bank settings
  useEffect(() => {
    const fetchBankSettings = async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("key, value")
        .in("key", ["BANK_CODE", "BANK_NAME", "BANK_ACCOUNT_NUMBER", "BANK_ACCOUNT_NAME"]);

      if (!error && data) {
        const settings: Record<string, string> = {};
        data.forEach((s) => {
          settings[s.key] = s.value || "";
        });
        
        if (settings.BANK_CODE && settings.BANK_ACCOUNT_NUMBER) {
          setBankSettings({
            bankCode: settings.BANK_CODE,
            bankName: settings.BANK_NAME,
            accountNumber: settings.BANK_ACCOUNT_NUMBER,
            accountName: settings.BANK_ACCOUNT_NAME,
          });
        }
      }
    };

    fetchBankSettings();
  }, []);

  const subtotal = getTotalPrice();
  
  // Calculate discount amount
  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    
    let discount = 0;
    if (appliedCoupon.discount_type === "percentage") {
      discount = (subtotal * appliedCoupon.discount_value) / 100;
      // Apply max discount limit if set
      if (appliedCoupon.max_discount_amount && discount > appliedCoupon.max_discount_amount) {
        discount = appliedCoupon.max_discount_amount;
      }
    } else {
      discount = appliedCoupon.discount_value;
    }
    
    // Don't let discount exceed subtotal
    return Math.min(discount, subtotal);
  };

  const discountAmount = calculateDiscount();
  const finalTotal = subtotal - discountAmount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mã giảm giá",
        variant: "destructive",
      });
      return;
    }

    setIsApplyingCoupon(true);

    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase().trim())
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Mã không hợp lệ",
          description: "Mã giảm giá không tồn tại hoặc đã hết hiệu lực",
          variant: "destructive",
        });
        return;
      }

      // Check expiration
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        toast({
          title: "Mã đã hết hạn",
          description: "Mã giảm giá này đã hết hạn sử dụng",
          variant: "destructive",
        });
        return;
      }

      // Check start date
      if (data.starts_at && new Date(data.starts_at) > new Date()) {
        toast({
          title: "Mã chưa có hiệu lực",
          description: "Mã giảm giá này chưa đến thời gian sử dụng",
          variant: "destructive",
        });
        return;
      }

      // Check usage limit
      if (data.usage_limit && data.used_count >= data.usage_limit) {
        toast({
          title: "Mã đã hết lượt",
          description: "Mã giảm giá này đã được sử dụng hết",
          variant: "destructive",
        });
        return;
      }

      // Check minimum order amount
      if (data.min_order_amount && subtotal < Number(data.min_order_amount)) {
        toast({
          title: "Chưa đủ điều kiện",
          description: `Đơn hàng tối thiểu ${formatPrice(Number(data.min_order_amount))} để áp dụng mã này`,
          variant: "destructive",
        });
        return;
      }

      // Apply coupon
      setAppliedCoupon({
        id: data.id,
        code: data.code,
        discount_type: data.discount_type,
        discount_value: Number(data.discount_value),
        max_discount_amount: data.max_discount_amount ? Number(data.max_discount_amount) : null,
      });
      setCouponCode("");

      toast({
        title: "Áp dụng thành công! 🎉",
        description: `Mã ${data.code} đã được áp dụng`,
      });
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast({
        title: "Lỗi",
        description: "Không thể áp dụng mã giảm giá",
        variant: "destructive",
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast({
      title: "Đã xóa mã giảm giá",
      description: "Bạn có thể nhập mã khác",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create order in database
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id || null,
          user_email: formData.email,
          total_amount: finalTotal,
          payment_method: paymentMethod,
          status: "pending",
          notes: `Họ tên: ${formData.fullName}, SĐT: ${formData.phone}`,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        theme_id: item.theme.id,
        theme_name: item.theme.name,
        price: item.theme.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Create download records for logged in users
      if (user) {
        const downloads = items.map((item) => ({
          user_id: user.id,
          order_id: orderData.id,
          theme_id: item.theme.id,
          theme_name: item.theme.name,
          download_count: 0,
          max_downloads: 5,
        }));

        await supabase.from("user_downloads").insert(downloads);
      }

      // If coupon was applied, increment used_count
      if (appliedCoupon) {
        const { data: couponData } = await supabase
          .from("coupons")
          .select("used_count")
          .eq("id", appliedCoupon.id)
          .single();
        
        if (couponData) {
          await supabase
            .from("coupons")
            .update({ used_count: (couponData.used_count || 0) + 1 })
            .eq("id", appliedCoupon.id);
        }
      }

      // Track purchase event for analytics
      trackPurchase(orderData.id, finalTotal, "VND");
      
      clearCart();
      setIsProcessing(false);
      
      toast({
        title: "Đặt hàng thành công! 🎉",
        description: user 
          ? "Chuyển đến trang tải xuống themes của bạn." 
          : "Cảm ơn bạn đã mua hàng. Chúng tôi sẽ gửi themes qua email.",
      });
      
      // Redirect based on login status
      if (user) {
        navigate("/profile");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setIsProcessing(false);
      toast({
        title: "Lỗi",
        description: "Đã có lỗi xảy ra. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <AnimatedSection animation="zoom" className="text-center">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">Giỏ hàng trống</h1>
          <p className="text-muted-foreground mb-6">Hãy khám phá các themes tuyệt vời của chúng tôi</p>
          <Button variant="gradient" onClick={() => navigate("/")}>
            Tiếp tục mua sắm
          </Button>
        </AnimatedSection>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with gradient background */}
      <div className="relative bg-gradient-to-br from-primary via-primary to-accent overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-[10%] w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-10 right-[20%] w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        </div>
        
        <div className="container mx-auto px-4 py-6 relative z-10">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            Quay lại cửa hàng
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Thanh toán</h1>
              <p className="text-white/70">Hoàn tất đơn hàng của bạn một cách an toàn</p>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <Lock className="h-4 w-4 text-white" />
              <span className="text-white text-sm">Thanh toán bảo mật</span>
            </div>
          </div>
        </div>
        
        <WaveDivider direction="down" />
      </div>

      <main className="container mx-auto px-4 py-12 -mt-4">
        {/* Progress Steps */}
        <AnimatedSection animation="fade-up" className="max-w-4xl mx-auto mb-10">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                <Check className="h-4 w-4" />
              </div>
              <span className="text-foreground font-medium hidden sm:block">Giỏ hàng</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="text-foreground font-medium hidden sm:block">Thanh toán</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="text-muted-foreground font-medium hidden sm:block">Hoàn tất</span>
            </div>
          </div>
        </AnimatedSection>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              <AnimatedSection animation="fade-up" delay={100}>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Customer Info */}
                  <div className="bg-card p-6 md:p-8 rounded-2xl border border-border space-y-5">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">👤</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-foreground">
                          Thông tin khách hàng
                        </h2>
                        <p className="text-sm text-muted-foreground">Themes sẽ được gửi qua email của bạn</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Họ và tên <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full h-12 px-4 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          placeholder="Nhập họ và tên"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Email <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full h-12 px-4 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          placeholder="email@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Số điện thoại <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full h-12 px-4 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          placeholder="0912 345 678"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-card p-6 md:p-8 rounded-2xl border border-border space-y-5">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-foreground">
                          Phương thức thanh toán
                        </h2>
                        <p className="text-sm text-muted-foreground">Chọn cách thanh toán phù hợp</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("transfer")}
                        className={`p-5 border-2 rounded-xl text-left transition-all ${
                          paymentMethod === "transfer"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                            paymentMethod === "transfer" ? "border-primary" : "border-muted-foreground"
                          }`}>
                            {paymentMethod === "transfer" && (
                              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-foreground mb-1">Chuyển khoản ngân hàng</div>
                            <div className="text-sm text-muted-foreground">Xác nhận trong 5-10 phút</div>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("card")}
                        className={`p-5 border-2 rounded-xl text-left transition-all ${
                          paymentMethod === "card"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                            paymentMethod === "card" ? "border-primary" : "border-muted-foreground"
                          }`}>
                            {paymentMethod === "card" && (
                              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-foreground mb-1">Thẻ tín dụng / Ghi nợ</div>
                            <div className="text-sm text-muted-foreground">Visa, Mastercard, JCB</div>
                          </div>
                        </div>
                      </button>
                    </div>

                    {paymentMethod === "transfer" && (
                      <div className="p-5 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/20">
                        <p className="font-medium text-foreground mb-4 flex items-center gap-2">
                          <QrCode className="h-4 w-4 text-primary" />
                          Quét mã QR để thanh toán
                        </p>
                        
                        {bankSettings ? (
                          <div className="flex flex-col md:flex-row gap-6">
                            {/* VietQR Code */}
                            <div className="flex-shrink-0">
                              <div className="bg-white p-3 rounded-lg shadow-sm inline-block">
                                <img 
                                  src={`https://img.vietqr.io/image/${bankSettings.bankCode}-${bankSettings.accountNumber}-compact2.png?amount=${Math.round(finalTotal)}&addInfo=${encodeURIComponent(`THEMEVN ${formData.phone || 'DH' + Date.now()}`)}&accountName=${encodeURIComponent(bankSettings.accountName)}`}
                                  alt="VietQR Payment"
                                  className="w-40 h-40 object-contain"
                                />
                              </div>
                              <p className="text-xs text-muted-foreground text-center mt-2">
                                Quét bằng app ngân hàng
                              </p>
                            </div>
                            
                            {/* Bank Info */}
                            <div className="flex-1 space-y-3">
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Ngân hàng:</span>
                                  <p className="font-medium text-foreground">{bankSettings.bankName}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Số tiền:</span>
                                  <p className="font-bold text-primary">{formatPrice(finalTotal)}</p>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-muted-foreground">Số tài khoản:</span>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-foreground font-mono">{bankSettings.accountNumber}</p>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(bankSettings.accountNumber);
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 2000);
                                        toast({ title: "Đã sao chép số tài khoản" });
                                      }}
                                      className="p-1 hover:bg-primary/10 rounded transition-colors"
                                    >
                                      {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                                    </button>
                                  </div>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-muted-foreground">Chủ tài khoản:</span>
                                  <p className="font-medium text-foreground">{bankSettings.accountName}</p>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-muted-foreground">Nội dung CK:</span>
                                  <p className="font-medium text-foreground bg-primary/10 px-2 py-1 rounded inline-block">
                                    THEMEVN {formData.phone || "[Nhập SĐT]"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Ngân hàng:</span>
                              <p className="font-medium text-foreground">Vietcombank</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Số tài khoản:</span>
                              <p className="font-medium text-foreground">1234567890</p>
                            </div>
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Chủ tài khoản:</span>
                              <p className="font-medium text-foreground">CONG TY TNHH THEME VN</p>
                            </div>
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Nội dung CK:</span>
                              <p className="font-medium text-foreground">THEMEVN {formData.phone || "[Số điện thoại]"}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {paymentMethod === "card" && (
                      <div className="p-5 bg-muted/50 rounded-xl border border-border">
                        <p className="text-muted-foreground text-sm text-center">
                          Tích hợp thanh toán thẻ sẽ được cập nhật sớm. Vui lòng chọn phương thức chuyển khoản.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Trust badges */}
                  <div className="flex flex-wrap items-center justify-center gap-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-5 w-5 text-accent" />
                      Thanh toán an toàn
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Lock className="h-5 w-5 text-accent" />
                      Mã hóa SSL
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Truck className="h-5 w-5 text-accent" />
                      Giao ngay qua email
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    size="xl"
                    className="w-full h-14 text-lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang xử lý...
                      </span>
                    ) : (
                      `Hoàn tất thanh toán ${formatPrice(finalTotal)}`
                    )}
                  </Button>
                </form>
              </AnimatedSection>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <AnimatedSection animation="fade-left" delay={200}>
                <div className="bg-card p-6 rounded-2xl border border-border sticky top-8">
                  <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                    <Gift className="h-5 w-5 text-primary" />
                    Đơn hàng ({items.length})
                  </h2>
                  
                  <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                    {items.map((item) => (
                      <div key={item.theme.id} className="flex gap-4 group">
                        <div className="relative">
                          <img
                            src={item.theme.image}
                            alt={item.theme.name}
                            className="w-20 h-14 object-cover rounded-lg"
                          />
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] text-white font-medium">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground text-sm truncate group-hover:text-primary transition-colors">
                            {item.theme.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-1">
                            {item.theme.category}
                          </p>
                          <span className="font-semibold text-foreground text-sm">
                            {formatPrice(item.theme.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Coupon Code */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" />
                      Mã giảm giá
                    </label>
                    
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-3 bg-accent/10 border border-accent/30 rounded-xl">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                            <Tag className="h-4 w-4 text-accent" />
                          </div>
                          <div>
                            <code className="font-mono font-bold text-foreground">{appliedCoupon.code}</code>
                            <p className="text-xs text-accent">
                              {appliedCoupon.discount_type === "percentage" 
                                ? `Giảm ${appliedCoupon.discount_value}%`
                                : `Giảm ${formatPrice(appliedCoupon.discount_value)}`
                              }
                              {appliedCoupon.max_discount_amount && appliedCoupon.discount_type === "percentage" && (
                                <span className="text-muted-foreground"> (tối đa {formatPrice(appliedCoupon.max_discount_amount)})</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={handleRemoveCoupon}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApplyCoupon())}
                          className="flex-1 h-10 px-3 bg-background border border-border rounded-lg text-foreground text-sm uppercase focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Nhập mã..."
                          disabled={isApplyingCoupon}
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-10 px-4"
                          onClick={handleApplyCoupon}
                          disabled={isApplyingCoupon || !couponCode.trim()}
                        >
                          {isApplyingCoupon ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Áp dụng"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tạm tính</span>
                      <span className="text-foreground">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Giảm giá</span>
                      <span className={`font-medium ${discountAmount > 0 ? "text-accent" : "text-muted-foreground"}`}>
                        {discountAmount > 0 ? `-${formatPrice(discountAmount)}` : formatPrice(0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Phí thanh toán</span>
                      <span className="text-accent font-medium">Miễn phí</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold pt-3 border-t border-border">
                      <span className="text-foreground">Tổng cộng</span>
                      <div className="text-right">
                        <span className="gradient-text">{formatPrice(finalTotal)}</span>
                        {discountAmount > 0 && (
                          <p className="text-xs text-accent font-normal">Tiết kiệm {formatPrice(discountAmount)}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="mt-6 p-4 bg-gradient-to-br from-accent/10 to-primary/10 rounded-xl">
                    <p className="text-sm font-medium text-foreground mb-2">🎁 Quyền lợi của bạn</p>
                    <ul className="text-xs text-muted-foreground space-y-1.5">
                      <li className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-accent" />
                        Cập nhật miễn phí trọn đời
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-accent" />
                        Hỗ trợ kỹ thuật 6 tháng
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-accent" />
                        Tài liệu hướng dẫn chi tiết
                      </li>
                    </ul>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;