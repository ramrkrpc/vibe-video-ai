

# Cheaper API Alternatives: Video, TTS, and Lip Sync

## Research Summary

Your app currently depends entirely on HeyGen for avatars, voices, and video generation. HeyGen is expensive ($0.01-0.033/sec of video, ~$5.88/min on pay-as-you-go) and requires a paid API key to even load the app. Here are cheaper, faster, higher-quality alternatives organized by function.

---

## 1. Text-to-Speech (Replacing HeyGen voices)

| Provider | Pricing | Latency | Quality | Notes |
|----------|---------|---------|---------|-------|
| **Fish Audio** | $0.015/1K chars (pay-as-you-go), 50% cheaper than ElevenLabs | ~200ms | High -- natural, expressive | Voice cloning included. REST API. Best value pick. |
| **Deepgram Aura** | $0.030/1K chars | <200ms (fastest) | Good -- optimized for agents | Best for real-time/conversational. REST API. |
| **Cartesia Sonic 3** | Free tier (10K chars/day), then $0.040/1K | 40-90ms TTFA | Excellent -- laughs, emotes | Ultra-low latency streaming. Best speed. |
| **ElevenLabs** | $0.030/1K chars (Starter $5/mo) | ~300ms | Excellent -- industry benchmark | Available as Lovable connector. Most polished. |
| **OpenAI TTS** | $0.015/1K chars | ~400ms | Good | Simple API, limited voice control. |

**Recommendation**: **Fish Audio** for best price-to-quality ratio. **Cartesia** if speed matters most. **ElevenLabs** if you want the Lovable connector for easiest integration.

---

## 2. Avatar Video Generation (Replacing HeyGen video create)

| Provider | Pricing | Speed | Quality | API |
|----------|---------|-------|---------|-----|
| **HeyGen** (current) | $0.01-0.033/sec (~$5.88/min PAYG) | 2-5 min | High | REST v2 |
| **D-ID** | ~$0.08/sec ($4.80/min, Lite $4.70/mo = ~10 min) | 1-3 min | Good | REST, simple |
| **Synthesia** | Enterprise only (~$22/video on Starter) | 3-10 min | High | REST, but expensive plans |
| **Sync Labs + TTS** | $0.035/sec lip-sync + TTS cost | <1 min | Good-Great | REST + SDK |

**Recommendation**: **Keep HeyGen** for full avatar videos (it's competitive at API level). Add **D-ID** as a cheaper alternative for photo-to-video (user uploads photo instead of picking studio avatar). This gives users a free/cheap path.

---

## 3. Lip Sync / Dubbing (New capability)

| Provider | Pricing | Speed | Quality | Notes |
|----------|---------|-------|---------|-------|
| **Sync Labs** (Wav2Lip creators) | Free tier + $0.035/sec, plans from $5/mo | Fast (<1 min) | Good-Great | Best API, SDK available, 100+ languages |
| **Replicate (SadTalker)** | ~$0.18/run | 30-60s | Decent | Open-source model, pay-per-use |
| **Wav2Lip (self-hosted)** | Free (open-source) | Variable | Decent | Requires GPU infrastructure |

**Recommendation**: **Sync Labs** -- commercial-grade API from Wav2Lip creators, free tier, REST API, best quality-to-price ratio for lip sync.

---

## Recommended Stack (Cheapest + Best Quality)

```text
Current:    HeyGen (everything)  ──> expensive, single point of failure

Proposed:   ┌─────────────────────────────────────────────┐
            │  TTS:        Fish Audio ($0.015/1K chars)   │
            │  Avatars:    HeyGen (keep) + D-ID (photos)  │
            │  Lip Sync:   Sync Labs ($0.035/sec, free tier)│
            │  Scripts:    Lovable AI (already integrated) │
            └─────────────────────────────────────────────┘
```

**Cost savings**: ~60-70% reduction on TTS vs ElevenLabs, free lip-sync tier, photo avatars at ~$4.70/mo vs HeyGen's per-minute pricing.

---

## Implementation Plan

### Phase 1: Fish Audio TTS Integration
- Add `FISH_AUDIO_API_KEY` secret
- Create `fish-audio-tts` edge function (`POST https://api.fish.audio/v1/tts`)
- Create `fish-audio-voices` edge function to list voices
- Add "Preview Script" audio button on the Script step in CreateVideo
- Add Fish Audio API key field to Settings alongside HeyGen

### Phase 2: Sync Labs Lip Sync
- Add `SYNC_LABS_API_KEY` secret
- Create `sync-lip-sync` edge function (`POST https://api.synclabs.so/lipsync`)
- Create `sync-lip-sync-status` edge function for polling
- Add "Translate / Dub" action on completed videos in MyVideos
- Flow: user picks target language -> Lovable AI translates script -> Fish Audio generates audio -> Sync Labs lip-syncs original video

### Phase 3: D-ID Photo Avatars
- Add `DID_API_KEY` secret
- Create `did-create-video` edge function (`POST https://api.d-id.com/talks`)
- Create `did-video-status` edge function
- Add "Upload Photo" tab on Avatars page -- uses D-ID instead of HeyGen
- Users who don't have a HeyGen key can still create videos from photos

### Phase 4: Provider Abstraction
- Database migration: add `provider` enum column to `videos` table (default `heygen`)
- Add `audio_url`, `source_video_id` columns to `videos`
- Update Settings page with tabbed API key management (HeyGen, Fish Audio, Sync Labs, D-ID)
- Add provider selector in CreateVideo wizard
- Unified status polling across providers

### Database Changes
- Migration: `ALTER TABLE videos ADD COLUMN provider text DEFAULT 'heygen'`
- Migration: `ALTER TABLE videos ADD COLUMN audio_url text`
- Migration: `ALTER TABLE videos ADD COLUMN source_video_id uuid REFERENCES videos(id)`
- Migration: `ALTER TABLE profiles ADD COLUMN fish_audio_api_key text`
- Migration: `ALTER TABLE profiles ADD COLUMN did_api_key text`
- Migration: `ALTER TABLE profiles ADD COLUMN sync_labs_api_key text`

### New Edge Functions
| Function | Provider | Purpose |
|----------|----------|---------|
| `fish-audio-tts` | Fish Audio | Text-to-speech audio generation |
| `fish-audio-voices` | Fish Audio | List available TTS voices |
| `sync-lip-sync` | Sync Labs | Lip-sync video to audio |
| `sync-lip-sync-status` | Sync Labs | Poll lip-sync completion |
| `did-create-video` | D-ID | Photo-to-talking-video |
| `did-video-status` | D-ID | Poll D-ID video completion |

### UI Changes
- Settings: tabbed API key sections for each provider with connection status indicators
- CreateVideo: provider selector (HeyGen / D-ID / Photo), audio preview button
- MyVideos: "Translate/Dub" action menu item on completed videos
- Avatars: "Upload Photo" tab for D-ID photo avatars

