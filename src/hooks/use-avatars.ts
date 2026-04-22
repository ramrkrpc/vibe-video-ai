import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getFunctionErrorMessage } from "@/lib/get-function-error-message";

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
      if (error) {
        const msg = await getFunctionErrorMessage(error, "Failed to load avatars");
        throw new Error(msg.includes("No HeyGen API key") ? "No HeyGen API key configured. Please add your API key in Settings." : msg);
      }
      if (data?.error) throw new Error(data.error);
      const avatars: HeyGenAvatar[] = data?.data?.avatars || [];
      return avatars;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
