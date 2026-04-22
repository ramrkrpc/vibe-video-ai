import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HeyGenAvatar {
  avatar_id: string;
  avatar_name: string;
  gender: string;
  preview_image_url: string;
  preview_video_url?: string;
}

export function useAvatars() {
  return useQuery({
    queryKey: ["avatars"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("heygen-list-avatars");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      // HeyGen v2 returns { data: { avatars: [...] } }
      const avatars: HeyGenAvatar[] = data?.data?.avatars || [];
      return avatars;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
