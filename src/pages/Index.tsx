import { motion } from "framer-motion";
import { Video, Users, LayoutTemplate, Play, Plus, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const stats = [
  { label: "Videos Created", value: "12", icon: Video, change: "+3 this week" },
  { label: "Avatars Used", value: "5", icon: Users, change: "2 new available" },
  { label: "Templates", value: "24", icon: LayoutTemplate, change: "Browse all" },
  { label: "Watch Time", value: "1.5h", icon: Clock, change: "Total duration" },
];

const recentVideos = [
  { id: 1, title: "Product Launch Intro", status: "completed", duration: "2:34", date: "2 hours ago" },
  { id: 2, title: "Sales Training Module 1", status: "completed", duration: "5:12", date: "Yesterday" },
  { id: 3, title: "Customer Testimonial", status: "processing", duration: "--", date: "Just now" },
  { id: 4, title: "Quarterly Report", status: "completed", duration: "3:45", date: "3 days ago" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "Creator";

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
            <Button
              onClick={() => navigate("/create")}
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <Plus className="w-4 h-4 mr-2" /> Create Video
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/templates")}
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <LayoutTemplate className="w-4 h-4 mr-2" /> Use Template
            </Button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
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

      {/* Usage & Credits */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-primary" /> Usage This Month
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">API Credits</span>
              <span className="text-foreground font-medium">75 / 100</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Videos Generated</span>
              <span className="text-foreground font-medium">12 / 50</span>
            </div>
            <Progress value={24} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Recent Videos */}
      <Card className="glass">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Videos</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate("/videos")}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentVideos.map((video) => (
              <div
                key={video.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Play className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{video.title}</p>
                    <p className="text-xs text-muted-foreground">{video.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">{video.duration}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      video.status === "completed"
                        ? "bg-success/10 text-success"
                        : "bg-warning/10 text-warning"
                    }`}
                  >
                    {video.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
