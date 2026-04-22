ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS shared boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS share_token text UNIQUE,
  ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;

-- Allow anyone to view shared videos (for public share page)
CREATE POLICY "Anyone can view shared videos"
  ON public.videos
  FOR SELECT
  TO anon
  USING (shared = true);