import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { Database } from "@/integrations/supabase/types";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];

interface OrderWithItems extends Order {
  items?: OrderItem[];
}

const statusOptions = [
  { value: "pending", label: "Chờ xử lý", color: "bg-yellow-500" },
  { value: "processing", label: "Đang xử lý", color: "bg-blue-500" },
  { value: "completed", label: "Hoàn thành", color: "bg-emerald-500" },
  { value: "cancelled", label: "Đã hủy", color: "bg-red-500" },
];

const AdminOrders = () => {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải danh sách đơn hàng",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const { data: items, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

      if (error) throw error;

      const order = orders.find((o) => o.id === orderId);
      if (order) {
        setSelectedOrder({ ...order, items: items || [] });
        setDetailsOpen(true);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã cập nhật trạng thái đơn hàng",
      });
      fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật đơn hàng",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = statusOptions.find((s) => s.value === status) || statusOptions[0];
    return (
      <Badge variant="outline" className="gap-1.5">
        <span className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
        {statusInfo.label}
      </Badge>
    );
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Quản lý Đơn hàng</h1>
            <p className="text-muted-foreground mt-1">
              Xem và quản lý tất cả đơn hàng
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Tổng doanh thu</p>
            <p className="text-2xl font-bold text-primary">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(totalRevenue)}
            </p>
          </div>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Danh sách Đơn hàng ({filteredOrders.length})</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo email hoặc ID..."
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
                  <TableHead>Mã đơn</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Không có đơn hàng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        {order.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>{order.user_email}</TableCell>
                      <TableCell className="font-medium">
                        {new Intl.NumberFormat("vi-VN").format(Number(order.total_amount))}đ
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => fetchOrderDetails(order.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateOrderStatus(order.id, "completed")}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Hoàn thành
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateOrderStatus(order.id, "processing")}
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              Đang xử lý
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateOrderStatus(order.id, "cancelled")}
                              className="text-destructive"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Hủy đơn
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

        {/* Order Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chi tiết đơn hàng</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Mã đơn hàng</p>
                    <p className="font-mono">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p>{selectedOrder.user_email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ngày đặt</p>
                    <p>{new Date(selectedOrder.created_at).toLocaleString("vi-VN")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Trạng thái</p>
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(value) => {
                        updateOrderStatus(selectedOrder.id, value);
                        setSelectedOrder({ ...selectedOrder, status: value });
                      }}
                    >
                      <SelectTrigger className="w-40 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <h4 className="font-medium mb-2">Sản phẩm</h4>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    <div className="space-y-2">
                      {selectedOrder.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-2 border-b border-border/50"
                        >
                          <div>
                            <p className="font-medium">{item.theme_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Số lượng: {item.quantity}
                            </p>
                          </div>
                          <p className="font-medium">
                            {new Intl.NumberFormat("vi-VN").format(Number(item.price))}đ
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Không có thông tin sản phẩm
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <p className="text-lg font-bold">Tổng cộng</p>
                  <p className="text-xl font-bold text-primary">
                    {new Intl.NumberFormat("vi-VN").format(Number(selectedOrder.total_amount))}đ
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
