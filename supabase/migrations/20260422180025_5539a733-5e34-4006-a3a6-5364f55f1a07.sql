
-- Add user_id to templates for user-generated templates
ALTER TABLE public.templates ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing policy
DROP POLICY IF EXISTS "Anyone can view public templates" ON public.templates;

-- Users can view public templates OR their own templates
CREATE POLICY "Users can view public or own templates"
ON public.templates FOR SELECT
USING (is_public = true OR auth.uid() = user_id);

-- Users can insert their own templates
CREATE POLICY "Users can create own templates"
ON public.templates FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own templates
CREATE POLICY "Users can update own templates"
ON public.templates FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own templates
CREATE POLICY "Users can delete own templates"
ON public.templates FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
