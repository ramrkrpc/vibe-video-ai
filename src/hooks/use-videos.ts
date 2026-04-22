import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useVideos() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["videos", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useDeleteVideo() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (videoId: string) => {
      const { error } = await supabase
        .from("videos")
        .delete()
        .eq("id", videoId)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

export function useCreateVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      title: string;
      script: string;
      avatar_id: string;
      voice_id: string;
      resolution?: string;
      aspect_ratio?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("heygen-create-video", {
        body: params,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

export function useVideoStatusPoll(heygenVideoId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["video-status", heygenVideoId],
    queryFn: async () => {
      if (!heygenVideoId) return null;
      const { data, error } = await supabase.functions.invoke("heygen-video-status", {
        body: {},
        headers: {},
      });
      // Use query params approach
      const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/heygen-video-status`);
      url.searchParams.set("video_id", heygenVideoId);
      const session = await supabase.auth.getSession();
      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${session.data.session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });
      const result = await res.json();
      return result;
    },
    enabled: !!heygenVideoId && enabled,
    refetchInterval: 10000,
  });
}
