import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AIScriptGeneratorProps {
  onGenerated: (script: string) => void;
}

export function AIScriptGenerator({ onGenerated }: AIScriptGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [duration, setDuration] = useState("60s");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate-script", {
        body: { topic: topic.trim(), tone, duration },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.script) {
        onGenerated(data.script);
        setOpen(false);
        setTopic("");
        toast.success("Script generated!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate script");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> AI Generate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Generate Script with AI
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label>Topic / Prompt</Label>
            <Input
              placeholder="e.g. Introduce our new SaaS product for remote teams"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="mt-1"
              onKeyDown={(e) => e.key === "Enter" && !loading && handleGenerate()}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30s">~30 seconds</SelectItem>
                  <SelectItem value="60s">~60 seconds</SelectItem>
                  <SelectItem value="90s">~90 seconds</SelectItem>
                  <SelectItem value="120s">~2 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={loading || !topic.trim()} className="w-full gradient-primary">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4 mr-2" /> Generate Script</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
