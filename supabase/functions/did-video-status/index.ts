import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const QuerySchema = z.object({
  talk_id: z.string().min(1),
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
    const parsed = QuerySchema.safeParse({ talk_id: url.searchParams.get("talk_id") });
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "talk_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("did_api_key")
      .eq("id", user.id)
      .single();

    const apiKey = profile?.did_api_key || Deno.env.get("DID_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "No D-ID API key configured" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const didRes = await fetch(`https://api.d-id.com/talks/${parsed.data.talk_id}`, {
      headers: { "Authorization": `Basic ${apiKey}` },
    });

    const data = await didRes.json();

    if (data.status === "done" && data.result_url) {
      await supabase
        .from("videos")
        .update({
          status: "completed",
          video_url: data.result_url,
          thumbnail_url: data.source_url || null,
          duration_seconds: data.duration ? Math.round(data.duration) : null,
        })
        .eq("heygen_video_id", parsed.data.talk_id)
        .eq("user_id", user.id);
    } else if (data.status === "error") {
      await supabase
        .from("videos")
        .update({
          status: "failed",
          error_message: data.error?.description || "D-ID generation failed",
        })
        .eq("heygen_video_id", parsed.data.talk_id)
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
