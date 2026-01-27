import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Palette, ShoppingCart, DollarSign, TrendingUp, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";

interface DashboardStats {
  totalUsers: number;
  totalThemes: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  activeThemes: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalThemes: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    activeThemes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch users count
        const { count: usersCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        // Fetch themes count
        const { count: themesCount } = await supabase
          .from("themes")
          .select("*", { count: "exact", head: true });

        // Fetch active themes count
        const { count: activeThemesCount } = await supabase
          .from("themes")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true);

        // Fetch orders count
        const { count: ordersCount } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true });

        // Fetch pending orders count
        const { count: pendingOrdersCount } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");

        // Fetch total revenue
        const { data: revenueData } = await supabase
          .from("orders")
          .select("total_amount")
          .eq("status", "completed");

        const totalRevenue = revenueData?.reduce(
          (sum, order) => sum + (Number(order.total_amount) || 0),
          0
        ) || 0;

        setStats({
          totalUsers: usersCount || 0,
          totalThemes: themesCount || 0,
          totalOrders: ordersCount || 0,
          totalRevenue,
          pendingOrders: pendingOrdersCount || 0,
          activeThemes: activeThemesCount || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Tổng Users",
      value: stats.totalUsers,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Tổng Themes",
      value: stats.totalThemes,
      icon: Palette,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-500/10",
      subtitle: `${stats.activeThemes} đang hoạt động`,
    },
    {
      title: "Tổng Đơn hàng",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-500/10",
      subtitle: `${stats.pendingOrders} đang chờ xử lý`,
    },
    {
      title: "Doanh thu",
      value: new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(stats.totalRevenue),
      icon: DollarSign,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-500/10",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Chào mừng bạn đến trang quản trị ThemeVN
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} style={{ color: stat.color.includes('blue') ? '#3b82f6' : stat.color.includes('purple') ? '#a855f7' : stat.color.includes('orange') ? '#f97316' : '#10b981' }} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {loading ? "..." : stat.value}
                </div>
                {stat.subtitle && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.subtitle}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Hoạt động gần đây
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Chưa có hoạt động nào được ghi nhận.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Đơn hàng mới nhất
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Chưa có đơn hàng nào.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
