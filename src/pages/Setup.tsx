import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Database, User, Settings, Loader2, Server, Mail, ArrowRight, ArrowLeft } from "lucide-react";

interface StepProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  active: boolean;
}

function StepIndicator({ steps, currentStep }: { steps: StepProps[]; currentStep: number }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
            step.completed ? "bg-green-500 border-green-500 text-white" :
            step.active ? "bg-primary border-primary text-primary-foreground" :
            "bg-muted border-muted-foreground/30 text-muted-foreground"
          }`}>
            {step.completed ? <CheckCircle className="w-5 h-5" /> : step.icon}
          </div>
          {index < steps.length - 1 && (
            <div className={`w-16 h-1 mx-2 ${
              steps[index + 1].completed || steps[index + 1].active ? "bg-primary" : "bg-muted"
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function Setup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  
  const [dbConfig, setDbConfig] = useState({
    dbType: "postgresql",
    host: "localhost",
    port: "5432",
    database: "themevn",
    username: "themevn",
    password: "",
    rootPassword: "",
    createNew: false
  });
  
  const [adminConfig, setAdminConfig] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "Administrator"
  });
  
  const [siteConfig, setSiteConfig] = useState({
    siteName: "ThemeVN",
    siteUrl: window.location.origin,
    smtpHost: "",
    smtpPort: "587",
    smtpUser: "",
    smtpPass: ""
  });

  const [dbConnected, setDbConnected] = useState(false);

  useEffect(() => {
    checkInstallStatus();
  }, []);

  const checkInstallStatus = async () => {
    try {
      const res = await fetch("/api/install/status");
      const data = await res.json();
      
      if (data.installed) {
        navigate("/");
        return;
      }
      
      if (data.hasDatabase) {
        setDbConnected(true);
        setCurrentStep(1);
      }
      
      setChecking(false);
    } catch (error) {
      setChecking(false);
    }
  };

  const testDatabase = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/install/test-database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dbType: dbConfig.dbType,
          host: dbConfig.host,
          port: parseInt(dbConfig.port),
          database: dbConfig.database,
          username: dbConfig.username,
          password: dbConfig.password
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast({ title: "Thành công", description: data.message });
        setDbConnected(true);
      } else {
        toast({ 
          title: "Lỗi kết nối", 
          description: data.details || data.error,
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ 
        title: "Lỗi", 
        description: "Không thể kiểm tra kết nối",
        variant: "destructive" 
      });
    }
    setLoading(false);
  };

  const createDatabase = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/install/create-database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dbType: dbConfig.dbType,
          host: dbConfig.host,
          port: parseInt(dbConfig.port),
          database: dbConfig.database,
          username: dbConfig.username,
          password: dbConfig.password,
          rootPassword: dbConfig.rootPassword
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast({ title: "Thành công", description: data.message });
        setDbConnected(true);
        setDbConfig(prev => ({ ...prev, createNew: false }));
      } else {
        toast({ 
          title: "Lỗi", 
          description: data.details || data.error,
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ 
        title: "Lỗi", 
        description: "Không thể tạo cơ sở dữ liệu",
        variant: "destructive" 
      });
    }
    setLoading(false);
  };

  const createAdmin = async () => {
    if (adminConfig.password !== adminConfig.confirmPassword) {
      toast({ 
        title: "Lỗi", 
        description: "Mật khẩu không khớp",
        variant: "destructive" 
      });
      return;
    }
    
    if (adminConfig.password.length < 6) {
      toast({ 
        title: "Lỗi", 
        description: "Mật khẩu phải có ít nhất 6 ký tự",
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/install/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: adminConfig.email,
          password: adminConfig.password,
          fullName: adminConfig.fullName
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast({ title: "Thành công", description: data.message });
        setCurrentStep(2);
      } else {
        toast({ 
          title: "Lỗi", 
          description: data.details || data.error,
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ 
        title: "Lỗi", 
        description: "Không thể tạo tài khoản admin",
        variant: "destructive" 
      });
    }
    setLoading(false);
  };

  const configureSite = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/install/configure-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteConfig)
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast({ title: "Thành công", description: data.message });
        setCurrentStep(3);
      } else {
        toast({ 
          title: "Lỗi", 
          description: data.details || data.error,
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ 
        title: "Lỗi", 
        description: "Không thể lưu cấu hình",
        variant: "destructive" 
      });
    }
    setLoading(false);
  };

  const completeInstall = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/install/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast({ title: "Hoàn tất!", description: data.message });
        setTimeout(() => navigate("/"), 2000);
      } else {
        toast({ 
          title: "Lỗi", 
          description: data.error,
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ 
        title: "Lỗi", 
        description: "Không thể hoàn tất cài đặt",
        variant: "destructive" 
      });
    }
    setLoading(false);
  };

  const steps: StepProps[] = [
    { 
      title: "Cơ sở dữ liệu", 
      description: "Kết nối database", 
      icon: <Database className="w-5 h-5" />,
      completed: currentStep > 0,
      active: currentStep === 0
    },
    { 
      title: "Tài khoản Admin", 
      description: "Tạo quản trị viên", 
      icon: <User className="w-5 h-5" />,
      completed: currentStep > 1,
      active: currentStep === 1
    },
    { 
      title: "Cấu hình", 
      description: "Thiết lập trang web", 
      icon: <Settings className="w-5 h-5" />,
      completed: currentStep > 2,
      active: currentStep === 2
    },
    { 
      title: "Hoàn tất", 
      description: "Sẵn sàng sử dụng", 
      icon: <CheckCircle className="w-5 h-5" />,
      completed: currentStep > 3,
      active: currentStep === 3
    }
  ];

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Đang kiểm tra...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">ThemeVN</h1>
          <p className="text-muted-foreground">Cài đặt hệ thống</p>
        </div>

        <StepIndicator steps={steps} currentStep={currentStep} />

        {currentStep === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Cấu hình Cơ sở dữ liệu
              </CardTitle>
              <CardDescription>
                Kết nối đến cơ sở dữ liệu MySQL hoặc PostgreSQL
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Loại Database</Label>
                  <Select 
                    value={dbConfig.dbType} 
                    onValueChange={(v) => setDbConfig(prev => ({ 
                      ...prev, 
                      dbType: v,
                      port: v === "mysql" ? "3306" : "5432"
                    }))}
                  >
                    <SelectTrigger data-testid="select-db-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="postgresql">PostgreSQL</SelectItem>
                      <SelectItem value="mysql">MySQL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Port</Label>
                  <Input 
                    data-testid="input-db-port"
                    value={dbConfig.port}
                    onChange={(e) => setDbConfig(prev => ({ ...prev, port: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Host</Label>
                <Input 
                  data-testid="input-db-host"
                  value={dbConfig.host}
                  onChange={(e) => setDbConfig(prev => ({ ...prev, host: e.target.value }))}
                  placeholder="localhost"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Tên Database</Label>
                <Input 
                  data-testid="input-db-name"
                  value={dbConfig.database}
                  onChange={(e) => setDbConfig(prev => ({ ...prev, database: e.target.value }))}
                  placeholder="themevn"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input 
                    data-testid="input-db-user"
                    value={dbConfig.username}
                    onChange={(e) => setDbConfig(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input 
                    data-testid="input-db-password"
                    type="password"
                    value={dbConfig.password}
                    onChange={(e) => setDbConfig(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox"
                  id="createNew"
                  checked={dbConfig.createNew}
                  onChange={(e) => setDbConfig(prev => ({ ...prev, createNew: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="createNew" className="cursor-pointer">
                  Tạo database mới (cần quyền root)
                </Label>
              </div>

              {dbConfig.createNew && (
                <div className="space-y-2 p-4 bg-muted rounded-lg">
                  <Label>Mật khẩu Root</Label>
                  <Input 
                    data-testid="input-db-root-password"
                    type="password"
                    value={dbConfig.rootPassword}
                    onChange={(e) => setDbConfig(prev => ({ ...prev, rootPassword: e.target.value }))}
                    placeholder={`Mật khẩu ${dbConfig.dbType === "mysql" ? "root MySQL" : "postgres"}`}
                  />
                </div>
              )}

              {dbConnected && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span>Đã kết nối thành công!</span>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                {dbConfig.createNew ? (
                  <Button 
                    data-testid="button-create-db"
                    onClick={createDatabase} 
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <Server className="w-4 h-4 mr-2" />
                    Tạo Database
                  </Button>
                ) : (
                  <Button 
                    data-testid="button-test-db"
                    onClick={testDatabase} 
                    disabled={loading}
                    variant="outline"
                    className="flex-1"
                  >
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Kiểm tra kết nối
                  </Button>
                )}
                
                <Button 
                  data-testid="button-next-step-1"
                  onClick={() => setCurrentStep(1)}
                  disabled={!dbConnected}
                >
                  Tiếp tục
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Tạo Tài khoản Admin
              </CardTitle>
              <CardDescription>
                Tài khoản quản trị viên đầu tiên
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Họ tên</Label>
                <Input 
                  data-testid="input-admin-name"
                  value={adminConfig.fullName}
                  onChange={(e) => setAdminConfig(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Administrator"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  data-testid="input-admin-email"
                  type="email"
                  value={adminConfig.email}
                  onChange={(e) => setAdminConfig(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="admin@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Mật khẩu</Label>
                <Input 
                  data-testid="input-admin-password"
                  type="password"
                  value={adminConfig.password}
                  onChange={(e) => setAdminConfig(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Ít nhất 6 ký tự"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Xác nhận mật khẩu</Label>
                <Input 
                  data-testid="input-admin-confirm-password"
                  type="password"
                  value={adminConfig.confirmPassword}
                  onChange={(e) => setAdminConfig(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  data-testid="button-prev-step-1"
                  variant="outline"
                  onClick={() => setCurrentStep(0)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>
                <Button 
                  data-testid="button-create-admin"
                  onClick={createAdmin} 
                  disabled={loading || !adminConfig.email || !adminConfig.password}
                  className="flex-1"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Tạo Admin
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Cấu hình Trang web
              </CardTitle>
              <CardDescription>
                Thiết lập thông tin cơ bản và email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Thông tin trang web</h3>
                <div className="space-y-2">
                  <Label>Tên trang web</Label>
                  <Input 
                    data-testid="input-site-name"
                    value={siteConfig.siteName}
                    onChange={(e) => setSiteConfig(prev => ({ ...prev, siteName: e.target.value }))}
                    placeholder="ThemeVN"
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL trang web</Label>
                  <Input 
                    data-testid="input-site-url"
                    value={siteConfig.siteUrl}
                    onChange={(e) => setSiteConfig(prev => ({ ...prev, siteUrl: e.target.value }))}
                    placeholder="https://themevn.com"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Cấu hình Email (Tùy chọn)
                </h3>
                <p className="text-sm text-muted-foreground">
                  Cấu hình SMTP để gửi email OTP và thông báo
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SMTP Host</Label>
                    <Input 
                      data-testid="input-smtp-host"
                      value={siteConfig.smtpHost}
                      onChange={(e) => setSiteConfig(prev => ({ ...prev, smtpHost: e.target.value }))}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SMTP Port</Label>
                    <Input 
                      data-testid="input-smtp-port"
                      value={siteConfig.smtpPort}
                      onChange={(e) => setSiteConfig(prev => ({ ...prev, smtpPort: e.target.value }))}
                      placeholder="587"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SMTP Username</Label>
                    <Input 
                      data-testid="input-smtp-user"
                      value={siteConfig.smtpUser}
                      onChange={(e) => setSiteConfig(prev => ({ ...prev, smtpUser: e.target.value }))}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SMTP Password</Label>
                    <Input 
                      data-testid="input-smtp-pass"
                      type="password"
                      value={siteConfig.smtpPass}
                      onChange={(e) => setSiteConfig(prev => ({ ...prev, smtpPass: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  data-testid="button-prev-step-2"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>
                <Button 
                  data-testid="button-save-config"
                  onClick={configureSite} 
                  disabled={loading}
                  className="flex-1"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Lưu cấu hình
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <CardTitle>Cài đặt hoàn tất!</CardTitle>
              <CardDescription>
                ThemeVN đã sẵn sàng để sử dụng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h4 className="font-medium">Thông tin đăng nhập Admin:</h4>
                <p className="text-sm">Email: <strong>{adminConfig.email}</strong></p>
                <p className="text-sm">Địa chỉ: <strong>{siteConfig.siteUrl}/admin</strong></p>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Các bước tiếp theo:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Đăng nhập vào trang quản trị</li>
                  <li>Thêm themes mới vào hệ thống</li>
                  <li>Cấu hình các tùy chọn nâng cao</li>
                </ul>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  data-testid="button-prev-step-3"
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>
                <Button 
                  data-testid="button-complete-install"
                  onClick={completeInstall} 
                  disabled={loading}
                  className="flex-1"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Hoàn tất & Truy cập trang web
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-sm text-muted-foreground mt-8">
          ThemeVN v2.0 - WordPress Themes Marketplace
        </p>
      </div>
    </div>
  );
}
