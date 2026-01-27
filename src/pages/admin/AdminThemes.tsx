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
import { Search, MoreHorizontal, Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { Database } from "@/integrations/supabase/types";

type Theme = Database["public"]["Tables"]["themes"]["Row"];

const defaultTheme: Partial<Theme> = {
  name: "",
  description: "",
  price: 0,
  original_price: null,
  category: "general",
  image_url: "",
  demo_url: "",
  is_featured: false,
  is_active: true,
};

const AdminThemes = () => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTheme, setEditingTheme] = useState<Partial<Theme> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchThemes = async () => {
    try {
      const { data, error } = await supabase
        .from("themes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setThemes(data || []);
    } catch (error) {
      console.error("Error fetching themes:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải danh sách themes",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const handleSaveTheme = async () => {
    if (!editingTheme?.name) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng nhập tên theme",
      });
      return;
    }

    try {
      if (editingTheme.id) {
        // Update existing theme
        const { error } = await supabase
          .from("themes")
          .update({
            name: editingTheme.name,
            description: editingTheme.description,
            price: editingTheme.price,
            original_price: editingTheme.original_price,
            category: editingTheme.category,
            image_url: editingTheme.image_url,
            demo_url: editingTheme.demo_url,
            is_featured: editingTheme.is_featured,
            is_active: editingTheme.is_active,
          })
          .eq("id", editingTheme.id);

        if (error) throw error;
        toast({ title: "Thành công", description: "Đã cập nhật theme" });
      } else {
        // Create new theme
        const { error } = await supabase.from("themes").insert({
          name: editingTheme.name,
          description: editingTheme.description,
          price: editingTheme.price || 0,
          original_price: editingTheme.original_price,
          category: editingTheme.category || "general",
          image_url: editingTheme.image_url,
          demo_url: editingTheme.demo_url,
          is_featured: editingTheme.is_featured || false,
          is_active: editingTheme.is_active ?? true,
        });

        if (error) throw error;
        toast({ title: "Thành công", description: "Đã thêm theme mới" });
      }

      setDialogOpen(false);
      setEditingTheme(null);
      fetchThemes();
    } catch (error) {
      console.error("Error saving theme:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể lưu theme",
      });
    }
  };

  const handleDeleteTheme = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa theme này?")) return;

    try {
      const { error } = await supabase.from("themes").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Thành công", description: "Đã xóa theme" });
      fetchThemes();
    } catch (error) {
      console.error("Error deleting theme:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa theme",
      });
    }
  };

  const toggleThemeStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("themes")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      toast({
        title: "Thành công",
        description: `Đã ${!currentStatus ? "hiện" : "ẩn"} theme`,
      });
      fetchThemes();
    } catch (error) {
      console.error("Error updating theme:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật theme",
      });
    }
  };

  const filteredThemes = themes.filter((theme) =>
    theme.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Quản lý Themes</h1>
            <p className="text-muted-foreground mt-1">
              Thêm, sửa, xóa và quản lý themes
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingTheme(defaultTheme)}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm Theme
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTheme?.id ? "Chỉnh sửa Theme" : "Thêm Theme mới"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Tên Theme *</Label>
                  <Input
                    id="name"
                    value={editingTheme?.name || ""}
                    onChange={(e) =>
                      setEditingTheme({ ...editingTheme, name: e.target.value })
                    }
                    placeholder="VD: Modern Business Theme"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    value={editingTheme?.description || ""}
                    onChange={(e) =>
                      setEditingTheme({ ...editingTheme, description: e.target.value })
                    }
                    placeholder="Mô tả chi tiết về theme..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Giá (VNĐ)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={editingTheme?.price || 0}
                      onChange={(e) =>
                        setEditingTheme({ ...editingTheme, price: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="original_price">Giá gốc (VNĐ)</Label>
                    <Input
                      id="original_price"
                      type="number"
                      value={editingTheme?.original_price || ""}
                      onChange={(e) =>
                        setEditingTheme({
                          ...editingTheme,
                          original_price: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      placeholder="Để trống nếu không có"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Danh mục</Label>
                  <Input
                    id="category"
                    value={editingTheme?.category || ""}
                    onChange={(e) =>
                      setEditingTheme({ ...editingTheme, category: e.target.value })
                    }
                    placeholder="VD: business, portfolio, ecommerce..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image_url">URL Hình ảnh</Label>
                  <Input
                    id="image_url"
                    value={editingTheme?.image_url || ""}
                    onChange={(e) =>
                      setEditingTheme({ ...editingTheme, image_url: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="demo_url">URL Demo</Label>
                  <Input
                    id="demo_url"
                    value={editingTheme?.demo_url || ""}
                    onChange={(e) =>
                      setEditingTheme({ ...editingTheme, demo_url: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_featured"
                      checked={editingTheme?.is_featured || false}
                      onCheckedChange={(checked) =>
                        setEditingTheme({ ...editingTheme, is_featured: checked })
                      }
                    />
                    <Label htmlFor="is_featured">Nổi bật</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_active"
                      checked={editingTheme?.is_active ?? true}
                      onCheckedChange={(checked) =>
                        setEditingTheme({ ...editingTheme, is_active: checked })
                      }
                    />
                    <Label htmlFor="is_active">Hiển thị</Label>
                  </div>
                </div>
                <Button onClick={handleSaveTheme} className="w-full mt-4">
                  {editingTheme?.id ? "Cập nhật" : "Thêm Theme"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Danh sách Themes ({filteredThemes.length})</CardTitle>
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
                  <TableHead>Tên</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Downloads</TableHead>
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
                ) : filteredThemes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Không có theme nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredThemes.map((theme) => (
                    <TableRow key={theme.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {theme.image_url && (
                            <img
                              src={theme.image_url}
                              alt={theme.name}
                              className="w-12 h-8 object-cover rounded"
                            />
                          )}
                          <div>
                            <div className="font-medium">{theme.name}</div>
                            {theme.is_featured && (
                              <Badge variant="secondary" className="text-xs mt-1">
                                Nổi bật
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{theme.category}</TableCell>
                      <TableCell>
                        <div>
                          {new Intl.NumberFormat("vi-VN").format(Number(theme.price))}đ
                        </div>
                        {theme.original_price && (
                          <div className="text-xs text-muted-foreground line-through">
                            {new Intl.NumberFormat("vi-VN").format(Number(theme.original_price))}đ
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={theme.is_active ? "outline" : "secondary"}>
                          {theme.is_active ? "Hiển thị" : "Ẩn"}
                        </Badge>
                      </TableCell>
                      <TableCell>{theme.downloads}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingTheme(theme);
                                setDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleThemeStatus(theme.id, theme.is_active ?? true)}
                            >
                              {theme.is_active ? (
                                <>
                                  <EyeOff className="h-4 w-4 mr-2" />
                                  Ẩn theme
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Hiện theme
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteTheme(theme.id)}
                              className="text-destructive"
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
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminThemes;
