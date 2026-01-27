import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { 
  Menu, 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical, 
  ExternalLink,
  Home,
  Palette,
  Info,
  FileText,
  HelpCircle,
  Shield,
  RefreshCw,
  Mail,
  Loader2,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MenuItem {
  id: string;
  menu_location: string;
  parent_id: string | null;
  title: string;
  url: string | null;
  icon: string | null;
  target: string;
  sort_order: number;
  is_active: boolean;
  css_class: string | null;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Palette,
  Info,
  FileText,
  HelpCircle,
  Shield,
  RefreshCw,
  Mail,
  Menu,
  ExternalLink,
};

const availableIcons = [
  { value: "Home", label: "Home" },
  { value: "Palette", label: "Palette" },
  { value: "Info", label: "Info" },
  { value: "FileText", label: "FileText" },
  { value: "HelpCircle", label: "HelpCircle" },
  { value: "Shield", label: "Shield" },
  { value: "RefreshCw", label: "RefreshCw" },
  { value: "Mail", label: "Mail" },
  { value: "Menu", label: "Menu" },
  { value: "ExternalLink", label: "ExternalLink" },
];

const AdminMenus = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [activeLocation, setActiveLocation] = useState("header");
  
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    icon: "Menu",
    target: "_self",
    is_active: true,
    css_class: "",
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("sort_order");

    if (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải menu items",
      });
    } else {
      setMenuItems(data || []);
    }
    setLoading(false);
  };

  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        url: item.url || "",
        icon: item.icon || "Menu",
        target: item.target,
        is_active: item.is_active,
        css_class: item.css_class || "",
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: "",
        url: "",
        icon: "Menu",
        target: "_self",
        is_active: true,
        css_class: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng nhập tiêu đề menu",
      });
      return;
    }

    setSaving(true);

    if (editingItem) {
      const { error } = await supabase
        .from("menu_items")
        .update({
          title: formData.title,
          url: formData.url || null,
          icon: formData.icon,
          target: formData.target,
          is_active: formData.is_active,
          css_class: formData.css_class || null,
        })
        .eq("id", editingItem.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể cập nhật menu item",
        });
      } else {
        toast({
          title: "Thành công",
          description: "Đã cập nhật menu item",
        });
      }
    } else {
      const maxOrder = menuItems
        .filter(m => m.menu_location === activeLocation)
        .reduce((max, m) => Math.max(max, m.sort_order), -1);

      const { error } = await supabase
        .from("menu_items")
        .insert({
          menu_location: activeLocation,
          title: formData.title,
          url: formData.url || null,
          icon: formData.icon,
          target: formData.target,
          is_active: formData.is_active,
          css_class: formData.css_class || null,
          sort_order: maxOrder + 1,
        });

      if (error) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể thêm menu item",
        });
      } else {
        toast({
          title: "Thành công",
          description: "Đã thêm menu item mới",
        });
      }
    }

    setSaving(false);
    setIsDialogOpen(false);
    fetchMenuItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa menu item này?")) return;

    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa menu item",
      });
    } else {
      toast({
        title: "Thành công",
        description: "Đã xóa menu item",
      });
      fetchMenuItems();
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from("menu_items")
      .update({ is_active: !currentState })
      .eq("id", id);

    if (!error) {
      fetchMenuItems();
    }
  };

  const handleMoveItem = async (id: string, direction: "up" | "down") => {
    const locationItems = menuItems
      .filter(m => m.menu_location === activeLocation)
      .sort((a, b) => a.sort_order - b.sort_order);
    
    const currentIndex = locationItems.findIndex(m => m.id === id);
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === locationItems.length - 1)
    ) {
      return;
    }

    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const currentItem = locationItems[currentIndex];
    const swapItem = locationItems[swapIndex];

    await Promise.all([
      supabase
        .from("menu_items")
        .update({ sort_order: swapItem.sort_order })
        .eq("id", currentItem.id),
      supabase
        .from("menu_items")
        .update({ sort_order: currentItem.sort_order })
        .eq("id", swapItem.id),
    ]);

    fetchMenuItems();
  };

  const filteredItems = menuItems
    .filter(m => m.menu_location === activeLocation)
    .sort((a, b) => a.sort_order - b.sort_order);

  const IconComponent = (iconName: string | null) => {
    const Icon = iconMap[iconName || "Menu"] || Menu;
    return <Icon className="h-4 w-4" />;
  };

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
            <h1 className="text-3xl font-bold text-foreground">Quản lý Menu</h1>
            <p className="text-muted-foreground mt-1">
              Tùy chỉnh menu header, footer và navigation
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm menu item
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Menu className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{menuItems.length}</p>
                  <p className="text-sm text-muted-foreground">Tổng menu items</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Eye className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{menuItems.filter(m => m.is_active).length}</p>
                  <p className="text-sm text-muted-foreground">Đang hiển thị</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-muted">
                  <EyeOff className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{menuItems.filter(m => !m.is_active).length}</p>
                  <p className="text-sm text-muted-foreground">Đang ẩn</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Menu Items by Location */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Menu className="h-5 w-5 text-primary" />
              Menu Items
            </CardTitle>
            <CardDescription>
              Quản lý các menu items theo vị trí
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeLocation} onValueChange={setActiveLocation}>
              <TabsList className="mb-4">
                <TabsTrigger value="header">Header Menu</TabsTrigger>
                <TabsTrigger value="footer">Footer Menu</TabsTrigger>
                <TabsTrigger value="mobile">Mobile Menu</TabsTrigger>
              </TabsList>

              <TabsContent value={activeLocation}>
                {filteredItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Menu className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Chưa có menu items nào</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => handleOpenDialog()}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm menu item đầu tiên
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            disabled={index === 0}
                            onClick={() => handleMoveItem(item.id, "up")}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            disabled={index === filteredItems.length - 1}
                            onClick={() => handleMoveItem(item.id, "down")}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                        
                        <div className="p-2 rounded bg-muted">
                          {IconComponent(item.icon)}
                        </div>
                        
                        <div className="flex-1">
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.url || "—"}</p>
                        </div>
                        
                        <Badge 
                          variant="outline"
                          className={item.is_active 
                            ? "bg-green-500/10 text-green-500 border-green-500/20" 
                            : "bg-muted text-muted-foreground"
                          }
                        >
                          {item.is_active ? "Hiển thị" : "Ẩn"}
                        </Badge>
                        
                        {item.target === "_blank" && (
                          <Badge variant="outline" className="gap-1">
                            <ExternalLink className="h-3 w-3" />
                            New tab
                          </Badge>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={item.is_active}
                            onCheckedChange={() => handleToggleActive(item.id, item.is_active)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Menu Preview */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              Xem trước giao diện menu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex items-center gap-6">
                {filteredItems.filter(m => m.is_active).map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors cursor-pointer">
                    {IconComponent(item.icon)}
                    <span>{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Chỉnh sửa Menu Item" : "Thêm Menu Item"}
            </DialogTitle>
            <DialogDescription>
              {editingItem 
                ? "Cập nhật thông tin menu item" 
                : `Thêm menu item mới vào ${activeLocation}`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tiêu đề *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Tên menu item"
              />
            </div>
            
            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="/path hoặc https://..."
              />
            </div>
            
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label>Icon</Label>
                <Select 
                  value={formData.icon} 
                  onValueChange={(value) => setFormData({ ...formData, icon: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableIcons.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value}>
                        <div className="flex items-center gap-2">
                          {IconComponent(icon.value)}
                          <span>{icon.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Mở trong</Label>
                <Select 
                  value={formData.target} 
                  onValueChange={(value) => setFormData({ ...formData, target: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_self">Tab hiện tại</SelectItem>
                    <SelectItem value="_blank">Tab mới</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>CSS Class (tùy chọn)</Label>
              <Input
                value={formData.css_class}
                onChange={(e) => setFormData({ ...formData, css_class: e.target.value })}
                placeholder="custom-class"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Hiển thị menu item</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingItem ? "Cập nhật" : "Thêm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminMenus;
