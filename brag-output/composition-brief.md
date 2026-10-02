# Hyperframes Composition Brief: ShopGenie

## Objective
Create a cinematic launch-style brag video for ShopGenie (PayPal AI Hackathon entry).

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 20 seconds

## Source Material
- Project root: /Users/varma/Downloads/IMP/PayPal hackathon
- Primary files read: public/index.html (landing), public/app.html (tool), public/styles.css, README.md, src/ai.js (stub catalog copy)
- Product name: ShopGenie
- Tagline / strongest claim: "Rub the lamp. Stock the stall. Ring the till."
- Key UI or visual moment to recreate: the till receipt (paper #FFF9EC, perforated edges) with the rotated PAID stamp slam; product tickets dealing onto shelves; agent chat window
- Copy that must appear verbatim:
  - "Rub the lamp. Stock the stall. Ring the till."
  - "plant store for apartments"
  - "gift under $25 for a plant lover"
  - "PayPal AI Hackathon 2026 · Sandbox only"
  - "Zero keys to demo"
  - Product names/prices from the real stub catalog: Monstera Deliciosa (6in) $28, Pothos Golden (4in) $12, Succulent Trio $18, Ceramic Pot + Saucer $22, Plant Food Concentrate $14, Repotting Workshop Seat $30

## Creative Direction
- Tone preset: cinematic
- Creative direction: midnight-bazaar blockbuster trailer for a hackathon till
- Interpretation: big full-bleed type, dramatic reveals with settled holds; energy from the stamp slam and card deals, not fast cuts. Slow crossfades / dramatic wipes with scale.
- Angle: the checkout is treated like a heist payoff — wish, shelves, agent, then the PAID stamp slam as the explosion scene.
- Hook: black screen, marigold lamp-glow ignites, "EVERY SELLER HAS THE SAME WISH." slams in (first 3s).
- Outro / punchline: SHOPGENIE full-screen over lamp glow + verbatim tagline + small print; music fades, lockup holds to end.
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals
  - Unrelated visual redesign

## Visual Identity
- Background: #14101F (exact, from project)
- Text: #F2ECFF (exact)
- Accent: #FFB020 (exact)
- Secondary: #B388FF for AI/chat moments, #2FD597 for success accents, #FFF9EC receipt paper for the till scene only
- Display font: Fraunces 900 (ship local woff2 with @font-face; fallback to heavy serif if fetch fails)
- Body font: Space Grotesk (ship local woff2 with @font-face)
- Mono font: IBM Plex Mono for prices/receipt/ledger (ship local woff2 with @font-face)
- Visual references from the project: awning stripe (marigold/violet repeating bands), ticket cards with perforated stub edge, chat bubbles (buyer marigold right, agent plum left), receipt with dashed perforation divider, rotated PAID stamp in Till Mint green

## Storyboard
Use the storyboard in `brag-output/brag-plan.md` as the creative contract.

Scene summary:
1. The Wish — 3s — lamp glow ignites on black; "EVERY SELLER HAS THE SAME WISH." slams and holds
2. Stock the shelves — 4.5s — wish types out; six product tickets deal in one by one; "ONE SENTENCE STOCKS THE SHELVES."; full set holds
3. The agent minds the counter — 4.5s — chat exchange; ticket flies to cart; total ticks; "THE AGENT MINDS THE COUNTER."
4. Ring the till — 4.5s — receipt prints; capture; PAID stamp slams ~13.1s (beat-lock 13.11); "PAYPAL RINGS THE TILL."
5. Title card — 3.5s — SHOPGENIE + verbatim tagline + small print; music fades 18.5–20; hold lockup, no black tail

## Audio
- Audio role: cinematic support
- Audio arc: steady bed from 0, swell under the stamp (~13s), settle, fade out 18.5–20 under the title card
- Music: assets/music/happy-beats-business-moves-vol-12-by-ende-dot-app.mp3 (already copied into composition assets)
- Music treatment: volume 0.30–0.35 bed; fade-in first 0.5s; fade-out 18.5–20.0; swell under stamp via Hyperframes-supported means
- Music cue guidance: bundled preset at /Users/varma/.config/opencode/skills/brag/assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json (copy to composition if useful, or use `hyperframes beats`); strong-cue locks: stamp slam → 13.11s; outro logo land → 17.47s; ticket deals → beat grid ~4.39–7.09 every other beat, then hold full set ≥1.2s
- Audio-reactive treatment: subtle; music RMS breathes the lamp glow + hero title presence only. No waveforms/visualizers.
- Audio-coupled moments:
  - Scene 1 hook land — short announcement thud
  - Scene 2 wish typing — randomized keyboard keypress ticks; card-place accents on first/last ticket deals, soft drops between
  - Scene 3 chat + cart — UI click on send, soft drop on cart land, tick on total
  - Scene 4 stamp slam — deep resonant bell (impactBell_heavy_000 or _004), rings over music, nothing stacked on it
  - Scene 5 logo — soft bell tail or nothing; music tail carries
- SFX selection guidance: match gesture to family (cards→casino, typing→keyboard, UI→interface/ui, payoff→impact bells); prefer low high-frequency-risk files per <skill>/assets/sfx/sfx-analysis.md; SFX fire at animation start
- SFX analysis guidance: /Users/varma/.config/opencode/skills/brag/assets/sfx/sfx-analysis.md (+ .json)
- Exact SFX choice: Hyperframes chooses filenames, timestamps, density, volume from the implemented animation
- Audio files: music copied to `brag-output/composition/assets/music/`; Hyperframes copies selected SFX into `brag-output/composition/assets/`

## Hyperframes Instructions
Load the composition-building Hyperframes domain skills — `hyperframes-core` (composition contract + `data-*` timing), `hyperframes-animation` (motion), `hyperframes-creative` (design spec, beats, audio-reactive), `hyperframes-keyframes` (seek-safe keyframes), and `hyperframes-cli` (lint/check/render). /brag is its own workflow: do not enter the `hyperframes` entry-point intent interview and do not route into its generic promo / launch-video workflow. Prefer native Hyperframes conventions over anything in `/brag`.

Requirements:
- Show at least one real UI, copy, or visual element from the source project.
- Keep all text readable in the final render.
- Keep the video within 15-25 seconds.
- Include the planned music/SFX layer unless audio was explicitly disabled or documented as intentionally silent.
- Treat `/brag` audio notes as guidance, not a fixed cue sheet. Choose SFX after the visual animation exists.
- Treat music cue metadata as optional timing hints. Hyperframes decides exact animation timing and should ignore cues that hurt readability, scene pacing, or the product story.
- Major reveals may move toward nearby strong cues within about 0.15s. Smaller entrances may align to nearby beat points within about 0.10s. Use only 1-3 strong cue locks in a 15-25s video unless the edit clearly benefits from more.
- Use SFX to support motion and interaction: card sounds for card-like reveals, short announcement cues for major payoffs, key/click sounds for text or user actions, and restraint when the edit is already busy.
- Honor planned music treatment such as fade-outs, ducking, beat-aligned reveals, or letting a final SFX ring over the music, using the best Hyperframes-supported implementation.
- When music is present and the treatment is not `none`, consider Hyperframes audio-reactive workflow: extract audio data and use RMS/frequency bands for subtle, brand-specific motion. Good targets are glow, depth, background warmth, card presence, title emphasis, or other existing visual elements. Avoid waveform/equalizer visuals, musical-note graphics, generic particle systems, strobing, or heavy pulsing.
- Use local assets for audio and any required runtime/media dependencies when possible.
- Run `hyperframes check` before render — it is brag's single gate.
- Keep creation and rendering local. Remote or publishing workflows require a separate explicit user request.
