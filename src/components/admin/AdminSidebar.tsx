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
        "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className={cn(
          "flex items-center border-b border-border flex-shrink-0 px-2",
          collapsed ? "h-auto py-3 flex-col gap-2" : "h-16 justify-between px-4"
        )}>
          {!collapsed && (
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-md">
                <span className="text-primary-foreground font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-foreground">Admin Panel</span>
            </Link>
          )}
          
          {/* Toggle Button - always on top when collapsed */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="rounded-lg hover:bg-primary/10"
          >
            <ChevronLeft className={cn("h-5 w-5 transition-transform duration-300", collapsed && "rotate-180")} />
          </Button>
          
          {/* Notification Bell */}
          <Link to="/admin/support">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg relative hover:bg-primary/10"
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-medium animate-pulse">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
            </Button>
          </Link>
        </div>

        {/* Navigation - scrollable area */}
        <nav className="flex-1 overflow-y-auto admin-sidebar-scroll p-3">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== "/admin" && location.pathname.startsWith(item.path));
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative group",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    collapsed && "justify-center px-2"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className={cn(
                    "h-5 w-5 flex-shrink-0 transition-transform",
                    !isActive && "group-hover:scale-110"
                  )} />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                  {item.showBadge && unreadCount > 0 && (
                    <span 
                      className={cn(
                        "flex items-center justify-center text-xs font-medium rounded-full min-w-[20px] h-5 px-1",
                        isActive 
                          ? "bg-primary-foreground/20 text-primary-foreground" 
                          : "bg-destructive text-destructive-foreground animate-pulse",
                        collapsed ? "absolute -top-1 -right-1" : "ml-auto"
                      )}
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer - fixed at bottom */}
        <div className="flex-shrink-0 p-3 border-t border-border bg-card">
          <Link
            to="/"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all mb-1 group",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? "Về trang chủ" : undefined}
          >
            <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            {!collapsed && <span className="font-medium">Về trang chủ</span>}
          </Link>
          <button
            onClick={() => signOut()}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-all w-full group",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? "Đăng xuất" : undefined}
          >
            <LogOut className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            {!collapsed && <span className="font-medium">Đăng xuất</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
