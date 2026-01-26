import { X, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const { items, removeFromCart, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-card border-l border-border animate-slide-in shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Giỏ hàng</h2>
              <span className="gradient-bg text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                {items.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-lg font-medium text-foreground">Giỏ hàng trống</p>
                <p className="text-muted-foreground mt-1">
                  Hãy thêm một số themes vào giỏ hàng
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.theme.id}
                    className="flex gap-4 p-4 bg-secondary rounded-xl"
                  >
                    <img
                      src={item.theme.image}
                      alt={item.theme.name}
                      className="w-20 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">
                        {item.theme.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.theme.category}
                      </p>
                      <p className="font-semibold text-primary mt-1">
                        {formatPrice(item.theme.price)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.theme.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-border space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tổng cộng</span>
                <span className="text-2xl font-bold text-foreground">
                  {formatPrice(getTotalPrice())}
                </span>
              </div>
              <Button
                variant="hero"
                size="xl"
                className="w-full"
                onClick={handleCheckout}
              >
                Tiến hành thanh toán
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={clearCart}
              >
                Xóa tất cả
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
