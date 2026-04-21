import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const BodySchema = z.object({
  title: z.string().min(1).max(500),
  script: z.string().min(1).max(10000),
  avatar_id: z.string().min(1),
  voice_id: z.string().min(1),
  resolution: z.string().optional().default("1080p"),
  aspect_ratio: z.string().optional().default("16:9"),
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

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { title, script, avatar_id, voice_id, resolution, aspect_ratio } = parsed.data;

    // Get user's HeyGen API key from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("heygen_api_key")
      .eq("id", user.id)
      .single();

    const apiKey = profile?.heygen_api_key || Deno.env.get("HEYGEN_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "No HeyGen API key configured. Add it in Settings." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call HeyGen API
    const heygenRes = await fetch("https://api.heygen.com/v2/video/generate", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        video_inputs: [
          {
            character: {
              type: "avatar",
              avatar_id: avatar_id,
              avatar_style: "normal",
            },
            voice: {
              type: "text",
              input_text: script,
              voice_id: voice_id,
            },
          },
        ],
        dimension: {
          width: aspect_ratio === "9:16" ? 720 : 1920,
          height: aspect_ratio === "9:16" ? 1280 : 1080,
        },
      }),
    });

    const heygenData = await heygenRes.json();

    if (!heygenRes.ok) {
      return new Response(JSON.stringify({ error: heygenData.message || "HeyGen API error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save video record
    const { data: video, error: insertError } = await supabase
      .from("videos")
      .insert({
        user_id: user.id,
        title,
        script,
        avatar_id,
        voice_id,
        resolution,
        aspect_ratio,
        status: "processing",
        heygen_video_id: heygenData.data?.video_id,
      })
      .select()
      .single();

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ video, heygen: heygenData }), {
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
