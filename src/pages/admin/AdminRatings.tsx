import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { 
  Star, 
  MoreVertical, 
  Loader2,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Trash2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Filter
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface Rating {
  id: string;
  ticket_id: string | null;
  user_id: string | null;
  user_email: string | null;
  rating: number;
  feedback: string | null;
  is_suspicious: boolean;
  is_verified: boolean;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

const AdminRatings = () => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ratingToDelete, setRatingToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("chat_ratings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải danh sách đánh giá",
      });
    } else {
      setRatings(data || []);
    }
    setLoading(false);
  };

  const toggleSuspicious = async (id: string, currentValue: boolean) => {
    const { error } = await supabase
      .from("chat_ratings")
      .update({ is_suspicious: !currentValue })
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái",
      });
    } else {
      toast({
        title: "Thành công",
        description: `Đã ${!currentValue ? "đánh dấu" : "bỏ đánh dấu"} đánh giá đáng ngờ`,
      });
      fetchRatings();
    }
  };

  const toggleVerified = async (id: string, currentValue: boolean) => {
    const { error } = await supabase
      .from("chat_ratings")
      .update({ is_verified: !currentValue })
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái",
      });
    } else {
      toast({
        title: "Thành công",
        description: `Đã ${!currentValue ? "xác minh" : "bỏ xác minh"} đánh giá`,
      });
      fetchRatings();
    }
  };

  const deleteRating = async (id: string) => {
    const { error } = await supabase
      .from("chat_ratings")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa đánh giá",
      });
    } else {
      toast({
        title: "Đã xóa",
        description: "Đánh giá đã được xóa",
      });
      fetchRatings();
    }
    setDeleteDialogOpen(false);
    setRatingToDelete(null);
  };

  // Auto-detect suspicious ratings
  const detectSuspiciousRatings = async () => {
    // Simple heuristics for fake ratings:
    // 1. Multiple ratings from same user_agent in short time
    // 2. No ticket_id and no user_id (anonymous rating)
    // 3. Rating without any prior chat activity
    
    const suspicious = ratings.filter(r => {
      // Anonymous rating with no ticket
      if (!r.ticket_id && !r.user_id && !r.user_email) return true;
      
      // Check for duplicate user agents within last hour
      const sameAgent = ratings.filter(other => 
        other.id !== r.id &&
        other.user_agent === r.user_agent &&
        Math.abs(new Date(other.created_at).getTime() - new Date(r.created_at).getTime()) < 3600000
      );
      if (sameAgent.length >= 2) return true;
      
      return false;
    });

    if (suspicious.length === 0) {
      toast({
        title: "Không phát hiện",
        description: "Không tìm thấy đánh giá đáng ngờ nào",
      });
      return;
    }

    // Mark as suspicious
    for (const rating of suspicious) {
      if (!rating.is_suspicious) {
        await supabase
          .from("chat_ratings")
          .update({ is_suspicious: true })
          .eq("id", rating.id);
      }
    }

    toast({
      title: "Đã phát hiện",
      description: `Đã đánh dấu ${suspicious.length} đánh giá đáng ngờ`,
    });
    fetchRatings();
  };

  const filteredRatings = ratings.filter(r => {
    if (filterType === "all") return true;
    if (filterType === "suspicious") return r.is_suspicious;
    if (filterType === "verified") return r.is_verified && !r.is_suspicious;
    if (filterType === "unverified") return !r.is_verified;
    return true;
  });

  // Stats
  const totalRatings = ratings.length;
  const averageRating = ratings.length > 0 
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : "0";
  const suspiciousCount = ratings.filter(r => r.is_suspicious).length;
  const verifiedCount = ratings.filter(r => r.is_verified && !r.is_suspicious).length;

  // Rating distribution
  const distribution = [1, 2, 3, 4, 5].map(star => ({
    star,
    count: ratings.filter(r => r.rating === star).length,
    percentage: ratings.length > 0 
      ? Math.round((ratings.filter(r => r.rating === star).length / ratings.length) * 100)
      : 0
  }));

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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Đánh giá khách hàng</h1>
            <p className="text-muted-foreground mt-1">
              Quản lý và lọc đánh giá từ khách hàng
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchRatings} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </Button>
            <Button onClick={detectSuspiciousRatings} className="gap-2" variant="secondary">
              <ShieldAlert className="h-4 w-4" />
              Phát hiện đánh giá ảo
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng đánh giá</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRatings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Điểm trung bình</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary flex items-center gap-1">
                {averageRating}
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đã xác minh</CardTitle>
              <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{verifiedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đáng ngờ</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{suspiciousCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Phân bố đánh giá</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {distribution.reverse().map(({ star, count, percentage }) => (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium">{star}</span>
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-16 text-right">
                    {count} ({percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ratings Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Danh sách đánh giá
              </CardTitle>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="verified">Đã xác minh</SelectItem>
                  <SelectItem value="suspicious">Đáng ngờ</SelectItem>
                  <SelectItem value="unverified">Chưa xác minh</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CardDescription>
              {filteredRatings.length} đánh giá
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Đánh giá</TableHead>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRatings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Chưa có đánh giá nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRatings.map((rating) => (
                      <TableRow key={rating.id} className={rating.is_suspicious ? "bg-amber-500/5" : ""}>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= rating.rating 
                                    ? "fill-amber-400 text-amber-400" 
                                    : "text-muted"
                                }`}
                              />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">
                              {rating.user_email || "Ẩn danh"}
                            </p>
                            {rating.ticket_id && (
                              <p className="text-xs text-muted-foreground">
                                Ticket: {rating.ticket_id.slice(0, 8)}...
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">
                            {format(new Date(rating.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {rating.is_suspicious ? (
                              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Đáng ngờ
                              </Badge>
                            ) : rating.is_verified ? (
                              <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Đã xác minh
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                Chưa xác minh
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border-border">
                              <DropdownMenuItem onClick={() => toggleVerified(rating.id, rating.is_verified)}>
                                {rating.is_verified ? (
                                  <>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Bỏ xác minh
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck className="h-4 w-4 mr-2" />
                                    Xác minh
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleSuspicious(rating.id, rating.is_suspicious)}>
                                {rating.is_suspicious ? (
                                  <>
                                    <Shield className="h-4 w-4 mr-2" />
                                    Bỏ đánh dấu đáng ngờ
                                  </>
                                ) : (
                                  <>
                                    <ShieldAlert className="h-4 w-4 mr-2" />
                                    Đánh dấu đáng ngờ
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => {
                                  setRatingToDelete(rating.id);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa</DialogTitle>
              <DialogDescription>
                Bạn có chắc muốn xóa đánh giá này? Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Hủy
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => ratingToDelete && deleteRating(ratingToDelete)}
              >
                Xóa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminRatings;
