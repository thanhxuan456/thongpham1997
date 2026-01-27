import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock, Loader2, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Header onCartClick={() => {}} onSearch={() => {}} searchQuery="" />
        <main className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto">
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold">Đặt lại mật khẩu thành công!</h2>
                  <p className="text-muted-foreground">
                    Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập với mật khẩu mới.
                  </p>
                  <Button onClick={() => navigate("/auth")} className="w-full">
                    Đăng nhập ngay
                  </Button>
                </div>
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
              <CardTitle className="text-2xl">Đặt lại mật khẩu</CardTitle>
              <CardDescription>
                Nhập mật khẩu mới cho tài khoản của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
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
                      className="pl-10"
                      required
                    />
                  </div>
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
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Đặt lại mật khẩu
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;
