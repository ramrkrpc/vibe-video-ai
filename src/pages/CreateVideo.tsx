import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mic, Settings2, Play, Loader2, Wand2, Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const voices = [
  { id: "en-US-1", name: "English (US) - Female", lang: "English" },
  { id: "en-US-2", name: "English (US) - Male", lang: "English" },
  { id: "en-GB-1", name: "English (UK) - Female", lang: "English" },
  { id: "es-ES-1", name: "Spanish - Female", lang: "Spanish" },
  { id: "fr-FR-1", name: "French - Male", lang: "French" },
  { id: "de-DE-1", name: "German - Female", lang: "German" },
  { id: "zh-CN-1", name: "Chinese - Female", lang: "Chinese" },
  { id: "ja-JP-1", name: "Japanese - Female", lang: "Japanese" },
];

const CreateVideo = () => {
  const [script, setScript] = useState("");
  const [voice, setVoice] = useState("");
  const [resolution, setResolution] = useState("1080p");
  const [ratio, setRatio] = useState("16:9");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!script.trim()) {
      toast.error("Please enter a script");
      return;
    }
    if (!voice) {
      toast.error("Please select a voice");
      return;
    }

    setGenerating(true);
    toast.info("Video generation started! This may take a few minutes...");

    // Simulated — will wire to HeyGen API via edge function
    setTimeout(() => {
      setGenerating(false);
      toast.success("Video generated successfully!");
    }, 5000);
  };

  const wordCount = script.trim().split(/\s+/).filter(Boolean).length;
  const estimatedDuration = Math.max(1, Math.round(wordCount / 2.5));

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Create Video</h1>
        <p className="text-muted-foreground mt-1">Generate an AI video with a talking avatar</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Script & Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Script Input */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-primary" /> Script
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Type your video script here... The avatar will speak this text."
                value={script}
                onChange={(e) => setScript(e.target.value)}
                className="min-h-[200px] resize-none"
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{wordCount} words</span>
                <span>~{estimatedDuration}s estimated duration</span>
              </div>
            </CardContent>
          </Card>

          {/* Voice & Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Mic className="w-4 h-4 text-primary" /> Voice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={voice} onValueChange={setVoice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-primary" /> Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Resolution</Label>
                  <Select value={resolution} onValueChange={setResolution}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="720p">720p</SelectItem>
                      <SelectItem value="1080p">1080p (HD)</SelectItem>
                      <SelectItem value="4k">4K</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Aspect Ratio</Label>
                  <div className="flex gap-2 mt-1">
                    {[
                      { val: "16:9", icon: Monitor, label: "16:9" },
                      { val: "9:16", icon: Smartphone, label: "9:16" },
                      { val: "1:1", icon: Monitor, label: "1:1" },
                    ].map((r) => (
                      <Button
                        key={r.val}
                        variant={ratio === r.val ? "default" : "outline"}
                        size="sm"
                        onClick={() => setRatio(r.val)}
                        className={ratio === r.val ? "gradient-primary" : ""}
                      >
                        {r.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base">Avatar Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-lg bg-secondary flex items-center justify-center">
                <User className="w-16 h-16 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Select an avatar from the gallery
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="pt-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Voice</span>
                  <span className="text-foreground">{voice ? voices.find(v => v.id === voice)?.name?.split(" - ")[0] : "Not selected"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resolution</span>
                  <span className="text-foreground">{resolution}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Aspect Ratio</span>
                  <span className="text-foreground">{ratio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Duration</span>
                  <span className="text-foreground">~{estimatedDuration}s</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              className="w-full gradient-primary h-12 text-base"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" /> Generate Video
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CreateVideo;
