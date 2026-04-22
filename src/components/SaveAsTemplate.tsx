import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SaveAsTemplateProps {
  title: string;
  script: string;
  avatarId: string;
  voiceId: string;
}

const categories = ["Marketing", "Sales", "HR", "Education", "Content", "Events", "Other"];

export function SaveAsTemplate({ title, script, avatarId, voiceId }: SaveAsTemplateProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [templateTitle, setTemplateTitle] = useState(title);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Marketing");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    if (!templateTitle.trim()) {
      toast.error("Please enter a template title");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("templates").insert({
        title: templateTitle.trim(),
        description: description.trim() || null,
        category,
        script,
        avatar_id: avatarId || null,
        voice_id: voiceId || null,
        is_public: false,
        user_id: user.id,
      });
      if (error) throw error;
      toast.success("Template saved!");
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Save className="w-3.5 h-3.5" /> Save as Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label>Template Name</Label>
            <Input value={templateTitle} onChange={(e) => setTemplateTitle(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Description (optional)</Label>
            <Input
              placeholder="Brief description of this template"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSave} disabled={saving || !templateTitle.trim()} className="w-full gradient-primary">
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Template</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
