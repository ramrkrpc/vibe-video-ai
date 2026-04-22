import { motion } from "framer-motion";
import { Video, Users, LayoutTemplate, Play, Plus, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useVideos } from "@/hooks/use-videos";
import { useProfile } from "@/hooks/use-profile";
import { StatsSkeleton } from "@/components/PageSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: videos, isLoading } = useVideos();

  const firstName = profile?.full_name?.split(" ")[0] || user?.user_metadata?.full_name?.split(" ")[0] || "Creator";
  const hasApiKey = !!profile?.heygen_api_key;

  const totalVideos = videos?.length || 0;
  const completedVideos = videos?.filter((v) => v.status === "completed") || [];
  const processingVideos = videos?.filter((v) => v.status === "processing") || [];
  const totalDuration = completedVideos.reduce((sum, v) => sum + (v.duration_seconds || 0), 0);
  const recentVideos = videos?.slice(0, 5) || [];

  const stats = [
    { label: "Videos Created", value: String(totalVideos), icon: Video, change: `${completedVideos.length} completed` },
    { label: "Processing", value: String(processingVideos.length), icon: Clock, change: processingVideos.length > 0 ? "In progress" : "None active" },
    { label: "Templates", value: "8", icon: LayoutTemplate, change: "Browse all" },
    { label: "Watch Time", value: totalDuration > 3600 ? `${(totalDuration / 3600).toFixed(1)}h` : `${Math.round(totalDuration / 60)}m`, icon: TrendingUp, change: "Total duration" },
  ];

  const statusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-success/10 text-success";
      case "processing": return "bg-warning/10 text-warning";
      case "failed": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl gradient-primary p-8"
      >
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-primary-foreground mb-2">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-primary-foreground/80 mb-6 max-w-lg">
            Create stunning AI-powered videos with realistic avatars. Choose an avatar, write your script, and generate professional videos in minutes.
          </p>
          <div className="flex gap-3">
            <Button onClick={() => navigate("/create")} className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              <Plus className="w-4 h-4 mr-2" /> Create Video
            </Button>
            <Button variant="outline" onClick={() => navigate("/templates")} className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <LayoutTemplate className="w-4 h-4 mr-2" /> Use Template
            </Button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </motion.div>

      {/* API Key Warning */}
      {!hasApiKey && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="flex items-center gap-4 py-4">
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Set up your HeyGen API key to get started</p>
                <p className="text-xs text-muted-foreground">Go to Settings → HeyGen API Key to enable video generation</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate("/settings")}>
                Add API Key
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats */}
      {isLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass hover:border-primary/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Recent Videos */}
      <Card className="glass">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Videos</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate("/videos")}>View All</Button>
        </CardHeader>
        <CardContent>
          {recentVideos.length === 0 ? (
            <EmptyState
              icon={Video}
              title="No videos yet"
              description="Create your first AI video to see it here"
              actionLabel="Create Video"
              onAction={() => navigate("/create")}
            />
          ) : (
            <div className="space-y-3">
              {recentVideos.map((video) => (
                <div
                  key={video.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                  onClick={() => navigate("/videos")}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                      {video.thumbnail_url ? (
                        <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Play className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{video.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">
                      {video.duration_seconds ? `${Math.floor(video.duration_seconds / 60)}:${String(video.duration_seconds % 60).padStart(2, "0")}` : "--"}
                    </span>
                    <Badge className={`${statusColor(video.status)} text-xs border-0`}>{video.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
