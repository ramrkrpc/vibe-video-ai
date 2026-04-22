

# Gap Analysis: Your App vs app.heygen.ai

## What You Have (Working)
- Auth (email + Google OAuth + forgot password)
- Dashboard with stats, recent videos, API key warning
- 4-step video creation wizard (Avatar > Script > Voice > Review)
- Avatar browsing with search and detail modal
- Voice selection with preview playback
- Video management (grid/list view, search, delete, share, download)
- Video playback modal with status handling
- Templates page (8 fallback templates)
- Settings (profile, API key, password reset)
- Edge functions for HeyGen API (avatars, voices, create, status poll)
- Share via token with public route
- Command palette (Cmd+K)
- Dark theme with glass morphism design
- Skeleton loading states throughout

---

## Gaps Compared to app.heygen.ai

### 1. Interactive Avatar / Photo Avatar Upload
**HeyGen has:** Upload a photo to create a custom avatar, or use Interactive Avatars (real-time streaming). Your app only lists pre-built avatars from the API.
**Fix:** Add a "Create Avatar" flow with photo upload via HeyGen's `/v2/photo_avatar` endpoint, and a section for "My Avatars" vs "Public Avatars" tabs.

### 2. Avatar Grouping and Filtering
**HeyGen has:** Avatars organized by categories (Studio, Instant, Photo), gender filters, and "Favorites" bookmarks.
**Fix:** Add category tabs (All / Studio / Instant / Photo), gender filter chips, and a favorites toggle that persists to the database.

### 3. Video Editor / Scene Builder
**HeyGen has:** A multi-scene video editor where you can add multiple scenes, each with different avatars, backgrounds, text overlays, and transitions. Your app only supports a single-scene, single-script flow.
**Fix:** Build a scene-based editor component where users can add/remove/reorder scenes, each with its own avatar, script segment, and optional background image.

### 4. Background Selection
**HeyGen has:** Choose or upload custom backgrounds for each scene (solid colors, stock images, uploaded images).
**Fix:** Add a background picker step in the creation wizard with color presets, stock images, and file upload to storage.

### 5. Script AI Assist
**HeyGen has:** AI-powered script generation -- type a topic and get a generated script. Also supports SSML for pauses, emphasis.
**Fix:** Add an "AI Generate" button next to the script textarea that calls Lovable AI (e.g., `google/gemini-2.5-flash`) to generate a script from a topic prompt.

### 6. Video Translation / Dubbing
**HeyGen has:** Translate existing videos into 40+ languages with lip-sync. This is a major feature.
**Fix:** Add a "Translate Video" action on completed videos that calls HeyGen's video translation endpoint.

### 7. Brand Kit / Brand Voices
**HeyGen has:** Save brand colors, logos, fonts, and preferred voices as a "Brand Kit" for consistency.
**Fix:** Add a Brand Kit section in Settings where users can save brand colors, logo URL, and default voice preferences.

### 8. Projects / Folders
**HeyGen has:** Organize videos into projects/folders with drag-and-drop.
**Fix:** The `projects` table already exists in the schema. Wire it up with a project selector dropdown on the dashboard and My Videos page.

### 9. Video Analytics
**HeyGen has:** View count tracking, engagement analytics on shared videos.
**Fix:** The `view_count` column exists on videos. Increment it on the share page and display analytics on each video card and in the detail modal.

### 10. Batch Video Generation
**HeyGen has:** CSV/spreadsheet upload to generate personalized videos at scale (e.g., personalized sales outreach).
**Fix:** Add a "Batch Create" page with CSV upload, column mapping, and batch job tracking.

### 11. Webhooks / Callback on Completion
**HeyGen has:** Webhook notifications when video generation completes instead of polling.
**Fix:** Add a webhook receiver edge function and update the video status flow to use push updates (with polling as fallback).

### 12. Voice Cloning / Custom Voices
**HeyGen has:** Clone your voice from an audio sample.
**Fix:** Add voice upload in the Voices section that posts to HeyGen's voice clone API.

### 13. Template Creation (User-Generated)
**HeyGen has:** Users can save their own configurations as reusable templates.
**Fix:** Add a "Save as Template" button on the Review step that inserts into the templates table with the user's avatar, voice, and script.

### 14. Onboarding / First-Run Experience
**HeyGen has:** Guided onboarding tour, sample video generation, getting-started checklist.
**Fix:** Add a first-login checklist component on the dashboard (add API key, create first video, share a video) with completion tracking.

### 15. Notification Center
**HeyGen has:** In-app notifications for video completion, failures, quota warnings.
**Fix:** Add a notifications dropdown in the sidebar header, backed by a `notifications` table with realtime subscription.

---

## Recommended Sprint Priority (Top 10)

| Sprint | Feature | Impact |
|--------|---------|--------|
| 1 | AI Script Generation | High -- core UX improvement, uses Lovable AI |
| 2 | Background Selection | High -- visual quality of generated videos |
| 3 | Save as Template (user-generated) | Medium -- reusability |
| 4 | Projects/Folders organization | Medium -- uses existing `projects` table |
| 5 | Avatar filtering (categories, gender, favorites) | Medium -- better browsing UX |
| 6 | Video view count analytics | Low effort -- column exists |
| 7 | Onboarding checklist | Medium -- first-run experience |
| 8 | Multi-scene editor | High effort, high value |
| 9 | Video translation/dubbing | High value, depends on HeyGen API tier |
| 10 | Batch video generation | High value for power users |

---

## Implementation Plan

### Sprint 1: AI Script Generation
- Add edge function `ai-generate-script` using Lovable AI gateway (`google/gemini-2.5-flash`)
- Add "Generate with AI" button + topic input modal on the Script step of CreateVideo
- Stream or return the generated script into the textarea

### Sprint 2: Background Selection
- Add background picker UI to the creation wizard (after Avatar step or as sub-option)
- Support: solid colors, preset images, and user-uploaded images via storage bucket
- Pass `background` config to HeyGen API in edge function

### Sprint 3: Save as Template
- Add "Save as Template" button on Step 3 (Review) of CreateVideo
- Insert into `templates` table with `user_id`, `is_public = false`
- Show "My Templates" tab on Templates page

### Sprint 4: Projects/Folders
- Create project CRUD UI (create, rename, delete projects)
- Add project selector/filter on My Videos page
- Add `project_id` foreign key to videos table (migration)

### Sprint 5: Avatar Filtering
- Add category tabs and gender filter to Avatars page
- Add favorites table or column, persist per user
- Show "Favorites" tab

### Sprint 6: Video Analytics
- Increment `view_count` on share page load (edge function or RPC)
- Show view count badge on video cards
- Add simple analytics section in video detail modal

### Sprint 7: Onboarding Checklist
- Track onboarding state in profiles (JSON column or separate table)
- Show checklist widget on dashboard for new users
- Auto-dismiss after all steps complete

### Sprint 8-10: Multi-scene, Translation, Batch
- These are larger features requiring significant UI and API work
- Multi-scene needs a drag-and-drop scene timeline component
- Translation needs HeyGen Enterprise API access
- Batch needs CSV parser + job queue UI

### Database Changes Required
- Migration: Add `project_id` (nullable FK) to `videos` table
- Migration: Create `favorites` table (`user_id`, `avatar_id`, unique constraint)
- Migration: Create `notifications` table with realtime enabled
- Migration: Add `onboarding_completed` boolean to `profiles`

### New Edge Functions
- `ai-generate-script` -- calls Lovable AI to generate video scripts
- `increment-view-count` -- RPC to safely increment share view counts

