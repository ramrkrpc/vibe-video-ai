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

interface UseAvatarsOptions {
  enabled?: boolean;
}

interface HeyGenAvatarsQueryResult {
  avatars: HeyGenAvatar[];
  configured: boolean;
  message?: string;
}

export function useAvatars({ enabled = true }: UseAvatarsOptions = {}) {
  const query = useQuery<HeyGenAvatarsQueryResult>({
    queryKey: ["avatars"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("heygen-list-avatars");
      if (error) {
        const msg = await getFunctionErrorMessage(error, "Failed to load avatars");
        if (msg.includes("No HeyGen API key")) {
          return {
            avatars: [],
            configured: false,
            message: "No HeyGen API key configured. Please add your API key in Settings.",
          };
        }
        throw new Error(msg);
      }
      if (data?.error) throw new Error(data.error);
      return {
        avatars: data?.data?.avatars || [],
        configured: data?.configured ?? true,
        message: data?.message,
      };
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled,
  });

  return {
    ...query,
    data: query.data?.avatars ?? [],
    missingKey: query.data ? !query.data.configured : false,
    missingKeyMessage: query.data?.message,
  };
}
