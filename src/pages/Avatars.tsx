import { useState } from "react";
import { motion } from "framer-motion";
import { Search, User, Users, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAvatars } from "@/hooks/use-avatars";
import { AvatarGridSkeleton } from "@/components/PageSkeleton";
import { EmptyState } from "@/components/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { HeyGenAvatar } from "@/hooks/use-avatars";

const Avatars = () => {
  const [search, setSearch] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<HeyGenAvatar | null>(null);
  const navigate = useNavigate();
  const { data: avatars, isLoading, error } = useAvatars();

  const filtered = (avatars || []).filter((a) =>
    a.avatar_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectAndCreate = (avatar: HeyGenAvatar) => {
    navigate(`/create?avatar=${avatar.avatar_id}&avatarName=${encodeURIComponent(avatar.avatar_name)}&avatarImg=${encodeURIComponent(avatar.preview_image_url || "")}`);
  };

  if (error) {
    return (
      <div className="max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">AI Avatars</h1>
          <p className="text-muted-foreground mt-1">Choose an avatar for your video</p>
        </div>
        <EmptyState
          icon={AlertCircle}
          title="Could not load avatars"
          description={error.message || "Make sure your HeyGen API key is configured in Settings"}
          actionLabel="Go to Settings"
          onAction={() => navigate("/settings")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Avatars</h1>
        <p className="text-muted-foreground mt-1">
          {avatars ? `${avatars.length} avatars available` : "Choose an avatar for your video"}
        </p>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search avatars..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <AvatarGridSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No avatars found"
          description={search ? "Try a different search term" : "No avatars available. Check your API key in Settings."}
          actionLabel={!search ? "Go to Settings" : undefined}
          onAction={!search ? () => navigate("/settings") : undefined}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filtered.map((avatar, i) => (
            <motion.div
              key={avatar.avatar_id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i * 0.02, 0.5) }}
            >
              <Card
                className="glass hover:border-primary/50 transition-all cursor-pointer group hover:glow-primary"
                onClick={() => setSelectedAvatar(avatar)}
              >
                <CardContent className="p-4">
                  <div className="aspect-square rounded-lg bg-secondary flex items-center justify-center mb-3 overflow-hidden group-hover:ring-2 ring-primary/40 transition-all">
                    {avatar.preview_image_url ? (
                      <img
                        src={avatar.preview_image_url}
                        alt={avatar.avatar_name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <User className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-foreground truncate">{avatar.avatar_name}</p>
                  <Badge variant="secondary" className="text-xs mt-1">{avatar.gender || "Unknown"}</Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Avatar Detail Modal */}
      <Dialog open={!!selectedAvatar} onOpenChange={() => setSelectedAvatar(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedAvatar?.avatar_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-square max-h-80 mx-auto rounded-xl overflow-hidden bg-secondary">
              {selectedAvatar?.preview_image_url ? (
                <img
                  src={selectedAvatar.preview_image_url}
                  alt={selectedAvatar.avatar_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-20 h-20 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedAvatar?.gender || "Unknown"}</Badge>
              <span className="text-xs text-muted-foreground">ID: {selectedAvatar?.avatar_id}</span>
            </div>
            <div className="flex gap-3">
              <Button
                className="flex-1 gradient-primary"
                onClick={() => selectedAvatar && handleSelectAndCreate(selectedAvatar)}
              >
                Select & Create Video
              </Button>
              <Button variant="outline" onClick={() => setSelectedAvatar(null)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Avatars;
