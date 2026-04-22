import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getFunctionErrorMessage } from "@/lib/get-function-error-message";

export interface HeyGenVoice {
  voice_id: string;
  language: string;
  gender: string;
  name: string;
  preview_audio?: string;
  support_pause?: boolean;
  emotion_support?: boolean;
}

export function useVoices() {
  return useQuery({
    queryKey: ["voices"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("heygen-list-voices");
      if (error) {
        const msg = await getFunctionErrorMessage(error, "Failed to load voices");
        throw new Error(msg.includes("No HeyGen API key") ? "No HeyGen API key configured. Please add your API key in Settings." : msg);
      }
      if (data?.error) throw new Error(data.error);
      const voices: HeyGenVoice[] = data?.data?.voices || [];
      return voices;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
