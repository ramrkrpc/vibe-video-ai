import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const QuerySchema = z.object({
  video_id: z.string().min(1),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const parsed = QuerySchema.safeParse({ video_id: url.searchParams.get("video_id") });
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "video_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("heygen_api_key")
      .eq("id", user.id)
      .single();

    const apiKey = profile?.heygen_api_key || Deno.env.get("HEYGEN_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "No HeyGen API key configured" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const heygenRes = await fetch(
      `https://api.heygen.com/v1/video_status.get?video_id=${parsed.data.video_id}`,
      { headers: { "X-Api-Key": apiKey } }
    );

    const data = await heygenRes.json();

    // If completed, update video record
    if (data.data?.status === "completed") {
      await supabase
        .from("videos")
        .update({
          status: "completed",
          video_url: data.data.video_url,
          thumbnail_url: data.data.thumbnail_url,
          duration_seconds: data.data.duration,
        })
        .eq("heygen_video_id", parsed.data.video_id)
        .eq("user_id", user.id);
    } else if (data.data?.status === "failed") {
      await supabase
        .from("videos")
        .update({
          status: "failed",
          error_message: data.data.error?.message || "Generation failed",
        })
        .eq("heygen_video_id", parsed.data.video_id)
        .eq("user_id", user.id);
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
