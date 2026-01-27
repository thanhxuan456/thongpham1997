import { useState, useEffect } from "react";
import { Palette, Sun, Moon, Monitor, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface ThemeAppearanceSettingsProps {
  values: Record<string, string>;
  onUpdate: (key: string, value: string) => void;
}

const colorPresets = [
  { name: "Indigo & Coral", primary: "250 84% 54%", accent: "20 95% 55%", id: "default" },
  { name: "Ocean Blue", primary: "210 100% 50%", accent: "180 100% 40%", id: "ocean" },
  { name: "Forest Green", primary: "142 76% 36%", accent: "84 85% 44%", id: "forest" },
  { name: "Sunset Purple", primary: "280 85% 55%", accent: "330 90% 55%", id: "sunset" },
  { name: "Rose Gold", primary: "350 80% 60%", accent: "25 90% 55%", id: "rose" },
  { name: "Midnight", primary: "220 90% 50%", accent: "250 85% 60%", id: "midnight" },
];

const fontPresets = [
  { name: "Inter", value: "Inter, sans-serif", id: "inter" },
  { name: "Roboto", value: "Roboto, sans-serif", id: "roboto" },
  { name: "Open Sans", value: "'Open Sans', sans-serif", id: "opensans" },
  { name: "Poppins", value: "Poppins, sans-serif", id: "poppins" },
  { name: "Montserrat", value: "Montserrat, sans-serif", id: "montserrat" },
];

const ThemeAppearanceSettings = ({ values, onUpdate }: ThemeAppearanceSettingsProps) => {
  const [selectedColorPreset, setSelectedColorPreset] = useState(values['THEME_COLOR_PRESET'] || 'default');
  const [selectedFont, setSelectedFont] = useState(values['THEME_FONT'] || 'inter');
  const [borderRadius, setBorderRadius] = useState(parseInt(values['THEME_BORDER_RADIUS'] || '12'));
  const [enableAnimations, setEnableAnimations] = useState(values['THEME_ANIMATIONS'] !== 'false');
  const [enableGlassEffect, setEnableGlassEffect] = useState(values['THEME_GLASS_EFFECT'] !== 'false');

  const handleColorPresetChange = (presetId: string) => {
    setSelectedColorPreset(presetId);
    onUpdate('THEME_COLOR_PRESET', presetId);
    
    const preset = colorPresets.find(p => p.id === presetId);
    if (preset) {
      onUpdate('THEME_PRIMARY_COLOR', preset.primary);
      onUpdate('THEME_ACCENT_COLOR', preset.accent);
    }
  };

  const handleFontChange = (fontId: string) => {
    setSelectedFont(fontId);
    onUpdate('THEME_FONT', fontId);
    
    const font = fontPresets.find(f => f.id === fontId);
    if (font) {
      onUpdate('THEME_FONT_FAMILY', font.value);
    }
  };

  return (
    <div className="space-y-6">
      {/* Color Presets */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="h-5 w-5 text-primary" />
            Bảng màu
          </CardTitle>
          <CardDescription>
            Chọn bảng màu chủ đạo cho website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {colorPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleColorPresetChange(preset.id)}
                className={cn(
                  "p-3 rounded-xl border-2 transition-all text-left relative",
                  selectedColorPreset === preset.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-6 h-6 rounded-full shadow-sm"
                    style={{ background: `hsl(${preset.primary})` }}
                  />
                  <div
                    className="w-6 h-6 rounded-full shadow-sm"
                    style={{ background: `hsl(${preset.accent})` }}
                  />
                </div>
                <span className="text-sm font-medium">{preset.name}</span>
                
                {selectedColorPreset === preset.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Typography</CardTitle>
          <CardDescription>
            Chọn font chữ cho website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedFont}
            onValueChange={handleFontChange}
            className="grid grid-cols-2 md:grid-cols-3 gap-3"
          >
            {fontPresets.map((font) => (
              <div key={font.id}>
                <RadioGroupItem
                  value={font.id}
                  id={font.id}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={font.id}
                  className={cn(
                    "flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all",
                    "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5",
                    "hover:border-primary/50"
                  )}
                  style={{ fontFamily: font.value }}
                >
                  <span className="text-lg">{font.name}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* UI Settings */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Tùy chỉnh UI</CardTitle>
          <CardDescription>
            Điều chỉnh các thành phần giao diện
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Border Radius */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Bo góc (Border Radius)</Label>
              <span className="text-sm text-muted-foreground">{borderRadius}px</span>
            </div>
            <Slider
              value={[borderRadius]}
              onValueChange={([value]) => {
                setBorderRadius(value);
                onUpdate('THEME_BORDER_RADIUS', value.toString());
              }}
              min={0}
              max={24}
              step={2}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Vuông</span>
              <span>Tròn</span>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Hiệu ứng Animation</Label>
                <p className="text-sm text-muted-foreground">Bật/tắt các hiệu ứng chuyển động</p>
              </div>
              <Switch
                checked={enableAnimations}
                onCheckedChange={(checked) => {
                  setEnableAnimations(checked);
                  onUpdate('THEME_ANIMATIONS', checked.toString());
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Hiệu ứng Glass (Glassmorphism)</Label>
                <p className="text-sm text-muted-foreground">Hiệu ứng kính mờ cho các card</p>
              </div>
              <Switch
                checked={enableGlassEffect}
                onCheckedChange={(checked) => {
                  setEnableGlassEffect(checked);
                  onUpdate('THEME_GLASS_EFFECT', checked.toString());
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThemeAppearanceSettings;
