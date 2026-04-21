import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Download, Trash2, Share2, MoreVertical, Search, Grid, List } from "lucide-react";
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

const mockVideos = [
  { id: "1", title: "Product Launch Intro", status: "completed", duration: "2:34", createdAt: "2024-01-15", avatar: "Sarah Chen" },
  { id: "2", title: "Sales Training Module 1", status: "completed", duration: "5:12", createdAt: "2024-01-14", avatar: "James Wilson" },
  { id: "3", title: "Customer Testimonial", status: "processing", duration: "--", createdAt: "2024-01-15", avatar: "Aisha Patel" },
  { id: "4", title: "Quarterly Report Summary", status: "completed", duration: "3:45", createdAt: "2024-01-12", avatar: "Marcus Johnson" },
  { id: "5", title: "Welcome Message", status: "completed", duration: "1:20", createdAt: "2024-01-10", avatar: "Elena Rodriguez" },
  { id: "6", title: "Feature Announcement", status: "failed", duration: "--", createdAt: "2024-01-09", avatar: "David Kim" },
];

const MyVideos = () => {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedVideo, setSelectedVideo] = useState<typeof mockVideos[0] | null>(null);

  const filtered = mockVideos.filter((v) =>
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

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Videos</h1>
          <p className="text-muted-foreground mt-1">{mockVideos.length} videos total</p>
        </div>
        <div className="flex gap-3">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search videos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex border border-border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="rounded-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
              className="rounded-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((video, i) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className="glass hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => setSelectedVideo(video)}
              >
                <CardContent className="p-4">
                  <div className="aspect-video rounded-lg bg-secondary flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors relative">
                    <Play className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                    {video.status === "processing" && (
                      <div className="absolute inset-0 bg-background/50 rounded-lg flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">{video.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{video.avatar} · {video.duration}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Download className="w-4 h-4 mr-2" /> Download</DropdownMenuItem>
                        <DropdownMenuItem><Share2 className="w-4 h-4 mr-2" /> Share</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`${statusColor(video.status)} text-xs border-0`}>{video.status}</Badge>
                    <span className="text-xs text-muted-foreground">{video.createdAt}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((video) => (
            <div
              key={video.id}
              className="flex items-center justify-between p-4 rounded-lg glass hover:border-primary/30 transition-colors cursor-pointer"
              onClick={() => setSelectedVideo(video)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                  <Play className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{video.title}</p>
                  <p className="text-xs text-muted-foreground">{video.avatar} · {video.createdAt}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">{video.duration}</span>
                <Badge className={`${statusColor(video.status)} text-xs border-0`}>{video.status}</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Download className="w-4 h-4 mr-2" /> Download</DropdownMenuItem>
                    <DropdownMenuItem><Share2 className="w-4 h-4 mr-2" /> Share</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
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
          <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center">
            <Play className="w-16 h-16 text-muted-foreground" />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedVideo?.avatar} · {selectedVideo?.duration} · {selectedVideo?.createdAt}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> Download</Button>
              <Button variant="outline" size="sm"><Share2 className="w-4 h-4 mr-2" /> Share</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyVideos;
