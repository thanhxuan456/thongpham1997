import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Copy, RefreshCw, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PasswordGeneratorProps {
  onSelect: (password: string) => void;
}

const PasswordGenerator = ({ onSelect }: PasswordGeneratorProps) => {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const generatePassword = useCallback(() => {
    let charset = "";
    if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (includeNumbers) charset += "0123456789";
    if (includeSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (!charset) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng chọn ít nhất một loại ký tự",
      });
      return;
    }

    let password = "";
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      password += charset[array[i] % charset.length];
    }

    setGeneratedPassword(password);
    setCopied(false);
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    toast({
      title: "Đã sao chép",
      description: "Mật khẩu đã được sao chép vào clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const usePassword = () => {
    if (generatedPassword) {
      onSelect(generatedPassword);
      toast({
        title: "Đã áp dụng",
        description: "Mật khẩu đã được điền vào form",
      });
    }
  };

  const getStrengthColor = () => {
    if (length < 8) return "bg-destructive";
    if (length < 12) return "bg-yellow-500";
    if (length < 16) return "bg-primary";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    const types = [includeUppercase, includeLowercase, includeNumbers, includeSymbols].filter(Boolean).length;
    if (length < 8 || types < 2) return "Yếu";
    if (length < 12 || types < 3) return "Trung bình";
    if (length < 16 || types < 4) return "Mạnh";
    return "Rất mạnh";
  };

  return (
    <div className="space-y-4 p-4 rounded-lg border border-border/50 bg-muted/30">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">Tạo mật khẩu mạnh</h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={generatePassword}
          className="gap-1 text-xs"
        >
          <RefreshCw className="h-3 w-3" />
          Tạo mới
        </Button>
      </div>

      {generatedPassword && (
        <div className="p-3 rounded-md bg-background border border-border/50">
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-sm break-all">
              {generatedPassword}
            </code>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={copyToClipboard}
              className="shrink-0 h-8 w-8"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <div className={`h-1.5 w-16 rounded-full ${getStrengthColor()}`} />
              <span className="text-xs text-muted-foreground">{getStrengthText()}</span>
            </div>
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={usePassword}
              className="text-xs h-auto p-0"
            >
              Sử dụng mật khẩu này
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Độ dài: {length} ký tự</Label>
          </div>
          <Slider
            value={[length]}
            onValueChange={(value) => setLength(value[0])}
            min={6}
            max={32}
            step={1}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between p-2 rounded-md bg-background/50">
            <Label className="text-xs cursor-pointer">Chữ HOA (A-Z)</Label>
            <Switch
              checked={includeUppercase}
              onCheckedChange={setIncludeUppercase}
            />
          </div>
          <div className="flex items-center justify-between p-2 rounded-md bg-background/50">
            <Label className="text-xs cursor-pointer">Chữ thường (a-z)</Label>
            <Switch
              checked={includeLowercase}
              onCheckedChange={setIncludeLowercase}
            />
          </div>
          <div className="flex items-center justify-between p-2 rounded-md bg-background/50">
            <Label className="text-xs cursor-pointer">Số (0-9)</Label>
            <Switch
              checked={includeNumbers}
              onCheckedChange={setIncludeNumbers}
            />
          </div>
          <div className="flex items-center justify-between p-2 rounded-md bg-background/50">
            <Label className="text-xs cursor-pointer">Ký tự đặc biệt</Label>
            <Switch
              checked={includeSymbols}
              onCheckedChange={setIncludeSymbols}
            />
          </div>
        </div>
      </div>

      {!generatedPassword && (
        <Button
          type="button"
          variant="outline"
          onClick={generatePassword}
          className="w-full text-sm gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Tạo mật khẩu ngẫu nhiên
        </Button>
      )}
    </div>
  );
};

export default PasswordGenerator;
