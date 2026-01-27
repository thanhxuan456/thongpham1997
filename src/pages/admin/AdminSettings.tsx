import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayout from "@/components/admin/AdminLayout";
import { Settings, Bell, Shield, Database } from "lucide-react";

const AdminSettings = () => {
  const { user } = useAuth();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cài đặt</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý cài đặt hệ thống
          </p>
        </div>

        <div className="grid gap-6">
          {/* Account Settings */}
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
                <Input value={user?.email || ""} disabled />
              </div>
              <div className="grid gap-2">
                <Label>ID</Label>
                <Input value={user?.id || ""} disabled className="font-mono text-sm" />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Thông báo
              </CardTitle>
              <CardDescription>
                Cài đặt thông báo hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Thông báo đơn hàng mới</p>
                  <p className="text-sm text-muted-foreground">
                    Nhận thông báo khi có đơn hàng mới
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Thông báo user mới</p>
                  <p className="text-sm text-muted-foreground">
                    Nhận thông báo khi có user đăng ký mới
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Bảo mật
              </CardTitle>
              <CardDescription>
                Cài đặt bảo mật tài khoản
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Xác thực hai yếu tố</p>
                  <p className="text-sm text-muted-foreground">
                    Bảo vệ tài khoản với xác thực 2FA
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Thiết lập
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Đổi mật khẩu</p>
                  <p className="text-sm text-muted-foreground">
                    Cập nhật mật khẩu tài khoản
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Đổi mật khẩu
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Info */}
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
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Phiên bản</p>
                  <p className="font-medium">1.0.0</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Môi trường</p>
                  <p className="font-medium">Production</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Framework</p>
                  <p className="font-medium">React + Vite</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Database</p>
                  <p className="font-medium">Lovable Cloud</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
