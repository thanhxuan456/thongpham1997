import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Search, 
  MoreHorizontal, 
  Shield, 
  ShieldOff, 
  UserCheck, 
  UserX, 
  Users,
  Percent,
  DollarSign,
  Copy,
  CheckCircle,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];

interface UserWithRole extends Profile {
  role?: AppRole;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [affiliateDialogOpen, setAffiliateDialogOpen] = useState(false);
  const [affiliateForm, setAffiliateForm] = useState({
    enabled: false,
    percentage: 10,
    code: "",
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      // Fetch profiles with affiliate info
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles = profiles?.map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.user_id);
        return {
          ...profile,
          role: userRole?.role || "user",
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải danh sách users",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: !currentStatus })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: `Đã ${!currentStatus ? "kích hoạt" : "vô hiệu hóa"} tài khoản`,
      });
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái user",
      });
    }
  };

  const toggleAdminRole = async (userId: string, currentRole: AppRole) => {
    try {
      if (currentRole === "admin") {
        const { error } = await supabase
          .from("user_roles")
          .update({ role: "user" })
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .update({ role: "admin" })
          .eq("user_id", userId);

        if (error) throw error;
      }

      toast({
        title: "Thành công",
        description: `Đã ${currentRole === "admin" ? "gỡ" : "thêm"} quyền Admin`,
      });
      fetchUsers();
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật quyền user",
      });
    }
  };

  const openAffiliateDialog = (user: UserWithRole) => {
    setSelectedUser(user);
    setAffiliateForm({
      enabled: user.affiliate_enabled || false,
      percentage: user.affiliate_percentage || 10,
      code: user.affiliate_code || generateAffiliateCode(user.email || ""),
    });
    setAffiliateDialogOpen(true);
  };

  const generateAffiliateCode = (email: string) => {
    const prefix = email.split("@")[0].substring(0, 5).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${random}`;
  };

  const handleSaveAffiliate = async () => {
    if (!selectedUser) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          affiliate_enabled: affiliateForm.enabled,
          affiliate_percentage: affiliateForm.percentage,
          affiliate_code: affiliateForm.code,
        })
        .eq("user_id", selectedUser.user_id);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin affiliate",
      });
      setAffiliateDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error updating affiliate:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật affiliate",
      });
    } finally {
      setSaving(false);
    }
  };

  const copyAffiliateCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Đã sao chép",
      description: "Mã affiliate đã được sao chép vào clipboard",
    });
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Quản lý Users</h1>
            <p className="text-muted-foreground mt-1">
              Quản lý tài khoản người dùng, phân quyền và affiliate
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{users.length}</p>
                  <p className="text-xs text-muted-foreground">Tổng Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{users.filter(u => u.is_active).length}</p>
                  <p className="text-xs text-muted-foreground">Đang hoạt động</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Percent className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{users.filter(u => u.affiliate_enabled).length}</p>
                  <p className="text-xs text-muted-foreground">Affiliates</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
                  <p className="text-xs text-muted-foreground">Admins</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Danh sách Users ({filteredUsers.length})</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thông tin User</TableHead>
                  <TableHead>Quyền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Affiliate</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Không có user nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{user.full_name || "-"}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          {user.phone && (
                            <div className="text-xs text-muted-foreground">{user.phone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                          {user.role === "admin" ? "Admin" : "User"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? "outline" : "destructive"}>
                          {user.is_active ? "Hoạt động" : "Đã khóa"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.affiliate_enabled ? (
                          <div className="space-y-1">
                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                              {user.affiliate_percentage}%
                            </Badge>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <span>{user.affiliate_code}</span>
                              <button 
                                onClick={() => copyAffiliateCode(user.affiliate_code || "")}
                                className="hover:text-primary"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Chưa kích hoạt</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border">
                            <DropdownMenuItem
                              onClick={() => toggleAdminRole(user.user_id, user.role || "user")}
                            >
                              {user.role === "admin" ? (
                                <>
                                  <ShieldOff className="h-4 w-4 mr-2" />
                                  Gỡ quyền Admin
                                </>
                              ) : (
                                <>
                                  <Shield className="h-4 w-4 mr-2" />
                                  Thêm quyền Admin
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleUserStatus(user.user_id, user.is_active ?? true)}
                            >
                              {user.is_active ? (
                                <>
                                  <UserX className="h-4 w-4 mr-2" />
                                  Khóa tài khoản
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Mở khóa tài khoản
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openAffiliateDialog(user)}>
                              <Percent className="h-4 w-4 mr-2" />
                              Cấu hình Affiliate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Affiliate Dialog */}
      <Dialog open={affiliateDialogOpen} onOpenChange={setAffiliateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cấu hình Affiliate</DialogTitle>
            <DialogDescription>
              Thiết lập chương trình affiliate cho {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Kích hoạt Affiliate</Label>
                <p className="text-sm text-muted-foreground">
                  Cho phép user tham gia chương trình
                </p>
              </div>
              <Switch
                checked={affiliateForm.enabled}
                onCheckedChange={(checked) => 
                  setAffiliateForm({ ...affiliateForm, enabled: checked })
                }
              />
            </div>
            
            {affiliateForm.enabled && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="percentage">Phần trăm hoa hồng (%)</Label>
                  <Input
                    id="percentage"
                    type="number"
                    min="1"
                    max="50"
                    value={affiliateForm.percentage}
                    onChange={(e) => 
                      setAffiliateForm({ 
                        ...affiliateForm, 
                        percentage: parseInt(e.target.value) || 10 
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Từ 1% đến 50%
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="code">Mã Affiliate</Label>
                  <div className="flex gap-2">
                    <Input
                      id="code"
                      value={affiliateForm.code}
                      onChange={(e) => 
                        setAffiliateForm({ 
                          ...affiliateForm, 
                          code: e.target.value.toUpperCase() 
                        })
                      }
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => 
                        setAffiliateForm({ 
                          ...affiliateForm, 
                          code: generateAffiliateCode(selectedUser?.email || "") 
                        })
                      }
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {selectedUser?.affiliate_earnings !== undefined && selectedUser.affiliate_earnings > 0 && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-muted-foreground">Tổng hoa hồng:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(selectedUser.affiliate_earnings)}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAffiliateDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveAffiliate} disabled={saving}>
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsers;