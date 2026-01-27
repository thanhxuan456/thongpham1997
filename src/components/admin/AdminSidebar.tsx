import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Palette, 
  ShoppingCart, 
  Settings,
  ChevronLeft,
  LogOut,
  Tag,
  Menu,
  Mail,
  MessageCircle,
  UserCheck,
  Star,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Users, label: "Quản lý Users", path: "/admin/users" },
  { icon: Palette, label: "Quản lý Themes", path: "/admin/themes" },
  { icon: Tag, label: "Mã giảm giá", path: "/admin/coupons" },
  { icon: ShoppingCart, label: "Quản lý Đơn hàng", path: "/admin/orders" },
  { icon: MessageCircle, label: "Hỗ trợ khách hàng", path: "/admin/support", showBadge: true },
  { icon: Star, label: "Đánh giá", path: "/admin/ratings" },
  { icon: UserCheck, label: "Subscribers", path: "/admin/subscribers" },
  { icon: Menu, label: "Quản lý Menu", path: "/admin/menus" },
  { icon: Mail, label: "Email Templates", path: "/admin/emails" },
  { icon: Settings, label: "Cài đặt", path: "/admin/settings" },
];

const AdminSidebar = ({ collapsed, onToggle }: AdminSidebarProps) => {
  const location = useLocation();
  const { signOut } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    fetchUnreadCounts();

    // Subscribe to realtime updates for new messages and notifications
    const messagesChannel = supabase
      .channel("sidebar-messages")
      .on("postgres_changes", { 
        event: "INSERT", 
        schema: "public", 
        table: "ticket_messages",
        filter: "sender_type=eq.user"
      }, () => {
        fetchUnreadCounts();
      })
      .subscribe();

    const notifChannel = supabase
      .channel("sidebar-notifications")
      .on("postgres_changes", { 
        event: "*", 
        schema: "public", 
        table: "admin_notifications" 
      }, () => {
        fetchUnreadCounts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(notifChannel);
    };
  }, []);

  const fetchUnreadCounts = async () => {
    // Fetch unread messages count
    const { count: msgCount } = await supabase
      .from("ticket_messages")
      .select("*", { count: "exact", head: true })
      .eq("sender_type", "user")
      .eq("is_read", false);

    setUnreadCount(msgCount || 0);

    // Fetch unread notifications count
    const { count: notifCount } = await supabase
      .from("admin_notifications")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false);

    setUnreadNotifications(notifCount || 0);
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border shrink-0">
        {!collapsed && (
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-foreground">Admin Panel</span>
          </Link>
        )}
        <div className={cn("flex items-center gap-1", collapsed && "mx-auto flex-col gap-2")}>
          {/* Notification Bell */}
          <Link to="/admin/support">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg relative"
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </Badge>
              )}
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="rounded-lg"
          >
            <ChevronLeft className={cn("h-5 w-5 transition-transform", collapsed && "rotate-180")} />
          </Button>
        </div>
      </div>

      {/* Navigation with custom scrollbar */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto admin-sidebar-scroll">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== "/admin" && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
              {item.showBadge && unreadCount > 0 && (
                <Badge 
                  variant={isActive ? "secondary" : "destructive"}
                  className={cn(
                    "ml-auto h-5 min-w-[20px] flex items-center justify-center text-xs",
                    collapsed && "absolute -top-1 -right-1"
                  )}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border shrink-0">
        <Link
          to="/"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all mb-1",
            collapsed && "justify-center px-2"
          )}
        >
          <ChevronLeft className="h-5 w-5" />
          {!collapsed && <span className="font-medium">Về trang chủ</span>}
        </Link>
        <button
          onClick={() => signOut()}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-all w-full",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="font-medium">Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
