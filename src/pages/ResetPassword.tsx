import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock, Loader2, CheckCircle, Shield, KeyRound, ArrowRight } from "lucide-react";
import authBgVideo from "@/assets/auth-background.mp4";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { updatePassword, session } = useAuth();
  const { toast } = useToast();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if user came from password reset email
    if (!session) {
      // They might be in the process of setting a new password
      // The session will be established after Supabase processes the reset link
    }
  }, [session]);

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
    const { error } = await updatePassword(password);
    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Đặt lại mật khẩu thất bại",
        description: error.message,
      });
    } else {
      setSuccess(true);
      toast({
        title: "Đặt lại mật khẩu thành công!",
        description: "Bạn có thể đăng nhập với mật khẩu mới.",
      });
    }
  };

  const AuthCard = ({ children }: { children: React.ReactNode }) => (
    <Card className="border-border/30 bg-card/80 backdrop-blur-xl shadow-2xl">
      {children}
    </Card>
  );

  if (success) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
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
        <div className="relative z-10 w-full max-w-md mx-auto px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="text-xl font-bold text-primary-foreground">T</span>
            </div>
            <span className="text-2xl font-bold text-foreground">ThemeVN</span>
          </Link>

          <AuthCard>
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-6">
                {/* Success Icon */}
                <div className="relative mx-auto w-20 h-20">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full opacity-20 animate-pulse" />
                  <div className="relative w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                    <CheckCircle className="h-10 w-10 text-white" />
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

          {/* Back to home */}
          <p className="text-center mt-6 text-muted-foreground text-sm">
            <Link to="/" className="hover:text-primary transition-colors">
              ← Quay về trang chủ
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
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
              an toàn & bảo mật
            </span>
          </h1>

          <p className="text-lg text-muted-foreground mb-10 max-w-md">
            Tạo mật khẩu mới mạnh mẽ để bảo vệ tài khoản của bạn. Chúng tôi khuyến khích sử dụng mật khẩu có ít nhất 8 ký tự.
          </p>

          {/* Security Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <span className="text-foreground font-medium">Mã hóa end-to-end</span>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <KeyRound className="h-6 w-6 text-primary" />
              </div>
              <span className="text-foreground font-medium">Bảo mật mật khẩu cao</span>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <span className="text-foreground font-medium">Xác thực hai lớp</span>
            </div>
          </div>
        </div>

        {/* Right Side - Reset Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <Link to="/" className="flex lg:hidden items-center justify-center gap-2 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                <span className="text-xl font-bold text-primary-foreground">T</span>
              </div>
              <span className="text-2xl font-bold text-foreground">ThemeVN</span>
            </Link>

            <AuthCard>
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
                  <KeyRound className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl">Đặt lại mật khẩu</CardTitle>
                <CardDescription>
                  Nhập mật khẩu mới cho tài khoản của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Mật khẩu mới</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                    <p className="text-xs text-muted-foreground">Mật khẩu phải có ít nhất 6 ký tự</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-new-password">Xác nhận mật khẩu mới</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-new-password"
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
                        <div className={`h-1 flex-1 rounded-full ${password.length >= 6 ? 'bg-green-500' : 'bg-muted'}`} />
                        <div className={`h-1 flex-1 rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-muted'}`} />
                        <div className={`h-1 flex-1 rounded-full ${password.length >= 10 && /[A-Z]/.test(password) ? 'bg-green-500' : 'bg-muted'}`} />
                        <div className={`h-1 flex-1 rounded-full ${password.length >= 12 && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password) ? 'bg-green-500' : 'bg-muted'}`} />
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

                {/* Links */}
                <div className="mt-6 text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Bạn nhớ mật khẩu?{" "}
                    <Link to="/auth" className="text-primary hover:underline font-medium">
                      Đăng nhập
                    </Link>
                  </p>
                </div>
              </CardContent>
            </AuthCard>

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
  );
};

export default ResetPassword;
