import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface FishAudioVoice {
  _id: string;
  title: string;
  description?: string;
  cover_image?: string;
  samples?: { url: string }[];
  languages?: string[];
  task_count?: number;
}

export function useFishAudioVoices() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["fish-audio-voices", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("fish-audio-voices");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return (data?.items || []) as FishAudioVoice[];
    },
    enabled: !!user,
  });
}

export function useFishAudioTTS() {
  return useMutation({
    mutationFn: async (params: { text: string; voice_id: string; format?: string }) => {
      const session = await supabase.auth.getSession();
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const url = `https://${projectId}.supabase.co/functions/v1/fish-audio-tts`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.data.session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "TTS failed" }));
        throw new Error(err.error || "TTS failed");
      }

      const blob = await res.blob();
      return URL.createObjectURL(blob);
    },
  });
}
