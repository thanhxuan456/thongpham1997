import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import CartDrawer from "@/components/CartDrawer";
import { useState } from "react";
import { Shield, FileText, CreditCard, RotateCcw } from "lucide-react";

const policies = [
  {
    id: "terms",
    icon: FileText,
    title: "Điều khoản sử dụng",
    content: `
## 1. Giới thiệu
Chào mừng bạn đến với ThemeVN. Khi sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản và điều kiện sau đây.

## 2. Quyền sở hữu trí tuệ
- Tất cả các themes, designs, code và nội dung trên website thuộc sở hữu của ThemeVN hoặc các đối tác của chúng tôi.
- Mỗi license cho phép sử dụng theme trên 1 website duy nhất.
- Nghiêm cấm phân phối lại, bán lại hoặc chia sẻ công khai các sản phẩm đã mua.

## 3. Sử dụng sản phẩm
- Bạn có quyền sử dụng theme cho các mục đích thương mại hoặc cá nhân.
- Không được sử dụng theme cho các website vi phạm pháp luật hoặc đạo đức.
- Chúng tôi không chịu trách nhiệm về nội dung bạn tạo ra bằng theme của chúng tôi.

## 4. Hỗ trợ kỹ thuật
- Mỗi sản phẩm đi kèm với 6 tháng hỗ trợ kỹ thuật miễn phí.
- Hỗ trợ bao gồm: sửa lỗi, hướng dẫn cài đặt, cấu hình cơ bản.
- Không bao gồm: tùy chỉnh theo yêu cầu, cài đặt từ xa, tích hợp bên thứ ba.
    `,
  },
  {
    id: "privacy",
    icon: Shield,
    title: "Chính sách bảo mật",
    content: `
## 1. Thu thập thông tin
Chúng tôi thu thập các thông tin sau:
- Thông tin cá nhân: họ tên, email, số điện thoại khi bạn đăng ký hoặc mua hàng.
- Thông tin thanh toán: được xử lý bảo mật qua các cổng thanh toán uy tín.
- Thông tin truy cập: cookies, IP address, thời gian truy cập để cải thiện trải nghiệm.

## 2. Sử dụng thông tin
Thông tin của bạn được sử dụng để:
- Xử lý đơn hàng và giao sản phẩm.
- Cung cấp hỗ trợ kỹ thuật.
- Gửi thông tin cập nhật sản phẩm và khuyến mãi (có thể hủy đăng ký).
- Cải thiện dịch vụ của chúng tôi.

## 3. Bảo mật thông tin
- Chúng tôi sử dụng SSL/TLS để mã hóa dữ liệu truyền tải.
- Thông tin thanh toán không được lưu trữ trên server của chúng tôi.
- Nhân viên được đào tạo về bảo mật thông tin khách hàng.

## 4. Chia sẻ thông tin
Chúng tôi KHÔNG bán hoặc chia sẻ thông tin cá nhân của bạn cho bên thứ ba, ngoại trừ:
- Đối tác thanh toán để xử lý giao dịch.
- Khi có yêu cầu từ cơ quan pháp luật.
    `,
  },
  {
    id: "payment",
    icon: CreditCard,
    title: "Chính sách thanh toán",
    content: `
## 1. Phương thức thanh toán
Chúng tôi chấp nhận các hình thức thanh toán:
- Chuyển khoản ngân hàng
- Thẻ tín dụng/ghi nợ (Visa, Mastercard, JCB)
- Ví điện tử (MoMo, ZaloPay, VNPay)

## 2. Quy trình thanh toán
1. Thêm sản phẩm vào giỏ hàng
2. Điền thông tin thanh toán
3. Chọn phương thức thanh toán
4. Xác nhận và hoàn tất đơn hàng
5. Nhận sản phẩm qua email trong vòng 5 phút (với thanh toán tự động)

## 3. Hóa đơn
- Hóa đơn điện tử được gửi qua email sau khi thanh toán thành công.
- Nếu cần hóa đơn đỏ (VAT), vui lòng liên hệ support@themevn.vn

## 4. Bảo mật thanh toán
- Tất cả giao dịch được bảo mật bởi SSL 256-bit.
- Chúng tôi không lưu trữ thông tin thẻ của bạn.
    `,
  },
  {
    id: "refund",
    icon: RotateCcw,
    title: "Chính sách hoàn tiền",
    content: `
## 1. Điều kiện hoàn tiền
Bạn có thể yêu cầu hoàn tiền trong vòng 7 ngày nếu:
- Theme không hoạt động như mô tả
- Có lỗi kỹ thuật nghiêm trọng không thể khắc phục
- Theme không tương thích với phiên bản WordPress/PHP được ghi trong mô tả

## 2. Không áp dụng hoàn tiền khi
- Bạn đã download và sử dụng theme
- Đã quá 7 ngày kể từ ngày mua
- Theme hoạt động bình thường nhưng không đáp ứng sở thích cá nhân
- Yêu cầu tính năng không có trong mô tả sản phẩm

## 3. Quy trình hoàn tiền
1. Gửi yêu cầu hoàn tiền qua email support@themevn.vn
2. Mô tả chi tiết lý do hoàn tiền
3. Đợi xác nhận từ đội ngũ support (trong vòng 24-48 giờ)
4. Hoàn tiền sẽ được xử lý trong 3-5 ngày làm việc

## 4. Phương thức hoàn tiền
- Hoàn tiền về phương thức thanh toán ban đầu
- Hoặc credit vào tài khoản ThemeVN để sử dụng cho lần mua tiếp theo
    `,
  },
];

const Policy = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const [activePolicy, setActivePolicy] = useState("terms");

  const currentPolicy = policies.find((p) => p.id === activePolicy);

  return (
    <div className="min-h-screen bg-background">
      <Header onCartClick={() => setCartOpen(true)} />

      <main>
        {/* Hero */}
        <section className="py-20 bg-gradient-to-br from-primary/10 via-transparent to-accent/10">
          <div className="container mx-auto px-4">
            <AnimatedSection animation="fade-up" className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Chính sách & <span className="gradient-text">Điều khoản</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Vui lòng đọc kỹ các chính sách và điều khoản trước khi sử dụng dịch vụ của chúng tôi.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {/* Sidebar */}
              <AnimatedSection animation="fade-right" className="lg:col-span-1">
                <div className="bg-card rounded-2xl card-shadow p-4 sticky top-24">
                  <nav className="space-y-2">
                    {policies.map((policy) => (
                      <button
                        key={policy.id}
                        onClick={() => setActivePolicy(policy.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                          activePolicy === policy.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-secondary text-foreground"
                        }`}
                      >
                        <policy.icon className="h-5 w-5" />
                        <span className="font-medium">{policy.title}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </AnimatedSection>

              {/* Main Content */}
              <AnimatedSection animation="fade-left" className="lg:col-span-3">
                <div className="bg-card rounded-2xl card-shadow p-8">
                  <div className="flex items-center gap-3 mb-6">
                    {currentPolicy && <currentPolicy.icon className="h-8 w-8 text-primary" />}
                    <h2 className="text-2xl font-bold text-foreground">{currentPolicy?.title}</h2>
                  </div>
                  <div className="prose prose-lg max-w-none dark:prose-invert">
                    {currentPolicy?.content.split('\n').map((line, index) => {
                      if (line.startsWith('## ')) {
                        return <h2 key={index} className="text-xl font-semibold text-foreground mt-8 mb-4">{line.replace('## ', '')}</h2>;
                      } else if (line.startsWith('- ')) {
                        return <li key={index} className="text-muted-foreground ml-4">{line.replace('- ', '')}</li>;
                      } else if (line.match(/^\d+\./)) {
                        return <li key={index} className="text-muted-foreground ml-4">{line}</li>;
                      } else if (line.trim()) {
                        return <p key={index} className="text-muted-foreground mb-4">{line}</p>;
                      }
                      return null;
                    })}
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export default Policy;
