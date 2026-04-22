import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const voices: HeyGenVoice[] = data?.data?.voices || [];
      return voices;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
