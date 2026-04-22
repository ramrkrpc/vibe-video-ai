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

interface UseVoicesOptions {
  enabled?: boolean;
}

interface HeyGenVoicesQueryResult {
  voices: HeyGenVoice[];
  configured: boolean;
  message?: string;
}

export function useVoices({ enabled = true }: UseVoicesOptions = {}) {
  const query = useQuery<HeyGenVoicesQueryResult>({
    queryKey: ["voices"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("heygen-list-voices");
      if (error) {
        const msg = await getFunctionErrorMessage(error, "Failed to load voices");
        if (msg.includes("No HeyGen API key")) {
          return {
            voices: [],
            configured: false,
            message: "No HeyGen API key configured. Please add your API key in Settings.",
          };
        }
        throw new Error(msg);
      }
      if (data?.error) throw new Error(data.error);
      return {
        voices: data?.data?.voices || [],
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
    data: query.data?.voices ?? [],
    missingKey: query.data ? !query.data.configured : false,
    missingKeyMessage: query.data?.message,
  };
}
