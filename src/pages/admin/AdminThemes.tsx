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
  Eye, 
  EyeOff,
  Palette,
  TrendingUp,
  Download,
  Star,
  ExternalLink,
  Image as ImageIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { Database } from "@/integrations/supabase/types";

type Theme = Database["public"]["Tables"]["themes"]["Row"];

const categories = [
  { value: "general", label: "Tổng hợp" },
  { value: "business", label: "Doanh nghiệp" },
  { value: "portfolio", label: "Portfolio" },
  { value: "ecommerce", label: "Thương mại" },
  { value: "blog", label: "Blog" },
  { value: "landing", label: "Landing Page" },
  { value: "hotel", label: "Hotel & Resort" },
  { value: "restaurant", label: "Nhà hàng" },
];

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
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
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

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("themes")
        .update({ is_featured: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      toast({
        title: "Thành công",
        description: `Đã ${!currentStatus ? "đánh dấu" : "bỏ đánh dấu"} nổi bật`,
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

  const filteredThemes = themes.filter((theme) => {
    const matchesSearch = theme.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || theme.category === filterCategory;
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && theme.is_active) ||
      (filterStatus === "inactive" && !theme.is_active) ||
      (filterStatus === "featured" && theme.is_featured);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Stats
  const totalThemes = themes.length;
  const activeThemes = themes.filter(t => t.is_active).length;
  const featuredThemes = themes.filter(t => t.is_featured).length;
  const totalDownloads = themes.reduce((sum, t) => sum + t.downloads, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
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
                {/* Name */}
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

                {/* Description */}
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

                {/* Price & Original Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Giá bán (VNĐ)</Label>
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
                      placeholder="Để trống nếu không giảm giá"
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="grid gap-2">
                  <Label>Danh mục</Label>
                  <Select
                    value={editingTheme?.category || "general"}
                    onValueChange={(value) =>
                      setEditingTheme({ ...editingTheme, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Image URL */}
                <div className="grid gap-2">
                  <Label htmlFor="image_url">URL Hình ảnh</Label>
                  <div className="flex gap-2">
                    <Input
                      id="image_url"
                      value={editingTheme?.image_url || ""}
                      onChange={(e) =>
                        setEditingTheme({ ...editingTheme, image_url: e.target.value })
                      }
                      placeholder="https://..."
                      className="flex-1"
                    />
                  </div>
                  {editingTheme?.image_url && (
                    <div className="mt-2 p-2 border rounded-lg bg-muted/50">
                      <img
                        src={editingTheme.image_url}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Demo URL */}
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

                {/* Toggles */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="is_featured"
                        checked={editingTheme?.is_featured || false}
                        onCheckedChange={(checked) =>
                          setEditingTheme({ ...editingTheme, is_featured: checked })
                        }
                      />
                      <Label htmlFor="is_featured" className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        Nổi bật
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="is_active"
                        checked={editingTheme?.is_active ?? true}
                        onCheckedChange={(checked) =>
                          setEditingTheme({ ...editingTheme, is_active: checked })
                        }
                      />
                      <Label htmlFor="is_active" className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        Hiển thị
                      </Label>
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveTheme} className="w-full mt-4">
                  {editingTheme?.id ? "Cập nhật" : "Thêm Theme"}
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
                <Palette className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng themes</p>
                <p className="text-2xl font-bold">{totalThemes}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Đang hiển thị</p>
                <p className="text-2xl font-bold">{activeThemes}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nổi bật</p>
                <p className="text-2xl font-bold">{featuredThemes}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Download className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lượt tải</p>
                <p className="text-2xl font-bold">{totalDownloads}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle>Danh sách Themes ({filteredThemes.length})</CardTitle>
              <div className="flex flex-wrap items-center gap-3">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="active">Đang hiển thị</SelectItem>
                    <SelectItem value="inactive">Đã ẩn</SelectItem>
                    <SelectItem value="featured">Nổi bật</SelectItem>
                  </SelectContent>
                </Select>
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
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Theme</TableHead>
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
                          <div className="w-16 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                            {theme.image_url ? (
                              <img
                                src={theme.image_url}
                                alt={theme.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {theme.name}
                              {theme.is_featured && (
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              )}
                            </div>
                            {theme.demo_url && (
                              <a
                                href={theme.demo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Xem demo
                              </a>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {categories.find(c => c.value === theme.category)?.label || theme.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {new Intl.NumberFormat("vi-VN").format(Number(theme.price))}đ
                        </div>
                        {theme.original_price && Number(theme.original_price) > Number(theme.price) && (
                          <div className="text-xs text-muted-foreground line-through">
                            {new Intl.NumberFormat("vi-VN").format(Number(theme.original_price))}đ
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={theme.is_active ? "default" : "secondary"}>
                            {theme.is_active ? "Hiển thị" : "Ẩn"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Download className="h-4 w-4 text-muted-foreground" />
                          {theme.downloads}
                        </div>
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
                                setEditingTheme(theme);
                                setDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            {theme.demo_url && (
                              <DropdownMenuItem asChild>
                                <a href={theme.demo_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Mở demo
                                </a>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => toggleFeatured(theme.id, theme.is_featured)}
                            >
                              <Star className="h-4 w-4 mr-2" />
                              {theme.is_featured ? "Bỏ nổi bật" : "Đánh dấu nổi bật"}
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