import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { 
  Settings, 
  Bell, 
  Shield, 
  Database, 
  Palette, 
  Globe, 
  Mail,
  CreditCard,
  Store,
  FileText,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Moon,
  Sun,
  Monitor,
  Copy,
  ExternalLink,
  Key,
  Eye,
  EyeOff,
  Loader2,
  QrCode
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Vietnam banks list for VietQR
const vietnamBanks = [
  { code: "VCB", shortName: "Vietcombank", name: "Ngân hàng TMCP Ngoại Thương Việt Nam" },
  { code: "TCB", shortName: "Techcombank", name: "Ngân hàng TMCP Kỹ Thương Việt Nam" },
  { code: "MB", shortName: "MB Bank", name: "Ngân hàng TMCP Quân Đội" },
  { code: "VPB", shortName: "VPBank", name: "Ngân hàng TMCP Việt Nam Thịnh Vượng" },
  { code: "ACB", shortName: "ACB", name: "Ngân hàng TMCP Á Châu" },
  { code: "TPB", shortName: "TPBank", name: "Ngân hàng TMCP Tiên Phong" },
  { code: "STB", shortName: "Sacombank", name: "Ngân hàng TMCP Sài Gòn Thương Tín" },
  { code: "HDB", shortName: "HDBank", name: "Ngân hàng TMCP Phát Triển TP.HCM" },
  { code: "VIB", shortName: "VIB", name: "Ngân hàng TMCP Quốc Tế Việt Nam" },
  { code: "SHB", shortName: "SHB", name: "Ngân hàng TMCP Sài Gòn - Hà Nội" },
  { code: "EIB", shortName: "Eximbank", name: "Ngân hàng TMCP Xuất Nhập Khẩu" },
  { code: "MSB", shortName: "MSB", name: "Ngân hàng TMCP Hàng Hải" },
  { code: "OCB", shortName: "OCB", name: "Ngân hàng TMCP Phương Đông" },
  { code: "LPB", shortName: "LienVietPostBank", name: "Ngân hàng TMCP Bưu Điện Liên Việt" },
  { code: "BIDV", shortName: "BIDV", name: "Ngân hàng TMCP Đầu Tư & Phát Triển" },
  { code: "CTG", shortName: "VietinBank", name: "Ngân hàng TMCP Công Thương Việt Nam" },
  { code: "AGR", shortName: "Agribank", name: "Ngân hàng Nông nghiệp & PTNT Việt Nam" },
  { code: "SCB", shortName: "SCB", name: "Ngân hàng TMCP Sài Gòn" },
  { code: "NAB", shortName: "Nam A Bank", name: "Ngân hàng TMCP Nam Á" },
  { code: "BAB", shortName: "Bac A Bank", name: "Ngân hàng TMCP Bắc Á" },
  { code: "CAKE", shortName: "CAKE", name: "Ngân hàng Số CAKE by VPBank" },
  { code: "Ubank", shortName: "Ubank", name: "Ngân hàng số Ubank by VPBank" },
];

interface Setting {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
  is_secret: boolean;
}

const AdminSettings = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  
  // Local state for form values
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  // Notification settings
  const [notifications, setNotifications] = useState({
    newOrder: true,
    newUser: false,
    lowStock: true,
    newsletter: true,
    systemAlerts: true,
  });

  // Payment settings
  const [paymentSettings, setPaymentSettings] = useState({
    bankTransfer: true,
    momo: true,
    vnpay: false,
    zalopay: false,
  });

  // Fetch settings from database
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .order("key");
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải cài đặt",
      });
    } else {
      setSettings(data || []);
      // Initialize form values
      const values: Record<string, string> = {};
      data?.forEach((s) => {
        values[s.key] = s.value || "";
      });
      setFormValues(values);
    }
    setLoading(false);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    
    // Update each changed setting
    const updates = Object.entries(formValues).map(async ([key, value]) => {
      const original = settings.find(s => s.key === key);
      if (original && original.value !== value) {
        return supabase
          .from("settings")
          .update({ value })
          .eq("key", key);
      }
      return Promise.resolve();
    });

    await Promise.all(updates);
    
    toast({
      title: "Đã lưu cài đặt",
      description: "Các thay đổi đã được lưu thành công",
    });
    
    await fetchSettings();
    setSaving(false);
  };

  const updateFormValue = (key: string, value: string) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Đã sao chép",
      description: "Đã sao chép vào clipboard",
    });
  };

  // Group settings by category
  const apiSettings = settings.filter(s => 
    s.key.includes('API_KEY') || s.key.includes('PIXEL') || s.key.includes('ANALYTICS')
  );
  const paymentApiSettings = settings.filter(s => 
    s.key.includes('MOMO') || s.key.includes('VNPAY') || s.key.includes('ZALOPAY')
  );
  const storeSettings = settings.filter(s => 
    s.key.startsWith('STORE_') || s.key === 'CURRENCY' || s.key === 'LANGUAGE'
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Cài đặt</h1>
            <p className="text-muted-foreground mt-1">
              Quản lý toàn bộ cài đặt hệ thống
            </p>
          </div>
          <Button onClick={handleSaveSettings} className="gap-2" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Lưu tất cả
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 h-auto gap-2 bg-muted/50 p-2">
            <TabsTrigger value="general" className="gap-2 data-[state=active]:bg-background">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Chung</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="gap-2 data-[state=active]:bg-background">
              <Key className="h-4 w-4" />
              <span className="hidden sm:inline">API Keys</span>
            </TabsTrigger>
            <TabsTrigger value="store" className="gap-2 data-[state=active]:bg-background">
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">Cửa hàng</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-background">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Thông báo</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="gap-2 data-[state=active]:bg-background">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Thanh toán</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 data-[state=active]:bg-background">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Bảo mật</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-2 data-[state=active]:bg-background">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Hệ thống</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Account Info */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Thông tin tài khoản
                  </CardTitle>
                  <CardDescription>
                    Thông tin tài khoản admin hiện tại
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <div className="flex gap-2">
                      <Input value={user?.email || ""} disabled className="flex-1" />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => copyToClipboard(user?.email || "")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>ID</Label>
                    <div className="flex gap-2">
                      <Input value={user?.id || ""} disabled className="font-mono text-xs flex-1" />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => copyToClipboard(user?.id || "")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                    <Badge variant="outline">
                      Đang hoạt động
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Appearance */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" />
                    Giao diện
                  </CardTitle>
                  <CardDescription>
                    Tùy chỉnh giao diện hệ thống
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Label>Chế độ hiển thị</Label>
                    <div className="flex gap-2">
                      <Button 
                        variant={theme === "light" ? "default" : "outline"} 
                        className="flex-1 gap-2"
                        onClick={() => theme === "dark" && toggleTheme()}
                      >
                        <Sun className="h-4 w-4" />
                        Sáng
                      </Button>
                      <Button 
                        variant={theme === "dark" ? "default" : "outline"} 
                        className="flex-1 gap-2"
                        onClick={() => theme === "light" && toggleTheme()}
                      >
                        <Moon className="h-4 w-4" />
                        Tối
                      </Button>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <Label>Ngôn ngữ</Label>
                    <Select 
                      value={formValues['LANGUAGE'] || 'vi'} 
                      onValueChange={(value) => updateFormValue('LANGUAGE', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vi">🇻🇳 Tiếng Việt</SelectItem>
                        <SelectItem value="en">🇺🇸 English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* SEO Settings */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Cài đặt SEO & Meta Tags
                </CardTitle>
                <CardDescription>
                  Tối ưu hóa website cho công cụ tìm kiếm
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tiêu đề Website (Title Tag)</Label>
                    <Input 
                      value={formValues['META_TITLE'] || 'ThemeVN - Nền tảng WordPress Themes hàng đầu Việt Nam'}
                      onChange={(e) => updateFormValue('META_TITLE', e.target.value)}
                      placeholder="ThemeVN - Nền tảng WordPress Themes hàng đầu Việt Nam"
                      maxLength={60}
                    />
                    <p className="text-xs text-muted-foreground">
                      Tối đa 60 ký tự. Hiện tại: {(formValues['META_TITLE'] || 'ThemeVN - Nền tảng WordPress Themes hàng đầu Việt Nam').length}/60
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Mô tả Website (Meta Description)</Label>
                    <Textarea 
                      value={formValues['META_DESCRIPTION'] || 'Khám phá hàng trăm WordPress themes chất lượng cao được thiết kế chuyên nghiệp, tối ưu SEO và tốc độ tải nhanh.'}
                      onChange={(e) => updateFormValue('META_DESCRIPTION', e.target.value)}
                      placeholder="Mô tả ngắn gọn về website..."
                      rows={3}
                      maxLength={160}
                    />
                    <p className="text-xs text-muted-foreground">
                      Tối đa 160 ký tự. Hiện tại: {(formValues['META_DESCRIPTION'] || 'Khám phá hàng trăm WordPress themes chất lượng cao được thiết kế chuyên nghiệp, tối ưu SEO và tốc độ tải nhanh.').length}/160
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Từ khóa (Meta Keywords)</Label>
                    <Input 
                      value={formValues['META_KEYWORDS'] || 'wordpress themes, theme wordpress vietnam, mua theme wordpress'}
                      onChange={(e) => updateFormValue('META_KEYWORDS', e.target.value)}
                      placeholder="từ khóa 1, từ khóa 2, từ khóa 3..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Các từ khóa cách nhau bởi dấu phẩy
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Google Analytics ID</Label>
                    <Input 
                      value={formValues['GOOGLE_ANALYTICS_ID'] || ''}
                      onChange={(e) => updateFormValue('GOOGLE_ANALYTICS_ID', e.target.value)}
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Facebook Pixel ID</Label>
                    <Input 
                      value={formValues['FACEBOOK_PIXEL_ID'] || ''}
                      onChange={(e) => updateFormValue('FACEBOOK_PIXEL_ID', e.target.value)}
                      placeholder="XXXXXXXXXXXXXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Google Tag Manager ID</Label>
                    <Input 
                      value={formValues['GTM_ID'] || ''}
                      onChange={(e) => updateFormValue('GTM_ID', e.target.value)}
                      placeholder="GTM-XXXXXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Canonical URL</Label>
                    <Input 
                      value={formValues['CANONICAL_URL'] || ''}
                      onChange={(e) => updateFormValue('CANONICAL_URL', e.target.value)}
                      placeholder="https://themevn.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys Settings */}
          <TabsContent value="api" className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" />
                  API Keys
                </CardTitle>
                <CardDescription>
                  Quản lý các API keys cho dịch vụ bên ngoài. API keys được mã hóa và bảo mật.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Service */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Service (Resend)
                  </h3>
                  <div className="space-y-2">
                    <Label>Resend API Key</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input 
                          type={showSecrets['RESEND_API_KEY'] ? 'text' : 'password'}
                          value={formValues['RESEND_API_KEY'] || ''}
                          onChange={(e) => updateFormValue('RESEND_API_KEY', e.target.value)}
                          placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                          onClick={() => toggleSecretVisibility('RESEND_API_KEY')}
                        >
                          {showSecrets['RESEND_API_KEY'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <Button variant="outline" asChild>
                        <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Lấy API key tại <a href="https://resend.com/api-keys" target="_blank" className="text-primary hover:underline">resend.com/api-keys</a>
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Payment APIs */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment Gateway APIs
                  </h3>
                  
                  {/* MoMo */}
                  <div className="p-4 rounded-lg border border-border/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-pink-500/10 flex items-center justify-center">
                          <span className="text-pink-500 font-bold text-sm">M</span>
                        </div>
                        <span className="font-medium">MoMo</span>
                      </div>
                      <Badge variant="outline" className={paymentSettings.momo ? "bg-green-500/10 text-green-500" : ""}>
                        {paymentSettings.momo ? "Đang bật" : "Tắt"}
                      </Badge>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Partner Code</Label>
                        <Input 
                          type={showSecrets['MOMO_PARTNER_CODE'] ? 'text' : 'password'}
                          value={formValues['MOMO_PARTNER_CODE'] || ''}
                          onChange={(e) => updateFormValue('MOMO_PARTNER_CODE', e.target.value)}
                          placeholder="MOMOXXX"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Access Key</Label>
                        <div className="relative">
                          <Input 
                            type={showSecrets['MOMO_ACCESS_KEY'] ? 'text' : 'password'}
                            value={formValues['MOMO_ACCESS_KEY'] || ''}
                            onChange={(e) => updateFormValue('MOMO_ACCESS_KEY', e.target.value)}
                            placeholder="xxxxxxxx"
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full"
                            onClick={() => toggleSecretVisibility('MOMO_ACCESS_KEY')}
                          >
                            {showSecrets['MOMO_ACCESS_KEY'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* VNPay */}
                  <div className="p-4 rounded-lg border border-border/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center">
                          <span className="text-blue-500 font-bold text-sm">VN</span>
                        </div>
                        <span className="font-medium">VNPay</span>
                      </div>
                      <Badge variant="outline" className={paymentSettings.vnpay ? "bg-green-500/10 text-green-500" : ""}>
                        {paymentSettings.vnpay ? "Đang bật" : "Tắt"}
                      </Badge>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>TMN Code</Label>
                        <Input 
                          type={showSecrets['VNPAY_TMN_CODE'] ? 'text' : 'password'}
                          value={formValues['VNPAY_TMN_CODE'] || ''}
                          onChange={(e) => updateFormValue('VNPAY_TMN_CODE', e.target.value)}
                          placeholder="XXXXXXXX"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Hash Secret</Label>
                        <div className="relative">
                          <Input 
                            type={showSecrets['VNPAY_HASH_SECRET'] ? 'text' : 'password'}
                            value={formValues['VNPAY_HASH_SECRET'] || ''}
                            onChange={(e) => updateFormValue('VNPAY_HASH_SECRET', e.target.value)}
                            placeholder="xxxxxxxxxxxxxxxx"
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full"
                            onClick={() => toggleSecretVisibility('VNPAY_HASH_SECRET')}
                          >
                            {showSecrets['VNPAY_HASH_SECRET'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ZaloPay */}
                  <div className="p-4 rounded-lg border border-border/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-blue-600/10 flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-sm">Z</span>
                        </div>
                        <span className="font-medium">ZaloPay</span>
                      </div>
                      <Badge variant="outline" className={paymentSettings.zalopay ? "bg-green-500/10 text-green-500" : ""}>
                        {paymentSettings.zalopay ? "Đang bật" : "Tắt"}
                      </Badge>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>App ID</Label>
                        <Input 
                          value={formValues['ZALOPAY_APP_ID'] || ''}
                          onChange={(e) => updateFormValue('ZALOPAY_APP_ID', e.target.value)}
                          placeholder="XXXX"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Key 1</Label>
                        <div className="relative">
                          <Input 
                            type={showSecrets['ZALOPAY_KEY1'] ? 'text' : 'password'}
                            value={formValues['ZALOPAY_KEY1'] || ''}
                            onChange={(e) => updateFormValue('ZALOPAY_KEY1', e.target.value)}
                            placeholder="xxxxxxxxxxxxxxxx"
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full"
                            onClick={() => toggleSecretVisibility('ZALOPAY_KEY1')}
                          >
                            {showSecrets['ZALOPAY_KEY1'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Store Settings */}
          <TabsContent value="store" className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary" />
                  Thông tin cửa hàng
                </CardTitle>
                <CardDescription>
                  Cấu hình thông tin cơ bản của cửa hàng
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Tên cửa hàng</Label>
                    <Input 
                      value={formValues['STORE_NAME'] || ''}
                      onChange={(e) => updateFormValue('STORE_NAME', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email liên hệ</Label>
                    <Input 
                      type="email"
                      value={formValues['STORE_EMAIL'] || ''}
                      onChange={(e) => updateFormValue('STORE_EMAIL', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Số điện thoại</Label>
                    <Input 
                      value={formValues['STORE_PHONE'] || ''}
                      onChange={(e) => updateFormValue('STORE_PHONE', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Đơn vị tiền tệ</Label>
                    <Select 
                      value={formValues['CURRENCY'] || 'VND'} 
                      onValueChange={(value) => updateFormValue('CURRENCY', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VND">🇻🇳 VND - Việt Nam Đồng</SelectItem>
                        <SelectItem value="USD">🇺🇸 USD - US Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Địa chỉ</Label>
                  <Textarea 
                    value={formValues['STORE_ADDRESS'] || ''}
                    onChange={(e) => updateFormValue('STORE_ADDRESS', e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Email Templates */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Email Templates
                </CardTitle>
                <CardDescription>
                  Quản lý mẫu email tự động
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { name: "Xác nhận đơn hàng", status: "active" },
                    { name: "Chào mừng thành viên", status: "active" },
                    { name: "Reset mật khẩu", status: "active" },
                    { name: "Thanh toán thành công", status: "draft" },
                    { name: "Đánh giá sản phẩm", status: "inactive" },
                    { name: "Khuyến mãi", status: "draft" },
                  ].map((template) => (
                    <div 
                      key={template.name}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{template.name}</span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={
                          template.status === "active" 
                            ? "bg-green-500/10 text-green-500 border-green-500/20" 
                            : template.status === "draft"
                            ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {template.status === "active" ? "Hoạt động" : template.status === "draft" ? "Nháp" : "Tắt"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Cài đặt thông báo
                </CardTitle>
                <CardDescription>
                  Quản lý các loại thông báo bạn muốn nhận
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { 
                    key: "newOrder", 
                    title: "Đơn hàng mới", 
                    desc: "Nhận thông báo khi có đơn hàng mới",
                    icon: CreditCard
                  },
                  { 
                    key: "newUser", 
                    title: "Người dùng mới", 
                    desc: "Nhận thông báo khi có người dùng đăng ký",
                    icon: Settings
                  },
                  { 
                    key: "lowStock", 
                    title: "Cảnh báo hệ thống", 
                    desc: "Nhận thông báo khi có vấn đề cần chú ý",
                    icon: AlertCircle
                  },
                  { 
                    key: "newsletter", 
                    title: "Bản tin", 
                    desc: "Nhận các bản tin và cập nhật mới nhất",
                    icon: Mail
                  },
                  { 
                    key: "systemAlerts", 
                    title: "Cảnh báo bảo mật", 
                    desc: "Nhận thông báo về các vấn đề bảo mật",
                    icon: Shield
                  },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-muted">
                        <item.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                    <Switch 
                      checked={notifications[item.key as keyof typeof notifications]}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, [item.key]: checked})
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Settings */}
          <TabsContent value="payment" className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Phương thức thanh toán
                </CardTitle>
                <CardDescription>
                  Bật/tắt các phương thức thanh toán
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { key: "bankTransfer", name: "Chuyển khoản ngân hàng", icon: "🏦" },
                    { key: "momo", name: "Ví MoMo", icon: "💳" },
                    { key: "vnpay", name: "VNPay", icon: "💳" },
                    { key: "zalopay", name: "ZaloPay", icon: "💳" },
                  ].map((method) => (
                    <div 
                      key={method.key}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{method.icon}</span>
                        <span className="font-medium">{method.name}</span>
                      </div>
                      <Switch 
                        checked={paymentSettings[method.key as keyof typeof paymentSettings]}
                        onCheckedChange={(checked) => 
                          setPaymentSettings({...paymentSettings, [method.key]: checked})
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bank Account Info with VietQR */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Thông tin tài khoản ngân hàng & VietQR</CardTitle>
                <CardDescription>
                  Thông tin tài khoản nhận thanh toán - Tự động tạo mã QR
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Ngân hàng *</Label>
                    <Select 
                      value={formValues['BANK_CODE'] || ''} 
                      onValueChange={(value) => {
                        updateFormValue('BANK_CODE', value);
                        // Auto-set bank name
                        const bank = vietnamBanks.find(b => b.code === value);
                        if (bank) updateFormValue('BANK_NAME', bank.name);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn ngân hàng" />
                      </SelectTrigger>
                      <SelectContent>
                        {vietnamBanks.map((bank) => (
                          <SelectItem key={bank.code} value={bank.code}>
                            <div className="flex items-center gap-2">
                              <span>{bank.shortName}</span>
                              <span className="text-muted-foreground text-xs">({bank.name})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Số tài khoản *</Label>
                    <Input 
                      value={formValues['BANK_ACCOUNT_NUMBER'] || ''}
                      onChange={(e) => updateFormValue('BANK_ACCOUNT_NUMBER', e.target.value)}
                      placeholder="1234567890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tên chủ tài khoản *</Label>
                    <Input 
                      value={formValues['BANK_ACCOUNT_NAME'] || ''}
                      onChange={(e) => updateFormValue('BANK_ACCOUNT_NAME', e.target.value.toUpperCase())}
                      placeholder="NGUYEN VAN A"
                      className="uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Chi nhánh</Label>
                    <Input 
                      value={formValues['BANK_BRANCH'] || ''}
                      onChange={(e) => updateFormValue('BANK_BRANCH', e.target.value)}
                      placeholder="Chi nhánh TP.HCM"
                    />
                  </div>
                </div>

                {/* VietQR Preview */}
                {formValues['BANK_CODE'] && formValues['BANK_ACCOUNT_NUMBER'] && (
                  <div className="mt-6 p-6 rounded-lg border border-border/50 bg-muted/30">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <QrCode className="h-5 w-5 text-primary" />
                      Preview mã QR thanh toán
                    </h4>
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <img 
                          src={`https://img.vietqr.io/image/${formValues['BANK_CODE']}-${formValues['BANK_ACCOUNT_NUMBER']}-compact2.png?amount=100000&addInfo=Thanh%20toan%20don%20hang&accountName=${encodeURIComponent(formValues['BANK_ACCOUNT_NAME'] || 'ACCOUNT')}`}
                          alt="VietQR Preview"
                          className="w-48 h-48 object-contain"
                          onError={(e) => {
                            e.currentTarget.src = 'https://img.vietqr.io/image/VCB-1234567890-compact2.png';
                          }}
                        />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="p-3 rounded bg-card border border-border/50">
                          <p className="text-sm text-muted-foreground">Ngân hàng</p>
                          <p className="font-medium">{formValues['BANK_NAME'] || vietnamBanks.find(b => b.code === formValues['BANK_CODE'])?.name}</p>
                        </div>
                        <div className="p-3 rounded bg-card border border-border/50">
                          <p className="text-sm text-muted-foreground">Số tài khoản</p>
                          <p className="font-medium font-mono">{formValues['BANK_ACCOUNT_NUMBER']}</p>
                        </div>
                        <div className="p-3 rounded bg-card border border-border/50">
                          <p className="text-sm text-muted-foreground">Chủ tài khoản</p>
                          <p className="font-medium">{formValues['BANK_ACCOUNT_NAME'] || '—'}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          * Mã QR sẽ tự động hiển thị số tiền và nội dung chuyển khoản tại trang checkout
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            {/* 2FA Section */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Xác thực hai yếu tố (2FA)
                </CardTitle>
                <CardDescription>
                  Bảo vệ tài khoản với xác thực hai yếu tố qua Email OTP
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 2FA Status */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Xác thực 2FA qua Email</p>
                      <p className="text-sm text-muted-foreground">
                        Mã OTP được gửi đến email khi đăng nhập
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={formValues['2FA_ENABLED'] === 'true' ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}>
                      {formValues['2FA_ENABLED'] === 'true' ? "Đang bật" : "Chưa bật"}
                    </Badge>
                    <Switch 
                      checked={formValues['2FA_ENABLED'] === 'true'}
                      onCheckedChange={(checked) => updateFormValue('2FA_ENABLED', checked ? 'true' : 'false')}
                    />
                  </div>
                </div>

                {/* 2FA Methods */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Phương thức xác thực</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className={`p-4 rounded-lg border transition-colors ${formValues['2FA_METHOD'] === 'email' ? 'border-primary bg-primary/5' : 'border-border/50'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-5 w-5 text-primary" />
                          <span className="font-medium">Email OTP</span>
                        </div>
                        <Switch 
                          checked={formValues['2FA_METHOD'] === 'email' || !formValues['2FA_METHOD']}
                          onCheckedChange={() => updateFormValue('2FA_METHOD', 'email')}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Gửi mã xác thực 6 số qua email mỗi lần đăng nhập
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg border transition-colors ${formValues['2FA_METHOD'] === 'totp' ? 'border-primary bg-primary/5' : 'border-border/50 opacity-60'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Key className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">Authenticator App</span>
                          <Badge variant="outline" className="text-xs">Sắp ra mắt</Badge>
                        </div>
                        <Switch disabled />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Sử dụng Google Authenticator hoặc Authy
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recovery Options */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Tùy chọn khôi phục</h4>
                  <div className="p-4 rounded-lg border border-border/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Email khôi phục</p>
                        <p className="text-sm text-muted-foreground">{user?.email || 'Chưa thiết lập'}</p>
                      </div>
                      <Button variant="outline" size="sm">Thay đổi</Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Mã khôi phục</p>
                        <p className="text-sm text-muted-foreground">10 mã dự phòng để truy cập khi mất 2FA</p>
                      </div>
                      <Button variant="outline" size="sm">Tạo mã mới</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Password & Sessions */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Bảo mật tài khoản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                  <div>
                    <p className="font-medium">Đổi mật khẩu</p>
                    <p className="text-sm text-muted-foreground">
                      Cập nhật mật khẩu định kỳ để bảo vệ tài khoản
                    </p>
                  </div>
                  <Button variant="outline">Đổi mật khẩu</Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                  <div>
                    <p className="font-medium">Phiên đăng nhập</p>
                    <p className="text-sm text-muted-foreground">
                      Quản lý các thiết bị đang đăng nhập
                    </p>
                  </div>
                  <Button variant="outline">Xem tất cả</Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                  <div>
                    <p className="font-medium">Đăng xuất tất cả thiết bị</p>
                    <p className="text-sm text-muted-foreground">
                      Đăng xuất khỏi tất cả thiết bị ngoại trừ thiết bị này
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">Đăng xuất tất cả</Button>
                </div>
              </CardContent>
            </Card>

            {/* Activity Log */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Lịch sử hoạt động gần đây</CardTitle>
                <CardDescription>
                  Các hoạt động bảo mật trong 7 ngày qua
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: "Đăng nhập thành công", time: "Hôm nay, 10:30", device: "Chrome / Windows", status: "success" },
                    { action: "Bật xác thực 2FA", time: "Hôm qua, 14:20", device: "Chrome / Windows", status: "success" },
                    { action: "Đổi mật khẩu", time: "3 ngày trước", device: "Safari / macOS", status: "success" },
                    { action: "Đăng nhập thất bại", time: "4 ngày trước", device: "Unknown / Unknown", status: "failed" },
                    { action: "Đăng nhập thành công", time: "5 ngày trước", device: "Chrome / Android", status: "success" },
                  ].map((log, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-3">
                        {log.status === "success" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{log.action}</p>
                          <p className="text-xs text-muted-foreground">{log.device}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{log.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Info */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Thông tin hệ thống
                  </CardTitle>
                  <CardDescription>
                    Thông tin kỹ thuật về hệ thống
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: "Phiên bản", value: "1.0.0" },
                      { label: "Môi trường", value: "Production" },
                      { label: "Framework", value: "React 18 + Vite" },
                      { label: "Database", value: "Lovable Cloud" },
                      { label: "CDN", value: "Cloudflare" },
                      { label: "SSL", value: "Active" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-primary" />
                    Trạng thái dịch vụ
                  </CardTitle>
                  <CardDescription>
                    Tình trạng các dịch vụ hệ thống
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "API Server", status: "online" },
                      { name: "Database", status: "online" },
                      { name: "Storage", status: "online" },
                      { name: "Auth Service", status: "online" },
                      { name: "Email Service", status: "online" },
                      { name: "CDN", status: "online" },
                    ].map((service) => (
                      <div key={service.name} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <span className="text-muted-foreground">{service.name}</span>
                        <Badge 
                          variant="outline" 
                          className={
                            service.status === "online" 
                              ? "bg-green-500/10 text-green-500 border-green-500/20" 
                              : "bg-red-500/10 text-red-500 border-red-500/20"
                          }
                        >
                          <span className="mr-1 h-2 w-2 rounded-full bg-current inline-block" />
                          {service.status === "online" ? "Online" : "Offline"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Maintenance */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Bảo trì hệ thống</CardTitle>
                <CardDescription>
                  Các công cụ bảo trì và tối ưu hệ thống
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <RefreshCw className="h-5 w-5" />
                    <span>Xóa Cache</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Database className="h-5 w-5" />
                    <span>Backup Data</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <FileText className="h-5 w-5" />
                    <span>Export Logs</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <ExternalLink className="h-5 w-5" />
                    <span>API Docs</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
