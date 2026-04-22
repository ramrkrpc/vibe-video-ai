
-- Add provider tracking and multi-provider API keys
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS provider text DEFAULT 'heygen';
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS audio_url text;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS source_video_id uuid REFERENCES public.videos(id);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fish_audio_api_key text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS did_api_key text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sync_labs_api_key text;
