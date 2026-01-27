import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Download, 
  Settings, 
  LogOut, 
  Shield, 
  Monitor, 
  Smartphone, 
  Globe,
  Clock,
  Package,
  ChevronRight,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Eye,
  FileDown,
  ShoppingBag,
  CreditCard,
  TrendingUp,
  Calendar,
  Star,
  Heart,
  Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";

interface UserDownload {
  id: string;
  theme_id: string | null;
  theme_name: string;
  download_url: string | null;
  download_count: number;
  max_downloads: number;
  expires_at: string | null;
  created_at: string;
  order_id: string;
}

interface UserSession {
  id: string;
  device_info: string | null;
  ip_address: string | null;
  user_agent: string | null;
  is_current: boolean;
  last_active_at: string;
  created_at: string;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  payment_method: string | null;
}

interface UserProfile {
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const [downloads, setDownloads] = useState<UserDownload[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchUserData();
    }
  }, [user, authLoading, navigate]);

  const fetchUserData = async () => {
    setLoading(true);
    
    const [downloadsRes, sessionsRes, ordersRes, profileRes] = await Promise.all([
      supabase
        .from("user_downloads")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("user_sessions")
        .select("*")
        .eq("user_id", user!.id)
        .order("last_active_at", { ascending: false }),
      supabase
        .from("orders")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("full_name, avatar_url, email")
        .eq("user_id", user!.id)
        .maybeSingle()
    ]);

    if (downloadsRes.data) setDownloads(downloadsRes.data);
    if (sessionsRes.data) setSessions(sessionsRes.data);
    if (ordersRes.data) setOrders(ordersRes.data);
    if (profileRes.data) setProfile(profileRes.data);
    
    setLoading(false);
  };

  const handleDownload = async (download: UserDownload) => {
    if (download.download_count >= download.max_downloads) {
      toast({
        variant: "destructive",
        title: "Đã hết lượt tải",
        description: "Bạn đã sử dụng hết số lượt tải cho phép",
      });
      return;
    }

    await supabase
      .from("user_downloads")
      .update({ download_count: download.download_count + 1 })
      .eq("id", download.id);

    if (download.download_url) {
      window.open(download.download_url, "_blank");
    } else {
      toast({
        title: "Đang chuẩn bị tải xuống",
        description: "Link tải sẽ được gửi qua email của bạn",
      });
    }

    fetchUserData();
  };

  const handleRevokeSession = async (sessionId: string) => {
    const { error } = await supabase
      .from("user_sessions")
      .delete()
      .eq("id", sessionId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể đăng xuất phiên này",
      });
    } else {
      toast({
        title: "Đã đăng xuất",
        description: "Phiên đăng nhập đã được đăng xuất",
      });
      fetchUserData();
    }
  };

  const handleRevokeAllSessions = async () => {
    const { error } = await supabase
      .from("user_sessions")
      .delete()
      .eq("user_id", user!.id)
      .neq("is_current", true);

    if (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể đăng xuất các phiên khác",
      });
    } else {
      toast({
        title: "Đã đăng xuất tất cả",
        description: "Tất cả các phiên khác đã được đăng xuất",
      });
      fetchUserData();
    }
  };

  const getDeviceIcon = (userAgent: string | null) => {
    if (!userAgent) return <Globe className="h-5 w-5" />;
    const ua = userAgent.toLowerCase();
    if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
      return <Smartphone className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  };

  const getDeviceName = (userAgent: string | null) => {
    if (!userAgent) return "Không xác định";
    const ua = userAgent.toLowerCase();
    
    if (ua.includes("iphone")) return "iPhone";
    if (ua.includes("ipad")) return "iPad";
    if (ua.includes("android")) return "Android";
    if (ua.includes("windows")) return "Windows PC";
    if (ua.includes("macintosh") || ua.includes("mac os")) return "Mac";
    if (ua.includes("linux")) return "Linux";
    
    return "Trình duyệt web";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Hoàn tất</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Chờ xử lý</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Đã hủy</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Calculate stats
  const totalSpent = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total_amount, 0);
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const totalDownloads = downloads.reduce((sum, d) => sum + d.download_count, 0);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 pt-20">
        {/* Profile Header */}
        <AnimatedSection animation="fade-up">
          <Card className="mb-8 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20" />
            <CardContent className="relative pt-0">
              <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16">
                <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 pb-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-bold text-foreground">
                        {profile?.full_name || 'Người dùng'}
                      </h1>
                      <p className="text-muted-foreground">{user?.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="gap-1">
                          <Calendar className="h-3 w-3" />
                          Tham gia {formatDate(user?.created_at || new Date().toISOString()).split(' ')[0]}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Edit className="h-4 w-4" />
                        Chỉnh sửa
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => signOut()} className="gap-2">
                        <LogOut className="h-4 w-4" />
                        Đăng xuất
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Stats Cards */}
        <AnimatedSection animation="fade-up" delay={100}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{completedOrders}</p>
                    <p className="text-xs text-muted-foreground">Đơn hoàn tất</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{formatPrice(totalSpent)}</p>
                    <p className="text-xs text-muted-foreground">Tổng chi tiêu</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <Download className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{totalDownloads}</p>
                    <p className="text-xs text-muted-foreground">Lượt tải</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{downloads.length}</p>
                    <p className="text-xs text-muted-foreground">Themes sở hữu</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </AnimatedSection>

        <Tabs defaultValue="downloads" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
            <TabsTrigger value="downloads" className="gap-2">
              <Download className="h-4 w-4" />
              Themes của tôi
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <Package className="h-4 w-4" />
              Đơn hàng
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Bảo mật
            </TabsTrigger>
          </TabsList>

          {/* Downloads Tab */}
          <TabsContent value="downloads" className="space-y-4">
            <AnimatedSection animation="fade-up">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileDown className="h-5 w-5 text-primary" />
                    Themes đã mua
                  </CardTitle>
                  <CardDescription>
                    Tải xuống các themes bạn đã mua. Mỗi theme có giới hạn 5 lượt tải.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {downloads.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Download className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">Chưa có themes nào</h3>
                      <p className="text-muted-foreground mb-4">Bạn chưa mua themes nào. Hãy khám phá kho themes của chúng tôi!</p>
                      <Button onClick={() => navigate("/")}>
                        Khám phá themes
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {downloads.map((download) => (
                        <div 
                          key={download.id}
                          className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Package className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground">{download.theme_name}</h4>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Download className="h-3 w-3" />
                                  {download.download_count}/{download.max_downloads} lượt
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(download.created_at)}
                                </span>
                              </div>
                              <Progress 
                                value={(download.download_count / download.max_downloads) * 100} 
                                className="h-1 mt-2 w-32"
                              />
                            </div>
                          </div>
                          <Button 
                            onClick={() => handleDownload(download)}
                            disabled={download.download_count >= download.max_downloads}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Tải xuống
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedSection>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <AnimatedSection animation="fade-up">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Lịch sử đơn hàng
                  </CardTitle>
                  <CardDescription>
                    Xem lại các đơn hàng bạn đã đặt
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">Chưa có đơn hàng</h3>
                      <p className="text-muted-foreground mb-4">Bạn chưa đặt đơn hàng nào.</p>
                      <Button onClick={() => navigate("/")}>
                        Mua sắm ngay
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div 
                          key={order.id}
                          className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Package className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground">
                                Đơn hàng #{order.id.slice(0, 8).toUpperCase()}
                              </h4>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span>{formatDate(order.created_at)}</span>
                                <span>•</span>
                                <span className="font-medium text-foreground">{formatPrice(order.total_amount)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {getStatusBadge(order.status)}
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedSection>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <AnimatedSection animation="fade-up">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Quản lý phiên đăng nhập
                      </CardTitle>
                      <CardDescription>
                        Xem và quản lý các thiết bị đang đăng nhập vào tài khoản của bạn
                      </CardDescription>
                    </div>
                    {sessions.length > 1 && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={handleRevokeAllSessions}
                      >
                        Đăng xuất tất cả
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {sessions.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Monitor className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">Không có phiên nào</h3>
                      <p className="text-muted-foreground">Phiên hiện tại của bạn là phiên duy nhất</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sessions.map((session) => (
                        <div 
                          key={session.id}
                          className={`flex items-center justify-between p-4 rounded-xl border ${
                            session.is_current 
                              ? "bg-primary/5 border-primary/20" 
                              : "bg-muted/50 border-border"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              session.is_current ? "bg-primary/10" : "bg-muted"
                            }`}>
                              {getDeviceIcon(session.user_agent)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-foreground">
                                  {getDeviceName(session.user_agent)}
                                </h4>
                                {session.is_current && (
                                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                                    Phiên hiện tại
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                {session.ip_address && (
                                  <span>IP: {session.ip_address}</span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(session.last_active_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                          {!session.is_current && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => handleRevokeSession(session.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Security Settings */}
            <AnimatedSection animation="fade-up" delay={100}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Cài đặt bảo mật
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <button 
                    onClick={() => navigate("/reset-password")}
                    className="w-full flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-primary" />
                      <div className="text-left">
                        <h4 className="font-medium text-foreground">Đổi mật khẩu</h4>
                        <p className="text-sm text-muted-foreground">Cập nhật mật khẩu tài khoản</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                </CardContent>
              </Card>
            </AnimatedSection>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
