import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Download, Trash2, Share2, MoreVertical, Search, Grid, List, Video, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useVideos, useDeleteVideo } from "@/hooks/use-videos";
import { VideoGridSkeleton } from "@/components/PageSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type VideoRow = NonNullable<ReturnType<typeof useVideos>["data"]>[number];

const MyVideos = () => {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedVideo, setSelectedVideo] = useState<VideoRow | null>(null);
  const { data: videos, isLoading } = useVideos();
  const deleteVideo = useDeleteVideo();
  const navigate = useNavigate();

  const filtered = (videos || []).filter((v) =>
    v.title.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-success/10 text-success";
      case "processing": return "bg-warning/10 text-warning";
      case "failed": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "--";
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  };

  const handleDelete = async (videoId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await deleteVideo.mutateAsync(videoId);
      setSelectedVideo(null);
      toast.success("Video deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete video");
    }
  };

  const handleDownload = (video: VideoRow, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (video.video_url) {
      window.open(video.video_url, "_blank");
    } else {
      toast.error("Video not ready for download");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Videos</h1>
          <p className="text-muted-foreground mt-1">{videos?.length || 0} videos total</p>
        </div>
        <div className="flex gap-3">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search videos..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex border border-border rounded-lg overflow-hidden">
            <Button variant={viewMode === "grid" ? "default" : "ghost"} size="icon" onClick={() => setViewMode("grid")} className="rounded-none">
              <Grid className="w-4 h-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "ghost"} size="icon" onClick={() => setViewMode("list")} className="rounded-none">
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <VideoGridSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Video}
          title={search ? "No videos found" : "No videos yet"}
          description={search ? "Try a different search term" : "Create your first AI video to see it here"}
          actionLabel={!search ? "Create Video" : undefined}
          onAction={!search ? () => navigate("/create") : undefined}
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((video, i) => (
            <motion.div key={video.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass hover:border-primary/50 transition-all cursor-pointer group" onClick={() => setSelectedVideo(video)}>
                <CardContent className="p-4">
                  <div className="aspect-video rounded-lg bg-secondary flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors relative overflow-hidden">
                    {video.thumbnail_url ? (
                      <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <Play className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                    {video.status === "processing" && (
                      <div className="absolute inset-0 bg-background/50 rounded-lg flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">{video.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(video.created_at), { addSuffix: true })} · {formatDuration(video.duration_seconds)}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => handleDownload(video, e as any)}>
                          <Download className="w-4 h-4 mr-2" /> Download
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={(e) => handleDelete(video.id, e as any)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`${statusColor(video.status)} text-xs border-0`}>{video.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((video) => (
            <div key={video.id} className="flex items-center justify-between p-4 rounded-lg glass hover:border-primary/30 transition-colors cursor-pointer" onClick={() => setSelectedVideo(video)}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
                  {video.thumbnail_url ? (
                    <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Play className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">{video.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">{formatDuration(video.duration_seconds)}</span>
                <Badge className={`${statusColor(video.status)} text-xs border-0`}>{video.status}</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => handleDownload(video, e as any)}>
                      <Download className="w-4 h-4 mr-2" /> Download
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={(e) => handleDelete(video.id, e as any)}>
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Playback Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedVideo?.title}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center overflow-hidden">
            {selectedVideo?.video_url ? (
              <video
                src={selectedVideo.video_url}
                controls
                autoPlay
                className="w-full h-full rounded-lg"
                poster={selectedVideo.thumbnail_url || undefined}
              />
            ) : selectedVideo?.status === "processing" ? (
              <div className="text-center">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Video is being generated...</p>
              </div>
            ) : selectedVideo?.status === "failed" ? (
              <div className="text-center px-4">
                <p className="text-sm text-destructive font-medium mb-1">Generation failed</p>
                <p className="text-xs text-muted-foreground">{selectedVideo.error_message || "Unknown error"}</p>
              </div>
            ) : (
              <Play className="w-16 h-16 text-muted-foreground" />
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {formatDuration(selectedVideo?.duration_seconds ?? null)} · {selectedVideo && formatDistanceToNow(new Date(selectedVideo.created_at), { addSuffix: true })}
            </div>
            <div className="flex gap-2">
              {selectedVideo?.video_url && (
                <Button variant="outline" size="sm" onClick={() => handleDownload(selectedVideo)}>
                  <Download className="w-4 h-4 mr-2" /> Download
                </Button>
              )}
              <Button variant="outline" size="sm" className="text-destructive" onClick={() => selectedVideo && handleDelete(selectedVideo.id)}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyVideos;
