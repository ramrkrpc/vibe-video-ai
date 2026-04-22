import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Video, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ShareVideo = () => {
  const { token } = useParams<{ token: string }>();
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVideo = async () => {
      if (!token) { setError("Invalid share link"); setLoading(false); return; }
      const { data, error: fetchErr } = await supabase
        .from("videos")
        .select("*")
        .eq("share_token", token)
        .eq("shared", true)
        .single();
      if (fetchErr || !data) {
        setError("Video not found or sharing is disabled");
      } else {
        setVideo(data);
        // Increment view count
        await supabase.rpc("increment_view_count" as any, { video_id: data.id }).catch(() => {});
      }
      setLoading(false);
    };
    fetchVideo();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-3xl space-y-4">
          <Skeleton className="aspect-video w-full rounded-xl" />
          <Skeleton className="h-8 w-64" />
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="glass max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-3">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Video Not Found</h2>
            <p className="text-muted-foreground">{error || "This video may have been removed or sharing disabled."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-3xl space-y-4">
        <div className="aspect-video bg-secondary rounded-xl overflow-hidden">
          {video.video_url ? (
            <video
              src={video.video_url}
              controls
              autoPlay
              className="w-full h-full"
              poster={video.thumbnail_url || undefined}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Video className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{video.title}</h1>
          {video.view_count > 0 && (
            <p className="text-sm text-muted-foreground mt-1">{video.view_count} views</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareVideo;
