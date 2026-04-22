import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mic, Settings2, Play, Loader2, Wand2, Monitor, Smartphone, ChevronRight, ChevronLeft, Check, Volume2, AlertCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useCreateVideo } from "@/hooks/use-videos";
import { useVoices, type HeyGenVoice } from "@/hooks/use-voices";
import { useAvatars, type HeyGenAvatar } from "@/hooks/use-avatars";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { BackgroundPicker, type BackgroundConfig } from "@/components/BackgroundPicker";
import { AIScriptGenerator } from "@/components/AIScriptGenerator";
import { SaveAsTemplate } from "@/components/SaveAsTemplate";

const steps = ["Avatar", "Script", "Voice & Settings", "Review"];

const CreateVideo = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const createVideo = useCreateVideo();

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState(searchParams.get("title") || "");
  const [script, setScript] = useState(searchParams.get("script") || "");
  const [selectedAvatarId, setSelectedAvatarId] = useState(searchParams.get("avatar") || "");
  const [selectedAvatarName, setSelectedAvatarName] = useState(searchParams.get("avatarName") || "");
  const [selectedAvatarImg, setSelectedAvatarImg] = useState(searchParams.get("avatarImg") || "");
  const [voice, setVoice] = useState(searchParams.get("voice") || "");
  const [resolution, setResolution] = useState("1080p");
  const [ratio, setRatio] = useState("16:9");
  const [avatarSearch, setAvatarSearch] = useState("");
  const [voiceSearch, setVoiceSearch] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: avatars, isLoading: avatarsLoading, error: avatarsError } = useAvatars();
  const { data: voices, isLoading: voicesLoading, error: voicesError } = useVoices();

  const apiKeyMissing = avatarsError?.message?.includes("API key") || voicesError?.message?.includes("API key");

  const filteredAvatars = (avatars || []).filter((a) =>
    a.avatar_name?.toLowerCase().includes(avatarSearch.toLowerCase())
  );

  const filteredVoices = (voices || []).filter((v) =>
    v.name?.toLowerCase().includes(voiceSearch.toLowerCase()) ||
    v.language?.toLowerCase().includes(voiceSearch.toLowerCase())
  );

  const selectedVoice = voices?.find((v) => v.voice_id === voice);
  const wordCount = script.trim().split(/\s+/).filter(Boolean).length;
  const estimatedDuration = Math.max(1, Math.round(wordCount / 2.5));

  const handleGenerate = async () => {
    if (!script.trim()) { toast.error("Please enter a script"); return; }
    if (!voice) { toast.error("Please select a voice"); return; }
    if (!selectedAvatarId) { toast.error("Please select an avatar"); return; }
    if (!title.trim()) { toast.error("Please enter a title"); return; }

    try {
      await createVideo.mutateAsync({
        title: title.trim(),
        script: script.trim(),
        avatar_id: selectedAvatarId,
        voice_id: voice,
        resolution,
        aspect_ratio: ratio,
      });
      toast.success("Video generation started! Check My Videos for progress.");
      navigate("/videos");
    } catch (err: any) {
      toast.error(err.message || "Failed to start video generation");
    }
  };

  const playVoicePreview = (previewUrl: string | undefined) => {
    if (!previewUrl) return;
    if (audioRef.current) { audioRef.current.pause(); }
    audioRef.current = new Audio(previewUrl);
    audioRef.current.play().catch(() => {});
  };

  const canProceed = () => {
    switch (step) {
      case 0: return !!selectedAvatarId;
      case 1: return !!script.trim() && !!title.trim();
      case 2: return !!voice;
      default: return true;
    }
  };

  if (apiKeyMissing) {
    return (
      <div className="max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Create Video</h1>
          <p className="text-muted-foreground mt-1">Generate an AI video with a talking avatar</p>
        </div>
        <EmptyState
          icon={AlertCircle}
          title="HeyGen API Key Required"
          description="Add your HeyGen API key in Settings to start creating videos."
          actionLabel="Go to Settings"
          onAction={() => navigate("/settings")}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Create Video</h1>
        <p className="text-muted-foreground mt-1">Generate an AI video with a talking avatar</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                i === step
                  ? "gradient-primary text-primary-foreground"
                  : i < step
                  ? "bg-success/10 text-success cursor-pointer"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="w-3.5 h-3.5" /> : <span className="w-5 h-5 flex items-center justify-center text-xs font-medium">{i + 1}</span>}
              <span className="hidden sm:inline">{s}</span>
            </button>
            {i < steps.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {/* Step 0: Avatar Selection */}
      {step === 0 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base">Choose an Avatar</CardTitle>
              <Input
                placeholder="Search avatars..."
                value={avatarSearch}
                onChange={(e) => setAvatarSearch(e.target.value)}
                className="mt-2 max-w-sm"
              />
            </CardHeader>
            <CardContent>
              {avatarsLoading ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[400px] overflow-y-auto pr-1">
                  {filteredAvatars.map((avatar) => (
                    <div
                      key={avatar.avatar_id}
                      onClick={() => {
                        setSelectedAvatarId(avatar.avatar_id);
                        setSelectedAvatarName(avatar.avatar_name);
                        setSelectedAvatarImg(avatar.preview_image_url || "");
                      }}
                      className={`cursor-pointer rounded-lg border-2 p-1 transition-all ${
                        selectedAvatarId === avatar.avatar_id
                          ? "border-primary glow-primary"
                          : "border-transparent hover:border-border"
                      }`}
                    >
                      <div className="aspect-square rounded-md bg-secondary overflow-hidden">
                        {avatar.preview_image_url ? (
                          <img src={avatar.preview_image_url} alt={avatar.avatar_name} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-foreground truncate mt-1 px-1">{avatar.avatar_name}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step 1: Script */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-primary" /> Video Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input placeholder="Enter a title for your video" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label>Script</Label>
                  <AIScriptGenerator onGenerated={(s) => setScript(s)} />
                </div>
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
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step 2: Voice & Settings */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Mic className="w-4 h-4 text-primary" /> Voice
              </CardTitle>
              <Input
                placeholder="Search voices..."
                value={voiceSearch}
                onChange={(e) => setVoiceSearch(e.target.value)}
                className="mt-2"
              />
            </CardHeader>
            <CardContent>
              {voicesLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
                </div>
              ) : (
                <div className="space-y-1 max-h-[350px] overflow-y-auto pr-1">
                  {filteredVoices.map((v) => (
                    <div
                      key={v.voice_id}
                      onClick={() => setVoice(v.voice_id)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        voice === v.voice_id ? "bg-primary/10 border border-primary/30" : "hover:bg-secondary"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{v.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="secondary" className="text-xs">{v.language}</Badge>
                          <span className="text-xs text-muted-foreground">{v.gender}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {v.preview_audio && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => { e.stopPropagation(); playVoicePreview(v.preview_audio); }}
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {voice === v.voice_id && <Check className="w-4 h-4 text-primary" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-primary" /> Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Resolution</Label>
                <Select value={resolution} onValueChange={setResolution}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
        </motion.div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Review</CardTitle>
              <SaveAsTemplate title={title} script={script} avatarId={selectedAvatarId} voiceId={voice} />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Title</span><span className="text-foreground font-medium">{title || "Untitled"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Avatar</span><span className="text-foreground">{selectedAvatarName || selectedAvatarId}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Voice</span><span className="text-foreground">{selectedVoice?.name || voice}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Resolution</span><span className="text-foreground">{resolution}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Aspect Ratio</span><span className="text-foreground">{ratio}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Est. Duration</span><span className="text-foreground">~{estimatedDuration}s</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Words</span><span className="text-foreground">{wordCount}</span></div>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground mb-1">Script Preview</p>
                <p className="text-sm text-foreground line-clamp-4">{script}</p>
              </div>
            </CardContent>
          </Card>
          <div className="space-y-4">
            <Card className="glass">
              <CardContent className="pt-6">
                <div className="aspect-video rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
                  {selectedAvatarImg ? (
                    <img src={selectedAvatarImg} alt={selectedAvatarName} className="h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">{selectedAvatarName || "No avatar selected"}</p>
              </CardContent>
            </Card>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button className="w-full gradient-primary h-12 text-base" onClick={handleGenerate} disabled={createVideo.isPending}>
                {createVideo.isPending ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...</>
                ) : (
                  <><Play className="w-5 h-5 mr-2" /> Generate Video</>
                )}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        {step < steps.length - 1 && (
          <Button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="gradient-primary">
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreateVideo;
