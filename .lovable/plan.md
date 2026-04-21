

# AI Video Generation Platform — HeyGen Clone

## Overview
A full-featured AI video generation platform modeled after app.heygen.ai, with dark theme UI, user authentication, and HeyGen API integration for real avatar video creation.

## Design
- **Dark theme** matching HeyGen's aesthetic (deep navy/dark backgrounds, accent blues/purples)
- Left sidebar navigation with icons
- Clean card-based layouts for projects and templates
- Professional SaaS feel with smooth transitions

## Pages & Features

### 1. Authentication
- Sign up / Login pages with email + password (Lovable Cloud auth)
- Google OAuth option
- Protected routes for authenticated users

### 2. Dashboard / Home
- Welcome banner with quick-start actions
- Recent projects grid with video thumbnails
- Usage stats (credits remaining, videos created)
- Quick-action buttons: "Create Video", "Use Template"

### 3. Avatar Gallery
- Grid of available AI avatars (fetched from HeyGen API)
- Filter by category (business, casual, diverse)
- Avatar preview on hover/click
- Select avatar to start a new video project

### 4. Video Creator / Editor
- **Script input** — text area to type or paste the script
- **Avatar selection** — chosen avatar preview
- **Voice selection** — dropdown to pick AI voice/language
- **Settings** — video resolution, background, aspect ratio
- **Generate button** — submits to HeyGen API
- **Preview panel** — shows generated video when ready
- Progress indicator during generation

### 5. Templates
- Pre-built video templates (sales pitch, product demo, training, etc.)
- Template preview cards with thumbnails
- "Use Template" flow that pre-fills the editor

### 6. My Videos / Projects
- List/grid of all generated videos
- Status indicators (processing, completed, failed)
- Download, share, and delete actions
- Video playback modal

### 7. Settings / Account
- Profile management
- API usage & credits overview
- Plan/subscription info display

## Backend Architecture

### Lovable Cloud (Supabase)
- **Database tables**: profiles, projects, videos, templates
- **Edge Functions**:
  - `heygen-create-video` — sends script + avatar to HeyGen API
  - `heygen-list-avatars` — fetches available avatars
  - `heygen-video-status` — polls video generation status
  - `heygen-webhook` — receives completion callbacks
- **RLS policies** for user data isolation
- **Storage bucket** for video thumbnails

### HeyGen API Integration
- User provides their HeyGen API key (stored as a secret)
- Avatar listing, video creation, and status polling via edge functions
- Webhook support for video completion notifications

## Implementation Phases

**Phase 1 (this plan):** Full UI with all pages, auth, database schema, and HeyGen API integration wired up through edge functions.

**Phase 2 (future):** Advanced features like video editing timeline, custom avatar uploads, batch generation, team collaboration.

