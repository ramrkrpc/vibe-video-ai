import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const QuerySchema = z.object({
  job_id: z.string().min(1),
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
    const parsed = QuerySchema.safeParse({ job_id: url.searchParams.get("job_id") });
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "job_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("sync_labs_api_key")
      .eq("id", user.id)
      .single();

    const apiKey = profile?.sync_labs_api_key || Deno.env.get("SYNC_LABS_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "No Sync Labs API key configured" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const syncRes = await fetch(`https://api.synclabs.so/lipsync/${parsed.data.job_id}`, {
      headers: { "x-api-key": apiKey },
    });

    const data = await syncRes.json();

    // Update video record on completion/failure
    if (data.status === "COMPLETED" && data.videoUrl) {
      await supabase
        .from("videos")
        .update({
          status: "completed",
          video_url: data.videoUrl,
        })
        .eq("heygen_video_id", parsed.data.job_id)
        .eq("user_id", user.id);
    } else if (data.status === "FAILED") {
      await supabase
        .from("videos")
        .update({
          status: "failed",
          error_message: data.error || "Lip sync failed",
        })
        .eq("heygen_video_id", parsed.data.job_id)
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
