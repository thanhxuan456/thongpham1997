import { useState, useEffect, memo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { PhoneInputField } from "@/components/ui/phone-input";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, Lock, ArrowLeft, Loader2, Sparkles, Shield, Zap, Eye, EyeOff, 
  Wand2, Phone, Users, Star, CheckCircle2, Globe, Palette
} from "lucide-react";
import logoImage from "@/assets/logo.png";
import PasswordGenerator from "@/components/PasswordGenerator";

const AuthCard = memo(({ children }: { children: React.ReactNode }) => (
  <Card className="border-0 bg-card/95 backdrop-blur-2xl shadow-2xl shadow-primary/10">
    {children}
  </Card>
));
AuthCard.displayName = "AuthCard";

const features = [
  { icon: Palette, text: "500+ Theme chất lượng cao", color: "text-pink-500" },
  { icon: Zap, text: "Tối ưu tốc độ & SEO", color: "text-yellow-500" },
  { icon: Shield, text: "Bảo mật & hỗ trợ 24/7", color: "text-green-500" },
  { icon: Globe, text: "Hỗ trợ đa ngôn ngữ", color: "text-blue-500" },
];

const stats = [
  { value: "50K+", label: "Khách hàng" },
  { value: "500+", label: "Themes" },
  { value: "99%", label: "Hài lòng" },
];

type OtpMethod = "email" | "phone";

const Auth = () => {
  const navigate = useNavigate();
  const { user, signInWithPassword, resetPassword, sendOtpViaResend, verifyOtpViaResend } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [pendingSignupEmail, setPendingSignupEmail] = useState("");
  const [pendingSignupPassword, setPendingSignupPassword] = useState("");
  const [otpType, setOtpType] = useState<"login" | "signup" | "recovery">("login");
  const [otpMethod, setOtpMethod] = useState<OtpMethod>("email");
  
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordGenerator, setShowPasswordGenerator] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("themevn_remember_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleRememberMe = (checked: boolean) => {
    setRememberMe(checked);
    if (!checked) {
      localStorage.removeItem("themevn_remember_email");
    }
  };

  const handlePasswordGenerated = (generatedPassword: string) => {
    setPassword(generatedPassword);
    setConfirmPassword(generatedPassword);
    setShowPasswordGenerator(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
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
    setPendingSignupEmail(email);
    setPendingSignupPassword(password);
    
    const { error } = await sendOtpViaResend(email, "signup");
    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Gửi mã OTP thất bại",
        description: error.message,
      });
    } else {
      setOtpType("signup");
      setOtpMethod("email");
      setShowOtpInput(true);
      toast({
        title: "Đã gửi mã OTP!",
        description: "Vui lòng kiểm tra email để xác thực tài khoản.",
      });
    }
  };

  const handleLoginWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (rememberMe) {
      localStorage.setItem("themevn_remember_email", email);
    }
    
    const { error } = await signInWithPassword(email, password);
    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Đăng nhập thất bại",
        description: error.message,
      });
    } else {
      toast({
        title: "Đăng nhập thành công!",
      });
      navigate("/");
    }
  };

  const handleSendOtp = async (method: OtpMethod) => {
    const target = method === "email" ? email : phone;
    if (!target) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: method === "email" ? "Vui lòng nhập email" : "Vui lòng nhập số điện thoại",
      });
      return;
    }
    
    setLoading(true);
    const { error } = await sendOtpViaResend(target, "login");
    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Gửi OTP thất bại",
        description: error.message,
      });
    } else {
      setOtpType("login");
      setOtpMethod(method);
      setShowOtpInput(true);
      toast({
        title: "Đã gửi mã OTP",
        description: method === "email" 
          ? "Vui lòng kiểm tra email của bạn." 
          : "Vui lòng kiểm tra tin nhắn SMS.",
      });
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) return;
    
    setLoading(true);
    const target = otpMethod === "email" 
      ? (otpType === "signup" ? pendingSignupEmail : email)
      : phone;
    
    const { error, verified } = await verifyOtpViaResend(
      target, 
      otpCode, 
      otpType,
      otpType === "signup" ? pendingSignupPassword : undefined
    );
    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Xác thực OTP thất bại",
        description: error.message,
      });
    } else if (verified) {
      toast({
        title: otpType === "signup" ? "Đăng ký thành công!" : "Đăng nhập thành công!",
      });
      setShowOtpInput(false);
      setOtpCode("");
      setPendingSignupEmail("");
      setPendingSignupPassword("");
      navigate("/");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Gửi email thất bại",
        description: error.message,
      });
    } else {
      toast({
        title: "Đã gửi email đặt lại mật khẩu",
        description: "Vui lòng kiểm tra email của bạn.",
      });
      setShowForgotPassword(false);
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    const target = otpMethod === "email" 
      ? (otpType === "signup" ? pendingSignupEmail : email)
      : phone;
    await sendOtpViaResend(target, otpType);
    setLoading(false);
    toast({
      title: "Đã gửi lại mã OTP",
      description: otpMethod === "email" 
        ? "Vui lòng kiểm tra email của bạn." 
        : "Vui lòng kiểm tra tin nhắn SMS.",
    });
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
        
        <div className="relative z-10 w-full max-w-md mx-auto px-4">
          <Link to="/" className="flex items-center justify-center gap-2 mb-8" data-testid="link-logo">
            <img src={logoImage} alt="ThemeVN" className="h-14 w-auto drop-shadow-lg" />
          </Link>

          <AuthCard>
            <CardHeader className="pb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForgotPassword(false)}
                className="w-fit mb-2"
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
              <CardTitle className="text-2xl font-bold">Quên mật khẩu</CardTitle>
              <CardDescription className="text-base">
                Nhập email để nhận link đặt lại mật khẩu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-sm font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 h-12 bg-background/50 text-base"
                      required
                      data-testid="input-reset-email"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading} data-testid="button-reset-password">
                  {loading && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
                  Gửi link đặt lại mật khẩu
                </Button>
              </form>
            </CardContent>
          </AuthCard>

          <p className="text-center mt-8 text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors font-medium" data-testid="link-home">
              ← Quay về trang chủ
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl" />
      </div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5Mzk1OTciIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

      <div className="relative z-10 min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12 xl:p-20">
          <Link to="/" className="flex items-center gap-3 mb-12" data-testid="link-logo-desktop">
            <img src={logoImage} alt="ThemeVN" className="h-16 w-auto drop-shadow-lg" />
          </Link>

          <h1 className="text-4xl xl:text-5xl font-bold text-foreground mb-6 leading-tight">
            Nền tảng WordPress
            <span className="block mt-2 bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent animate-gradient">
              Themes #1 Việt Nam
            </span>
          </h1>

          <p className="text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed">
            Hơn 50,000+ khách hàng tin tưởng. Themes được thiết kế chuyên nghiệp, tối ưu hiệu suất và SEO.
          </p>

          <div className="grid grid-cols-3 gap-6 mb-10">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4 rounded-2xl bg-card/50 backdrop-blur border border-border/50">
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-card/80 backdrop-blur border border-border/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <span className="text-foreground font-medium">{feature.text}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Đánh giá 4.9/5 từ 2,000+ người dùng</p>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            <Link to="/" className="flex lg:hidden items-center justify-center gap-2 mb-8" data-testid="link-logo-mobile">
              <img src={logoImage} alt="ThemeVN" className="h-14 w-auto drop-shadow-lg" />
            </Link>

            <AuthCard>
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">Chào mừng bạn!</CardTitle>
                <CardDescription className="text-base">
                  Đăng nhập hoặc tạo tài khoản mới
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 mb-6 h-12 p-1 bg-muted/50">
                    <TabsTrigger value="login" className="h-10 font-semibold" data-testid="tab-login">Đăng nhập</TabsTrigger>
                    <TabsTrigger value="signup" className="h-10 font-semibold" data-testid="tab-signup">Đăng ký</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="space-y-5">
                    {!showOtpInput ? (
                      <>
                        <form onSubmit={handleLoginWithPassword} className="space-y-5">
                          <div className="space-y-2">
                            <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                              <Input
                                id="login-email"
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-11 h-12 bg-background/50 text-base"
                                required
                                data-testid="input-login-email"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="login-password" className="text-sm font-medium">Mật khẩu</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                              <Input
                                id="login-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-11 pr-11 h-12 bg-background/50 text-base"
                                required
                                data-testid="input-login-password"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                data-testid="button-toggle-password"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-5 w-5 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="remember-me"
                                checked={rememberMe}
                                onCheckedChange={(checked) => handleRememberMe(checked as boolean)}
                                data-testid="checkbox-remember"
                              />
                              <Label
                                htmlFor="remember-me"
                                className="text-sm font-normal cursor-pointer text-muted-foreground"
                              >
                                Ghi nhớ đăng nhập
                              </Label>
                            </div>
                            <Button
                              type="button"
                              variant="link"
                              className="p-0 h-auto text-sm text-primary hover:text-primary/80 font-medium"
                              onClick={() => setShowForgotPassword(true)}
                              data-testid="button-forgot-password"
                            >
                              Quên mật khẩu?
                            </Button>
                          </div>
                          
                          <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading} data-testid="button-login">
                            {loading && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
                            Đăng nhập
                          </Button>
                        </form>

                        <div className="relative my-6">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border/50" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-3 text-muted-foreground font-medium">hoặc đăng nhập bằng OTP</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="h-12 text-base" 
                            disabled={loading || !email}
                            onClick={() => handleSendOtp("email")}
                            data-testid="button-otp-email"
                          >
                            <Mail className="h-5 w-5 mr-2" />
                            Email
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="h-12 text-base" 
                            disabled={loading || !phone}
                            onClick={() => handleSendOtp("phone")}
                            data-testid="button-otp-phone"
                          >
                            <Phone className="h-5 w-5 mr-2" />
                            SMS
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Số điện thoại (cho OTP SMS)</Label>
                          <PhoneInputField
                            value={phone}
                            onChange={(value) => setPhone(value || "")}
                            placeholder="Nhập số điện thoại"
                            data-testid="input-phone"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="space-y-5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowOtpInput(false);
                            setOtpCode("");
                          }}
                          className="mb-2"
                          data-testid="button-back-otp"
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Quay lại
                        </Button>
                        <div className="text-center space-y-3 py-4">
                          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                            {otpMethod === "email" ? (
                              <Mail className="w-8 h-8 text-primary" />
                            ) : (
                              <Phone className="w-8 h-8 text-primary" />
                            )}
                          </div>
                          <p className="text-muted-foreground">
                            Chúng tôi đã gửi mã OTP 6 số đến
                          </p>
                          <p className="font-semibold text-lg">
                            {otpMethod === "email" 
                              ? (otpType === "signup" ? pendingSignupEmail : email)
                              : phone
                            }
                          </p>
                        </div>
                        <div className="flex justify-center py-4">
                          <InputOTP
                            value={otpCode}
                            onChange={setOtpCode}
                            maxLength={6}
                            data-testid="input-otp"
                          >
                            <InputOTPGroup className="gap-2">
                              {[0, 1, 2, 3, 4, 5].map((index) => (
                                <InputOTPSlot 
                                  key={index} 
                                  index={index} 
                                  className="w-12 h-14 text-xl font-bold border-2 rounded-xl"
                                />
                              ))}
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                        <Button
                          onClick={handleVerifyOtp}
                          className="w-full h-12 text-base font-semibold"
                          disabled={loading || otpCode.length !== 6}
                          data-testid="button-verify-otp"
                        >
                          {loading && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
                          <CheckCircle2 className="h-5 w-5 mr-2" />
                          Xác thực OTP
                        </Button>
                        <Button
                          variant="link"
                          onClick={resendOtp}
                          className="w-full text-muted-foreground"
                          disabled={loading}
                          data-testid="button-resend-otp"
                        >
                          Gửi lại mã OTP
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="signup">
                    {!showOtpInput ? (
                      <form onSubmit={handleSignUp} className="space-y-5">
                        <div className="space-y-2">
                          <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                            <Input
                              id="signup-email"
                              type="email"
                              placeholder="your@email.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pl-11 h-12 bg-background/50 text-base"
                              required
                              data-testid="input-signup-email"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="signup-password" className="text-sm font-medium">Mật khẩu</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 text-xs text-primary hover:text-primary/80 font-medium"
                              onClick={() => setShowPasswordGenerator(!showPasswordGenerator)}
                              data-testid="button-password-generator"
                            >
                              <Wand2 className="h-3 w-3 mr-1" />
                              Tạo mật khẩu mạnh
                            </Button>
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                            <Input
                              id="signup-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="pl-11 pr-11 h-12 bg-background/50 text-base"
                              required
                              data-testid="input-signup-password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <Eye className="h-5 w-5 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        <Collapsible open={showPasswordGenerator} onOpenChange={setShowPasswordGenerator}>
                          <CollapsibleContent>
                            <PasswordGenerator onSelect={handlePasswordGenerated} />
                          </CollapsibleContent>
                        </Collapsible>
                        
                        <div className="space-y-2">
                          <Label htmlFor="signup-confirm" className="text-sm font-medium">Xác nhận mật khẩu</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                            <Input
                              id="signup-confirm"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="pl-11 pr-11 h-12 bg-background/50 text-base"
                              required
                              data-testid="input-confirm-password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <Eye className="h-5 w-5 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                          <span>Bằng việc đăng ký, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi.</span>
                        </div>

                        <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading} data-testid="button-signup">
                          {loading && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
                          Tạo tài khoản
                        </Button>
                      </form>
                    ) : (
                      <div className="space-y-5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowOtpInput(false);
                            setOtpCode("");
                          }}
                          className="mb-2"
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Quay lại
                        </Button>
                        <div className="text-center space-y-3 py-4">
                          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                            <Mail className="w-8 h-8 text-green-500" />
                          </div>
                          <p className="text-muted-foreground">
                            Xác thực email để hoàn tất đăng ký
                          </p>
                          <p className="font-semibold text-lg">{pendingSignupEmail}</p>
                        </div>
                        <div className="flex justify-center py-4">
                          <InputOTP
                            value={otpCode}
                            onChange={setOtpCode}
                            maxLength={6}
                          >
                            <InputOTPGroup className="gap-2">
                              {[0, 1, 2, 3, 4, 5].map((index) => (
                                <InputOTPSlot 
                                  key={index} 
                                  index={index} 
                                  className="w-12 h-14 text-xl font-bold border-2 rounded-xl"
                                />
                              ))}
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                        <Button
                          onClick={handleVerifyOtp}
                          className="w-full h-12 text-base font-semibold"
                          disabled={loading || otpCode.length !== 6}
                        >
                          {loading && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
                          <CheckCircle2 className="h-5 w-5 mr-2" />
                          Xác thực & Tạo tài khoản
                        </Button>
                        <Button
                          variant="link"
                          onClick={resendOtp}
                          className="w-full text-muted-foreground"
                          disabled={loading}
                        >
                          Gửi lại mã OTP
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </AuthCard>

            <p className="text-center mt-8 text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors font-medium" data-testid="link-back-home">
                ← Quay về trang chủ
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
