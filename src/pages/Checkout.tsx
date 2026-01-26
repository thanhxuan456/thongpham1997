import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCart();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
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
    
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    clearCart();
    setIsProcessing(false);
    
    toast({
      title: "Đặt hàng thành công! 🎉",
      description: "Cảm ơn bạn đã mua hàng. Chúng tôi sẽ gửi themes qua email.",
    });
    
    navigate("/");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Giỏ hàng trống</h1>
          <Button variant="gradient" onClick={() => navigate("/")}>
            Tiếp tục mua sắm
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Quay lại
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8">Thanh toán</h1>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Form */}
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-card p-6 rounded-2xl border border-border space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Thông tin khách hàng
                  </h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full h-12 px-4 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Nhập họ và tên"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full h-12 px-4 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full h-12 px-4 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="0912 345 678"
                    />
                  </div>
                </div>

                <div className="bg-card p-6 rounded-2xl border border-border space-y-4">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Phương thức thanh toán
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      className="p-4 border-2 border-primary bg-primary/5 rounded-xl text-foreground text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Check className="h-4 w-4 text-primary" />
                      Chuyển khoản
                    </button>
                    <button
                      type="button"
                      className="p-4 border border-border rounded-xl text-muted-foreground text-sm font-medium hover:border-primary/50 transition-colors"
                    >
                      Thẻ tín dụng
                    </button>
                  </div>

                  <div className="p-4 bg-secondary rounded-xl text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-2">Thông tin chuyển khoản:</p>
                    <p>Ngân hàng: Vietcombank</p>
                    <p>STK: 1234567890</p>
                    <p>Chủ TK: THEME VN</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-5 w-5 text-accent" />
                  Thanh toán an toàn và bảo mật
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="xl"
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Đang xử lý..." : `Thanh toán ${formatPrice(getTotalPrice())}`}
                </Button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="bg-card p-6 rounded-2xl border border-border sticky top-8">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Đơn hàng ({items.length} sản phẩm)
                </h2>
                
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.theme.id} className="flex gap-4">
                      <img
                        src={item.theme.image}
                        alt={item.theme.name}
                        className="w-16 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground text-sm truncate">
                          {item.theme.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {item.theme.category}
                        </p>
                      </div>
                      <span className="font-medium text-foreground text-sm">
                        {formatPrice(item.theme.price)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span className="text-foreground">{formatPrice(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Giảm giá</span>
                    <span className="text-accent">-{formatPrice(0)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                    <span className="text-foreground">Tổng cộng</span>
                    <span className="gradient-text">{formatPrice(getTotalPrice())}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
