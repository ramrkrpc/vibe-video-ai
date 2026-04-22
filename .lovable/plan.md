

# HeyGen Clone -- Gap Analysis and Enhancement Sprint Plan

## Current State Assessment

The app has a solid foundation: auth flow, sidebar navigation, dark theme, edge functions for HeyGen API, and basic CRUD database schema. However, comparing against app.heygen.ai, there are significant UI and logic gaps.

---

## Gap Analysis

### Critical Logic Gaps
1. **All data is hardcoded/mock** -- Dashboard stats, recent videos, avatar gallery, and My Videos all use static arrays instead of querying the database or HeyGen API
2. **Settings page doesn't save** -- API key input has no state binding and the "save" is a no-op toast
3. **CreateVideo doesn't call the edge function** -- generates a fake setTimeout instead of invoking `heygen-create-video`
4. **Avatars page doesn't fetch from HeyGen API** -- shows 12 hardcoded names with no images
5. **Templates don't load from database** -- hardcoded array, no DB query
6. **No video polling** -- after generation starts, there's no mechanism to poll `heygen-video-status` until completion
7. **No password reset flow** -- "Change Password" button is a no-op, no `/reset-password` route
8. **Profile save doesn't persist** -- Settings name change is local state only

### UI/UX Gaps vs app.heygen.ai
1. **No onboarding/empty states** -- empty pages show nothing helpful
2. **No avatar preview images** -- just generic User icons everywhere
3. **No voice preview/audio samples** -- voice selection is a blind dropdown
4. **No video thumbnail generation** -- video cards show Play icon placeholders
5. **No real video player** -- modal shows a placeholder, not an actual `<video>` element
6. **No loading/skeleton states** -- pages snap in without content shimmer
7. **No error boundaries** -- API failures show nothing
8. **Sidebar lacks branding depth** -- no avatar/user photo, no plan badge
9. **No search across the app** -- global command palette missing
10. **No notification/activity feed**
11. **No drag-and-drop or multi-step video creation wizard**
12. **Header is nearly empty** -- just a sidebar trigger, no breadcrumbs, search, or user menu
13. **No "Forgot password" link** on auth page

---

## Sprint Plan (20 Sprints)

### Sprint 1: Wire Dashboard to Real Data
- Query `videos` table for recent videos and counts
- Query `profiles` for user info
- Replace all hardcoded stats with live data using React Query
- Show empty states when no data exists

### Sprint 2: Settings -- Persist Profile and API Key
- Bind API key input to state, save to `profiles.heygen_api_key` via Supabase
- Persist full name updates to `profiles.full_name`
- Add success/error feedback with actual DB calls
- Add "Forgot Password" with `resetPasswordForEmail` and create `/reset-password` route

### Sprint 3: Avatars -- Fetch from HeyGen API
- Call `heygen-list-avatars` edge function from Avatars page via React Query
- Display real avatar names and preview images from the API response
- Keep mock fallback if no API key is set yet
- Add skeleton loading cards during fetch

### Sprint 4: CreateVideo -- Wire to Edge Function
- Call `heygen-create-video` edge function on Generate button
- Pass selected avatar, voice, script, resolution, aspect ratio
- Save returned video record and redirect to My Videos
- Show proper error messages from API failures

### Sprint 5: Video Status Polling
- After video creation, start polling `heygen-video-status` every 10s
- Update video status in the UI in real-time
- Stop polling when status reaches `completed` or `failed`
- Show progress indicator during processing

### Sprint 6: My Videos -- Real Data and Video Player
- Query `videos` table with React Query, replace mock data
- Implement actual `<video>` playback in the modal using `video_url`
- Wire Download button to actual video URL
- Wire Delete button to delete from DB
- Add empty state for new users

### Sprint 7: Templates -- Load from Database
- Query `templates` table for public templates
- Seed initial template data via migration
- Wire "Use Template" to pre-fill CreateVideo with template's script, avatar, voice
- Parse query params in CreateVideo to load template data

### Sprint 8: Enhanced Header and Global Navigation
- Add breadcrumbs showing current page
- Add user avatar dropdown (profile pic, name, sign out)
- Add global search input in header (Cmd+K command palette)
- Add notification bell icon (placeholder for future)

### Sprint 9: Skeleton Loading States
- Add shimmer/skeleton components for all data-loading pages
- Dashboard stat cards skeleton
- Avatar grid skeleton
- Video grid skeleton
- Templates grid skeleton

### Sprint 10: Empty States and Onboarding
- Design illustrated empty states for each page (no videos yet, no avatars, etc.)
- Add first-time user onboarding banner: "Set up your API key to get started"
- Add guided steps: 1) Add API key 2) Browse avatars 3) Create first video
- Dismiss onboarding after first video is created

### Sprint 11: Avatar Detail Modal and Selection Flow
- Click avatar opens a detail modal with larger preview, name, description
- "Select and Create Video" button navigates to CreateVideo with avatar pre-selected
- Show avatar preview in CreateVideo sidebar when selected
- Persist last-used avatar preference

### Sprint 12: Voice Selection Enhancement
- Fetch available voices from HeyGen API (new edge function `heygen-list-voices`)
- Show voice language, gender, accent tags
- Add audio preview button to hear voice samples
- Group voices by language with collapsible sections

### Sprint 13: Video Creation Wizard (Multi-Step)
- Refactor CreateVideo into a step-by-step wizard:
  - Step 1: Choose Avatar
  - Step 2: Write Script
  - Step 3: Select Voice and Settings
  - Step 4: Review and Generate
- Add progress stepper UI at top
- Allow navigation back and forth between steps

### Sprint 14: Project Management
- Allow users to create named projects to organize videos
- Add project selector dropdown in the sidebar or header
- Videos belong to projects
- Project list page with video counts and last-updated dates

### Sprint 15: Video Share and Embed
- Generate shareable link for completed videos
- Add copy-to-clipboard for share URL
- Create a public `/share/:id` route that plays video without auth
- Add embed code generation (iframe snippet)

### Sprint 16: Responsive and Mobile Polish
- Audit all pages for mobile breakpoints
- Sidebar collapses to bottom navigation on mobile
- Video grid switches to single column
- Touch-friendly controls on video player
- Ensure auth page works well on small screens

### Sprint 17: Dark/Light Theme Toggle
- Add theme toggle in header and settings
- Define light theme CSS variables
- Persist theme preference to localStorage
- Ensure all glass/gradient utilities work in both themes

### Sprint 18: Analytics Dashboard
- Show video view counts (tracked via share page)
- Chart: videos created over time (last 30 days)
- Chart: API credit usage trend
- Use recharts or chart.js for visualizations

### Sprint 19: Batch Video Generation
- Allow CSV/text upload with multiple scripts
- Generate videos in batch with queue tracking
- Batch status page showing each video's progress
- Download all completed videos as zip

### Sprint 20: Performance, Polish, and Error Handling
- Add React Error Boundaries around each page
- Add toast notifications for all API errors with retry actions
- Lazy-load routes with React.lazy and Suspense
- Optimize avatar image loading with lazy loading and blur-up
- Final visual audit: spacing, typography, animation consistency
- Add keyboard shortcuts (Ctrl+N for new video, Ctrl+K for search)

---

## Technical Details

### New Database Migrations Needed
- Seed `templates` table with 8-10 starter templates (Sprint 7)
- Add `shared` boolean and `share_token` columns to `videos` table (Sprint 15)
- Add `view_count` column to `videos` (Sprint 18)

### New Edge Functions
- `heygen-list-voices` -- fetch available voices from HeyGen API (Sprint 12)

### Key Patterns
- All data fetching will use `@tanstack/react-query` with proper cache keys, stale times, and error/loading states
- Edge functions invoked via `supabase.functions.invoke()`, never by path
- All new pages follow the existing glass card + motion animation design language

