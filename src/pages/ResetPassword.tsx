import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { Lock, Loader2, CheckCircle, Shield, KeyRound, ArrowRight, Mail, ArrowLeft } from "lucide-react";
import authBgVideo from "@/assets/auth-background.mp4";
import AuthHeader from "@/components/AuthHeader";
import AuthFooter from "@/components/AuthFooter";

type Step = "email" | "otp" | "password" | "success";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { sendOtpViaResend, verifyOtpViaResend, updatePassword, signInWithPassword } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng nhập email",
      });
      return;
    }

    setLoading(true);
    const { error } = await sendOtpViaResend(email, "recovery");
    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message,
      });
    } else {
      toast({
        title: "Đã gửi mã OTP",
        description: "Kiểm tra email của bạn để lấy mã xác thực",
      });
      setStep("otp");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng nhập đủ 6 số OTP",
      });
      return;
    }

    setLoading(true);
    const { error, verified } = await verifyOtpViaResend(email, otp, "recovery");
    setLoading(false);

    if (error || !verified) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.message || "Mã OTP không hợp lệ",
      });
    } else {
      toast({
        title: "Xác thực thành công",
        description: "Bạn có thể đặt mật khẩu mới",
      });
      setStep("password");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Mật khẩu phải có ít nhất 6 ký tự",
      });
      return;
    }

    setLoading(true);
    
    // First sign in with existing password (using magic link approach)
    // Since user verified OTP, we'll use admin to update password
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ email, newPassword: password }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok || data.error) {
      toast({
        variant: "destructive",
        title: "Đặt lại mật khẩu thất bại",
        description: data.error || "Có lỗi xảy ra",
      });
    } else {
      toast({
        title: "Đặt lại mật khẩu thành công!",
        description: "Bạn có thể đăng nhập với mật khẩu mới.",
      });
      setStep("success");
    }
  };

  const AuthCard = ({ children }: { children: React.ReactNode }) => (
    <Card className="border-border/30 bg-card/80 backdrop-blur-xl shadow-2xl">
      {children}
    </Card>
  );

  const renderStep = () => {
    switch (step) {
      case "email":
        return (
          <AuthCard>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
                <Mail className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Quên mật khẩu?</CardTitle>
              <CardDescription>
                Nhập email để nhận mã OTP đặt lại mật khẩu
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 bg-background/50"
                      required
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full h-12 text-base font-medium" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Gửi mã OTP
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/auth" className="text-sm text-primary hover:underline">
                  ← Quay lại đăng nhập
                </Link>
              </div>
            </CardContent>
          </AuthCard>
        );

      case "otp":
        return (
          <AuthCard>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
                <Shield className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Nhập mã OTP</CardTitle>
              <CardDescription>
                Mã xác thực đã được gửi đến <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                
                <Button type="submit" className="w-full h-12 text-base font-medium" disabled={loading || otp.length !== 6}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Xác nhận
                </Button>
              </form>

              <div className="mt-6 text-center space-y-2">
                <button 
                  onClick={() => handleSendOtp({ preventDefault: () => {} } as React.FormEvent)}
                  disabled={loading}
                  className="text-sm text-primary hover:underline"
                >
                  Gửi lại mã OTP
                </button>
                <p className="text-xs text-muted-foreground">
                  Mã có hiệu lực trong 10 phút
                </p>
              </div>

              <div className="mt-4 text-center">
                <button 
                  onClick={() => setStep("email")} 
                  className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mx-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Đổi email
                </button>
              </div>
            </CardContent>
          </AuthCard>
        );

      case "password":
        return (
          <AuthCard>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
                <KeyRound className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Đặt mật khẩu mới</CardTitle>
              <CardDescription>
                Tạo mật khẩu mới cho tài khoản của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Mật khẩu mới</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-12 bg-background/50"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 h-12 bg-background/50"
                      required
                    />
                  </div>
                </div>
                
                {/* Password strength indicator */}
                {password && (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      <div className={`h-1 flex-1 rounded-full ${password.length >= 6 ? 'bg-emerald-500' : 'bg-muted'}`} />
                      <div className={`h-1 flex-1 rounded-full ${password.length >= 8 ? 'bg-emerald-500' : 'bg-muted'}`} />
                      <div className={`h-1 flex-1 rounded-full ${password.length >= 10 && /[A-Z]/.test(password) ? 'bg-emerald-500' : 'bg-muted'}`} />
                      <div className={`h-1 flex-1 rounded-full ${password.length >= 12 && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password) ? 'bg-emerald-500' : 'bg-muted'}`} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {password.length < 6 ? 'Yếu' : password.length < 8 ? 'Trung bình' : password.length < 10 ? 'Khá' : 'Mạnh'}
                    </p>
                  </div>
                )}
                
                <Button type="submit" className="w-full h-12 text-base font-medium" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Đặt lại mật khẩu
                </Button>
              </form>
            </CardContent>
          </AuthCard>
        );

      case "success":
        return (
          <AuthCard>
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-6">
                <div className="relative mx-auto w-20 h-20">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full opacity-20 animate-pulse" />
                  <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <CheckCircle className="h-10 w-10 text-primary-foreground" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">Đặt lại mật khẩu thành công!</h2>
                  <p className="text-muted-foreground">
                    Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập với mật khẩu mới.
                  </p>
                </div>
                
                <Button 
                  onClick={() => navigate("/auth")} 
                  className="w-full h-12 text-base font-medium group"
                >
                  Đăng nhập ngay
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </AuthCard>
        );
    }
  };

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen relative overflow-hidden pt-16 pb-16">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={authBgVideo} type="video/mp4" />
        </video>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />

        {/* Content */}
        <div className="relative z-10 min-h-screen flex">
          {/* Left Side - Branding (hidden on mobile) */}
          <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12 xl:p-20">
            <Link to="/" className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                <span className="text-2xl font-bold text-primary-foreground">T</span>
              </div>
              <span className="text-3xl font-bold text-foreground">ThemeVN</span>
            </Link>

            <h1 className="text-4xl xl:text-5xl font-bold text-foreground mb-6 leading-tight">
              Đặt lại mật khẩu
              <span className="block mt-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                qua xác thực OTP
              </span>
            </h1>

            <p className="text-lg text-muted-foreground mb-10 max-w-md">
              Bảo mật tài khoản của bạn với xác thực OTP qua email. Quá trình đặt lại mật khẩu an toàn và nhanh chóng.
            </p>

            {/* Security Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <span className="text-foreground font-medium">Xác thực qua Email OTP</span>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <span className="text-foreground font-medium">Mã hóa end-to-end</span>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <span className="text-foreground font-medium">Bảo mật cao</span>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
            <div className="w-full max-w-md">
              {/* Mobile Logo */}
              <Link to="/" className="flex lg:hidden items-center justify-center gap-2 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                  <span className="text-xl font-bold text-primary-foreground">T</span>
                </div>
                <span className="text-2xl font-bold text-foreground">ThemeVN</span>
              </Link>

              {/* Step indicator */}
              {step !== "success" && (
                <div className="flex items-center justify-center gap-2 mb-6">
                  {["email", "otp", "password"].map((s, i) => (
                    <div 
                      key={s}
                      className={`h-2 rounded-full transition-all ${
                        step === s 
                          ? "w-8 bg-primary" 
                          : i < ["email", "otp", "password"].indexOf(step)
                          ? "w-2 bg-primary/50"
                          : "w-2 bg-muted"
                      }`}
                    />
                  ))}
                </div>
              )}

              {renderStep()}

              {/* Back to home */}
              <p className="text-center mt-6 text-muted-foreground text-sm">
                <Link to="/" className="hover:text-primary transition-colors">
                  ← Quay về trang chủ
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <AuthFooter />
    </>
  );
};

export default ResetPassword;
