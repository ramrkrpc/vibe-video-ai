import { useState } from "react";
import { Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const presetColors = [
  { name: "White", value: "#FFFFFF" },
  { name: "Off White", value: "#F5F5F5" },
  { name: "Light Gray", value: "#E0E0E0" },
  { name: "Dark Gray", value: "#333333" },
  { name: "Black", value: "#000000" },
  { name: "Blue", value: "#1E40AF" },
  { name: "Green", value: "#166534" },
  { name: "Red", value: "#991B1B" },
  { name: "Purple", value: "#6B21A8" },
  { name: "Teal", value: "#115E59" },
];

const presetImages = [
  { name: "Office", url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80" },
  { name: "Studio", url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80" },
  { name: "City", url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80" },
  { name: "Nature", url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80" },
  { name: "Abstract", url: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&q=80" },
  { name: "Gradient", url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80" },
];

export type BackgroundConfig = {
  type: "color" | "image" | "none";
  value: string;
};

interface BackgroundPickerProps {
  background: BackgroundConfig;
  onChange: (bg: BackgroundConfig) => void;
}

export function BackgroundPicker({ background, onChange }: BackgroundPickerProps) {
  const [tab, setTab] = useState<"none" | "color" | "image">(background.type);

  return (
    <div className="space-y-3">
      <Label className="text-xs text-muted-foreground">Background</Label>
      <div className="flex gap-2">
        {(["none", "color", "image"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); if (t === "none") onChange({ type: "none", value: "" }); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "none" ? "Default" : t === "color" ? "Solid Color" : "Image"}
          </button>
        ))}
      </div>

      {tab === "color" && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {presetColors.map((c) => (
              <button
                key={c.value}
                onClick={() => onChange({ type: "color", value: c.value })}
                className={`w-8 h-8 rounded-lg border-2 transition-all ${
                  background.type === "color" && background.value === c.value ? "border-primary scale-110" : "border-border hover:border-muted-foreground"
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              >
                {background.type === "color" && background.value === c.value && (
                  <Check className={`w-4 h-4 mx-auto ${c.value === "#FFFFFF" || c.value === "#F5F5F5" || c.value === "#E0E0E0" ? "text-foreground" : "text-white"}`} />
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">Custom:</Label>
            <Input
              type="color"
              value={background.type === "color" ? background.value : "#FFFFFF"}
              onChange={(e) => onChange({ type: "color", value: e.target.value })}
              className="w-10 h-8 p-0.5 cursor-pointer"
            />
          </div>
        </div>
      )}

      {tab === "image" && (
        <div className="grid grid-cols-3 gap-2">
          {presetImages.map((img) => (
            <button
              key={img.url}
              onClick={() => onChange({ type: "image", value: img.url })}
              className={`aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                background.type === "image" && background.value === img.url ? "border-primary" : "border-transparent hover:border-border"
              }`}
            >
              <img src={img.url} alt={img.name} className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
