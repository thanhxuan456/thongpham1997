import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, ArrowLeft, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Auth = () => {
  const navigate = useNavigate();
  const { user, signUp, signInWithOtp, verifyOtp, signInWithPassword, resetPassword } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

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
    const { error } = await signUp(email, password);
    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Đăng ký thất bại",
        description: error.message,
      });
    } else {
      toast({
        title: "Đăng ký thành công!",
        description: "Vui lòng kiểm tra email để xác thực tài khoản.",
      });
      setActiveTab("login");
    }
  };

  const handleLoginWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signInWithOtp(email);
    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Gửi OTP thất bại",
        description: error.message,
      });
    } else {
      setShowOtpInput(true);
      toast({
        title: "Đã gửi mã OTP",
        description: "Vui lòng kiểm tra email của bạn.",
      });
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) return;
    
    setLoading(true);
    const { error } = await verifyOtp(email, otpCode);
    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Xác thực OTP thất bại",
        description: error.message,
      });
    } else {
      toast({
        title: "Đăng nhập thành công!",
      });
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

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-background">
        <Header onCartClick={() => {}} onSearch={() => {}} searchQuery="" />
        <main className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto">
            <Card className="border-border/50">
              <CardHeader>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowForgotPassword(false)}
                  className="w-fit mb-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại
                </Button>
                <CardTitle className="text-2xl">Quên mật khẩu</CardTitle>
                <CardDescription>
                  Nhập email của bạn để nhận link đặt lại mật khẩu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Gửi link đặt lại mật khẩu
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onCartClick={() => {}} onSearch={() => {}} searchQuery="" />
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <Card className="border-border/50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Chào mừng bạn</CardTitle>
              <CardDescription>
                Đăng nhập hoặc tạo tài khoản mới
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Đăng nhập</TabsTrigger>
                  <TabsTrigger value="signup">Đăng ký</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  {!showOtpInput ? (
                    <>
                      {/* Login with Password */}
                      <form onSubmit={handleLoginWithPassword} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="login-email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="login-email"
                              type="email"
                              placeholder="your@email.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="login-password">Mật khẩu</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="login-password"
                              type="password"
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Đăng nhập
                        </Button>
                      </form>

                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-2 text-muted-foreground">hoặc</span>
                        </div>
                      </div>

                      {/* Login with OTP */}
                      <form onSubmit={handleSendOtp} className="space-y-4">
                        <Button type="submit" variant="outline" className="w-full" disabled={loading || !email}>
                          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          <Mail className="h-4 w-4 mr-2" />
                          Đăng nhập bằng OTP Email
                        </Button>
                      </form>

                      <Button
                        variant="link"
                        className="w-full text-muted-foreground"
                        onClick={() => setShowForgotPassword(true)}
                      >
                        Quên mật khẩu?
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-4">
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
                      <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Chúng tôi đã gửi mã OTP 6 số đến
                        </p>
                        <p className="font-medium">{email}</p>
                      </div>
                      <div className="flex justify-center">
                        <InputOTP
                          value={otpCode}
                          onChange={setOtpCode}
                          maxLength={6}
                        >
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
                      <Button
                        onClick={handleVerifyOtp}
                        className="w-full"
                        disabled={loading || otpCode.length !== 6}
                      >
                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Xác thực OTP
                      </Button>
                      <Button
                        variant="link"
                        onClick={handleSendOtp}
                        className="w-full text-muted-foreground"
                        disabled={loading}
                      >
                        Gửi lại mã OTP
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Mật khẩu</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Xác nhận mật khẩu</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-confirm"
                          type="password"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Tạo tài khoản
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
