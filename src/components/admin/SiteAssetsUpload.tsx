import { useState, useRef } from "react";
import { Upload, Trash2, Loader2, Image as ImageIcon, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SiteAssetsUploadProps {
  type: "favicon" | "logo" | "og-image";
  currentUrl?: string;
  onUploadComplete: (url: string) => void;
  onDelete?: () => void;
}

const assetConfig = {
  favicon: {
    label: "Favicon",
    description: "Icon hiển thị trên tab trình duyệt (32x32 hoặc 64x64 px)",
    accept: "image/png,image/x-icon,image/ico,.ico",
    maxSize: 1, // MB
    folder: "favicon",
  },
  logo: {
    label: "Logo",
    description: "Logo hiển thị trên header và footer",
    accept: "image/png,image/jpeg,image/webp,image/svg+xml",
    maxSize: 2,
    folder: "logo",
  },
  "og-image": {
    label: "OG Image",
    description: "Ảnh chia sẻ trên mạng xã hội (1200x630 px)",
    accept: "image/png,image/jpeg,image/webp",
    maxSize: 5,
    folder: "og-image",
  },
};

const SiteAssetsUpload = ({ type, currentUrl, onUploadComplete, onDelete }: SiteAssetsUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const config = assetConfig[type];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > config.maxSize * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File quá lớn",
        description: `Kích thước tối đa là ${config.maxSize}MB`,
      });
      return;
    }

    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${config.folder}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("site-assets")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("site-assets")
        .getPublicUrl(data.path);

      onUploadComplete(urlData.publicUrl);

      toast({
        title: "Tải lên thành công",
        description: `${config.label} đã được cập nhật`,
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Lỗi tải lên",
        description: error.message || "Không thể tải lên file",
      });
      setPreview(currentUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentUrl) return;

    try {
      // Extract path from URL
      const urlParts = currentUrl.split('/site-assets/');
      if (urlParts.length > 1) {
        await supabase.storage.from("site-assets").remove([urlParts[1]]);
      }

      setPreview(null);
      onDelete?.();

      toast({
        title: "Đã xóa",
        description: `${config.label} đã được xóa`,
      });
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Preview */}
          <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
            {preview ? (
              <img 
                src={preview} 
                alt={config.label} 
                className="w-full h-full object-contain"
              />
            ) : (
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            )}
          </div>

          {/* Info & Actions */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground">{config.label}</h4>
            <p className="text-sm text-muted-foreground mb-3">{config.description}</p>
            
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={config.accept}
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                size="sm"
                variant={preview ? "outline" : "default"}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {preview ? "Thay đổi" : "Tải lên"}
              </Button>
              
              {preview && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={uploading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            {preview && (
              <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                <CheckCircle className="h-3 w-3" />
                Đã tải lên
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SiteAssetsUpload;
