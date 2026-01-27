import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { 
  Mail, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Code,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText,
  Copy,
  Variable
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface EmailTemplate {
  id: string;
  name: string;
  slug: string;
  subject: string;
  html_content: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminEmails = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [activeTab, setActiveTab] = useState("visual");
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    subject: "",
    html_content: "",
    variables: [] as string[],
    is_active: true,
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("email_templates")
      .select("*")
      .order("created_at");

    if (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải email templates",
      });
    } else {
      setTemplates(data || []);
    }
    setLoading(false);
  };

  const handleOpenDialog = (template?: EmailTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        slug: template.slug,
        subject: template.subject,
        html_content: template.html_content,
        variables: template.variables || [],
        is_active: template.is_active,
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: "",
        slug: "",
        subject: "",
        html_content: getDefaultTemplate(),
        variables: [],
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const getDefaultTemplate = () => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; padding: 20px;">
    <h1 style="color: #6366f1;">{{store_name}}</h1>
  </div>
  <div style="background: #f8fafc; border-radius: 12px; padding: 30px;">
    <h2 style="margin: 0 0 20px;">Tiêu đề email</h2>
    <p>Nội dung email của bạn ở đây...</p>
  </div>
  <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
    <p>© {{year}} {{store_name}}. All rights reserved.</p>
  </div>
</body>
</html>`;
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug || !formData.subject) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
      });
      return;
    }

    setSaving(true);

    // Extract variables from content
    const variableMatches = formData.html_content.match(/\{\{(\w+)\}\}/g) || [];
    const variables = [...new Set(variableMatches.map(v => v.replace(/\{\{|\}\}/g, '')))];

    if (editingTemplate) {
      const { error } = await supabase
        .from("email_templates")
        .update({
          name: formData.name,
          slug: formData.slug,
          subject: formData.subject,
          html_content: formData.html_content,
          variables,
          is_active: formData.is_active,
        })
        .eq("id", editingTemplate.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể cập nhật template",
        });
      } else {
        toast({
          title: "Thành công",
          description: "Đã cập nhật email template",
        });
      }
    } else {
      const { error } = await supabase
        .from("email_templates")
        .insert({
          name: formData.name,
          slug: formData.slug,
          subject: formData.subject,
          html_content: formData.html_content,
          variables,
          is_active: formData.is_active,
        });

      if (error) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: error.message.includes("duplicate") ? "Slug đã tồn tại" : "Không thể tạo template",
        });
      } else {
        toast({
          title: "Thành công",
          description: "Đã tạo email template mới",
        });
      }
    }

    setSaving(false);
    setIsDialogOpen(false);
    fetchTemplates();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa template này?")) return;

    const { error } = await supabase
      .from("email_templates")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa template",
      });
    } else {
      toast({
        title: "Thành công",
        description: "Đã xóa template",
      });
      fetchTemplates();
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from("email_templates")
      .update({ is_active: !currentState })
      .eq("id", id);

    if (!error) {
      fetchTemplates();
    }
  };

  const handlePreview = (template: EmailTemplate) => {
    // Replace variables with sample data
    let html = template.html_content
      .replace(/\{\{store_name\}\}/g, "ThemeVN")
      .replace(/\{\{otp_code\}\}/g, "123456")
      .replace(/\{\{year\}\}/g, new Date().getFullYear().toString())
      .replace(/\{\{customer_name\}\}/g, "Nguyễn Văn A")
      .replace(/\{\{order_id\}\}/g, "ORD-001234")
      .replace(/\{\{total_amount\}\}/g, "1,290,000₫")
      .replace(/\{\{shop_url\}\}/g, window.location.origin)
      .replace(/\{\{order_items\}\}/g, "<p>Theme Portfolio - 890,000₫</p><p>Theme Blog - 400,000₫</p>");
    
    setPreviewHtml(html);
    setIsPreviewOpen(true);
  };

  const copySlug = (slug: string) => {
    navigator.clipboard.writeText(slug);
    toast({ title: "Đã sao chép slug" });
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
            <h1 className="text-3xl font-bold text-foreground">Email Templates</h1>
            <p className="text-muted-foreground mt-1">
              Quản lý các mẫu email tự động gửi đến khách hàng
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Tạo template mới
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{templates.length}</p>
                  <p className="text-sm text-muted-foreground">Tổng templates</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{templates.filter(t => t.is_active).length}</p>
                  <p className="text-sm text-muted-foreground">Đang hoạt động</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-muted">
                  <AlertCircle className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{templates.filter(t => !t.is_active).length}</p>
                  <p className="text-sm text-muted-foreground">Đang tắt</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Templates List */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Danh sách Email Templates
            </CardTitle>
            <CardDescription>
              Tất cả các mẫu email đang được sử dụng trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            {templates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Chưa có email template nào</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => handleOpenDialog()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo template đầu tiên
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="p-2 rounded bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{template.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                          {template.slug}
                        </code>
                        <button 
                          onClick={() => copySlug(template.slug)}
                          className="p-1 hover:bg-muted rounded"
                        >
                          <Copy className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-2">
                      {template.variables?.slice(0, 3).map((v) => (
                        <Badge key={v} variant="outline" className="text-xs">
                          <Variable className="h-3 w-3 mr-1" />
                          {v}
                        </Badge>
                      ))}
                      {template.variables?.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.variables.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    <Badge 
                      variant="outline"
                      className={template.is_active 
                        ? "bg-green-500/10 text-green-500 border-green-500/20" 
                        : "bg-muted text-muted-foreground"
                      }
                    >
                      {template.is_active ? "Hoạt động" : "Tắt"}
                    </Badge>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={template.is_active}
                        onCheckedChange={() => handleToggleActive(template.id, template.is_active)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePreview(template)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Variables Reference */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Variable className="h-5 w-5 text-primary" />
              Biến có sẵn
            </CardTitle>
            <CardDescription>
              Sử dụng các biến này trong template với cú pháp {"{{variable}}"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { name: "store_name", desc: "Tên cửa hàng" },
                { name: "otp_code", desc: "Mã OTP" },
                { name: "year", desc: "Năm hiện tại" },
                { name: "customer_name", desc: "Tên khách hàng" },
                { name: "order_id", desc: "Mã đơn hàng" },
                { name: "order_items", desc: "Chi tiết đơn hàng" },
                { name: "total_amount", desc: "Tổng tiền" },
                { name: "shop_url", desc: "URL cửa hàng" },
              ].map((v) => (
                <div key={v.name} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                  <code className="text-xs font-mono text-primary">{`{{${v.name}}}`}</code>
                  <span className="text-xs text-muted-foreground">- {v.desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Chỉnh sửa Email Template" : "Tạo Email Template mới"}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate 
                ? "Cập nhật nội dung và cài đặt template" 
                : "Tạo mẫu email mới cho hệ thống"
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Tên template *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: OTP Đăng ký"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug (định danh) *</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    slug: e.target.value.toLowerCase().replace(/\s+/g, '-') 
                  })}
                  placeholder="VD: otp-signup"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Tiêu đề email *</Label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="VD: Mã xác thực của bạn - {{store_name}}"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Nội dung HTML</Label>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="visual" className="gap-2">
                    <Eye className="h-4 w-4" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="code" className="gap-2">
                    <Code className="h-4 w-4" />
                    HTML Code
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="visual" className="mt-2">
                  <div className="border rounded-lg p-4 bg-white min-h-[300px]">
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: formData.html_content
                          .replace(/\{\{store_name\}\}/g, "ThemeVN")
                          .replace(/\{\{otp_code\}\}/g, "123456")
                          .replace(/\{\{year\}\}/g, new Date().getFullYear().toString())
                      }} 
                    />
                  </div>
                </TabsContent>
                <TabsContent value="code" className="mt-2">
                  <Textarea
                    value={formData.html_content}
                    onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                    rows={15}
                    className="font-mono text-sm"
                  />
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Kích hoạt template</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingTemplate ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview Email</DialogTitle>
          </DialogHeader>
          <div className="border rounded-lg overflow-hidden bg-white">
            <div 
              dangerouslySetInnerHTML={{ __html: previewHtml }} 
              className="p-4"
            />
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminEmails;
