import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  MoreHorizontal, 
  Plus, 
  Pencil, 
  Trash2, 
  Copy, 
  Tag,
  Percent,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { format, isAfter, isBefore, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  min_order_amount: number | null;
  max_discount_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

const defaultCoupon: Partial<Coupon> = {
  code: "",
  description: "",
  discount_type: "percentage",
  discount_value: 0,
  min_order_amount: 0,
  max_discount_amount: null,
  usage_limit: null,
  is_active: true,
  starts_at: null,
  expires_at: null,
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "expired" | "upcoming">("all");
  const { toast } = useToast();

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải danh sách mã giảm giá",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const getCouponStatus = (coupon: Coupon): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } => {
    const now = new Date();
    
    if (!coupon.is_active) {
      return { label: "Tắt", variant: "secondary" };
    }
    
    if (coupon.expires_at && isBefore(parseISO(coupon.expires_at), now)) {
      return { label: "Hết hạn", variant: "destructive" };
    }
    
    if (coupon.starts_at && isAfter(parseISO(coupon.starts_at), now)) {
      return { label: "Sắp diễn ra", variant: "outline" };
    }
    
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return { label: "Hết lượt", variant: "destructive" };
    }
    
    return { label: "Đang hoạt động", variant: "default" };
  };

  const handleSaveCoupon = async () => {
    if (!editingCoupon?.code) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng nhập mã giảm giá",
      });
      return;
    }

    try {
      const couponData = {
        code: editingCoupon.code.toUpperCase().trim(),
        description: editingCoupon.description || null,
        discount_type: editingCoupon.discount_type || "percentage",
        discount_value: editingCoupon.discount_value || 0,
        min_order_amount: editingCoupon.min_order_amount || 0,
        max_discount_amount: editingCoupon.max_discount_amount || null,
        usage_limit: editingCoupon.usage_limit || null,
        is_active: editingCoupon.is_active ?? true,
        starts_at: editingCoupon.starts_at || null,
        expires_at: editingCoupon.expires_at || null,
      };

      if (editingCoupon.id) {
        const { error } = await supabase
          .from("coupons")
          .update(couponData)
          .eq("id", editingCoupon.id);

        if (error) throw error;
        toast({ title: "Thành công", description: "Đã cập nhật mã giảm giá" });
      } else {
        const { error } = await supabase.from("coupons").insert(couponData);

        if (error) throw error;
        toast({ title: "Thành công", description: "Đã thêm mã giảm giá mới" });
      }

      setDialogOpen(false);
      setEditingCoupon(null);
      fetchCoupons();
    } catch (error: any) {
      console.error("Error saving coupon:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message?.includes("unique") 
          ? "Mã giảm giá đã tồn tại" 
          : "Không thể lưu mã giảm giá",
      });
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa mã giảm giá này?")) return;

    try {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Thành công", description: "Đã xóa mã giảm giá" });
      fetchCoupons();
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa mã giảm giá",
      });
    }
  };

  const toggleCouponStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("coupons")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      toast({
        title: "Thành công",
        description: `Đã ${!currentStatus ? "bật" : "tắt"} mã giảm giá`,
      });
      fetchCoupons();
    } catch (error) {
      console.error("Error updating coupon:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật mã giảm giá",
      });
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Đã sao chép", description: code });
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setEditingCoupon({ ...editingCoupon, code });
  };

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    const status = getCouponStatus(coupon);
    switch (filterStatus) {
      case "active":
        return status.label === "Đang hoạt động";
      case "expired":
        return status.label === "Hết hạn" || status.label === "Hết lượt";
      case "upcoming":
        return status.label === "Sắp diễn ra";
      default:
        return true;
    }
  });

  // Stats
  const activeCoupons = coupons.filter(c => getCouponStatus(c).label === "Đang hoạt động").length;
  const totalUsed = coupons.reduce((sum, c) => sum + c.used_count, 0);
  const expiredCoupons = coupons.filter(c => getCouponStatus(c).label === "Hết hạn" || getCouponStatus(c).label === "Hết lượt").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Quản lý Mã giảm giá</h1>
            <p className="text-muted-foreground mt-1">
              Tạo và quản lý các mã khuyến mãi
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingCoupon(defaultCoupon)}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo mã mới
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCoupon?.id ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá mới"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Code */}
                <div className="grid gap-2">
                  <Label htmlFor="code">Mã giảm giá *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="code"
                      value={editingCoupon?.code || ""}
                      onChange={(e) =>
                        setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })
                      }
                      placeholder="VD: SUMMER25"
                      className="uppercase"
                    />
                    <Button variant="outline" onClick={generateCode} type="button">
                      Tự động
                    </Button>
                  </div>
                </div>

                {/* Description */}
                <div className="grid gap-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    value={editingCoupon?.description || ""}
                    onChange={(e) =>
                      setEditingCoupon({ ...editingCoupon, description: e.target.value })
                    }
                    placeholder="Mô tả về mã giảm giá..."
                    rows={2}
                  />
                </div>

                {/* Discount Type & Value */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Loại giảm giá</Label>
                    <Select
                      value={editingCoupon?.discount_type || "percentage"}
                      onValueChange={(value) =>
                        setEditingCoupon({ ...editingCoupon, discount_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Phần trăm (%)</SelectItem>
                        <SelectItem value="fixed">Số tiền cố định (VNĐ)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="discount_value">
                      Giá trị {editingCoupon?.discount_type === "percentage" ? "(%)" : "(VNĐ)"}
                    </Label>
                    <Input
                      id="discount_value"
                      type="number"
                      value={editingCoupon?.discount_value || 0}
                      onChange={(e) =>
                        setEditingCoupon({ ...editingCoupon, discount_value: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>

                {/* Min Order & Max Discount */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="min_order_amount">Đơn tối thiểu (VNĐ)</Label>
                    <Input
                      id="min_order_amount"
                      type="number"
                      value={editingCoupon?.min_order_amount || ""}
                      onChange={(e) =>
                        setEditingCoupon({ 
                          ...editingCoupon, 
                          min_order_amount: e.target.value ? Number(e.target.value) : null 
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="max_discount_amount">Giảm tối đa (VNĐ)</Label>
                    <Input
                      id="max_discount_amount"
                      type="number"
                      value={editingCoupon?.max_discount_amount || ""}
                      onChange={(e) =>
                        setEditingCoupon({ 
                          ...editingCoupon, 
                          max_discount_amount: e.target.value ? Number(e.target.value) : null 
                        })
                      }
                      placeholder="Không giới hạn"
                    />
                  </div>
                </div>

                {/* Usage Limit */}
                <div className="grid gap-2">
                  <Label htmlFor="usage_limit">Giới hạn lượt sử dụng</Label>
                  <Input
                    id="usage_limit"
                    type="number"
                    value={editingCoupon?.usage_limit || ""}
                    onChange={(e) =>
                      setEditingCoupon({ 
                        ...editingCoupon, 
                        usage_limit: e.target.value ? Number(e.target.value) : null 
                      })
                    }
                    placeholder="Không giới hạn"
                  />
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="starts_at">Bắt đầu từ</Label>
                    <Input
                      id="starts_at"
                      type="datetime-local"
                      value={editingCoupon?.starts_at ? editingCoupon.starts_at.slice(0, 16) : ""}
                      onChange={(e) =>
                        setEditingCoupon({ 
                          ...editingCoupon, 
                          starts_at: e.target.value ? new Date(e.target.value).toISOString() : null 
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="expires_at">Hết hạn</Label>
                    <Input
                      id="expires_at"
                      type="datetime-local"
                      value={editingCoupon?.expires_at ? editingCoupon.expires_at.slice(0, 16) : ""}
                      onChange={(e) =>
                        setEditingCoupon({ 
                          ...editingCoupon, 
                          expires_at: e.target.value ? new Date(e.target.value).toISOString() : null 
                        })
                      }
                    />
                  </div>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={editingCoupon?.is_active ?? true}
                    onCheckedChange={(checked) =>
                      setEditingCoupon({ ...editingCoupon, is_active: checked })
                    }
                  />
                  <Label htmlFor="is_active">Kích hoạt ngay</Label>
                </div>

                <Button onClick={handleSaveCoupon} className="w-full mt-4">
                  {editingCoupon?.id ? "Cập nhật" : "Tạo mã giảm giá"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Tag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng mã</p>
                <p className="text-2xl font-bold">{coupons.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Đang hoạt động</p>
                <p className="text-2xl font-bold">{activeCoupons}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lượt sử dụng</p>
                <p className="text-2xl font-bold">{totalUsed}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-destructive/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hết hạn</p>
                <p className="text-2xl font-bold">{expiredCoupons}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle>Danh sách mã giảm giá ({filteredCoupons.length})</CardTitle>
              <div className="flex items-center gap-3">
                <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="active">Đang hoạt động</SelectItem>
                    <SelectItem value="expired">Hết hạn</SelectItem>
                    <SelectItem value="upcoming">Sắp diễn ra</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm mã..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã</TableHead>
                  <TableHead>Giảm giá</TableHead>
                  <TableHead>Điều kiện</TableHead>
                  <TableHead>Sử dụng</TableHead>
                  <TableHead>Thời hạn</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : filteredCoupons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Không có mã giảm giá nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCoupons.map((coupon) => {
                    const status = getCouponStatus(coupon);
                    return (
                      <TableRow key={coupon.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="px-2 py-1 bg-muted rounded text-sm font-mono font-bold">
                              {coupon.code}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyCode(coupon.code)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          {coupon.description && (
                            <p className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate">
                              {coupon.description}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {coupon.discount_type === "percentage" ? (
                              <>
                                <Percent className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{coupon.discount_value}%</span>
                              </>
                            ) : (
                              <>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {new Intl.NumberFormat("vi-VN").format(Number(coupon.discount_value))}đ
                                </span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {coupon.min_order_amount && Number(coupon.min_order_amount) > 0 ? (
                              <span>Đơn từ {new Intl.NumberFormat("vi-VN").format(Number(coupon.min_order_amount))}đ</span>
                            ) : (
                              <span className="text-muted-foreground">Không yêu cầu</span>
                            )}
                          </div>
                          {coupon.max_discount_amount && (
                            <div className="text-xs text-muted-foreground">
                              Giảm tối đa {new Intl.NumberFormat("vi-VN").format(Number(coupon.max_discount_amount))}đ
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{coupon.used_count}</span>
                            {coupon.usage_limit && (
                              <span className="text-muted-foreground">/ {coupon.usage_limit}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {coupon.expires_at ? (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                {format(parseISO(coupon.expires_at), "dd/MM/yyyy", { locale: vi })}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Không giới hạn</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingCoupon(coupon);
                                  setDialogOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => copyCode(coupon.code)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Sao chép mã
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                              >
                                <Switch className="h-4 w-4 mr-2" />
                                {coupon.is_active ? "Tắt" : "Bật"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteCoupon(coupon.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminCoupons;