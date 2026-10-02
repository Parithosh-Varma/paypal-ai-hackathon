# Brag Plan: ShopGenie

## What is this app?
ShopGenie turns one sentence about a business into a live AI-stocked catalog, lets an AI agent sell from it, and checks out through PayPal Sandbox — a working till that demos with zero API keys.

## The angle
A midnight-bazaar blockbuster trailer. The product already looks like a night market (deep violet-black, marigold lamp glow, paper receipts); the video treats its checkout like a heist payoff: wish → shelves → agent → the PAID stamp slam. The stamp is the hero — the one frame everyone will remember.

## Hook (first 2-3 seconds)
Black screen. A marigold lamp-glow ignites from nothing, breathing with the music. One line slams in: "EVERY SELLER HAS THE SAME WISH." No product yet — just the glow and the promise.

## Key moments (the middle)
- Six product tickets fan onto the shelves one by one, dealt like cards, right after the wish is typed.
- The agent's chat answers "gift under $25 for a plant lover" and a ticket flies into the cart by itself.
- The paper receipt prints, the total lands, and the PAID stamp slams down full-frame — the trailer's explosion scene, with a bell that rings over the music.

## Outro / punchline
SHOPGENIE fills the screen over the lamp glow. Under it, the site's own line: "Rub the lamp. Stock the stall. Ring the till." Small print: "PayPal AI Hackathon 2026 · Sandbox only". Music fades, glow holds, cut.

## User flow worth showing
Type a business idea ("plant store for apartments") → AI stocks 6 products → ask the agent ("gift under $25") → capture the PayPal order → PAID stamp + dashboard ledger grows. The centerpiece scenes recreate this flow, not the landing page.

## Tone
- Preset: cinematic
- Creative direction: midnight-bazaar blockbuster trailer for a hackathon till
- Interpretation: big full-bleed type, dramatic reveals with long-enough holds, slow crossfades and scale entrances; energy comes from the stamp slam and card deals, not from fast cuts.

## Format: landscape — 1920x1080
## Duration: 20 seconds

## Visual identity (from the project)
- Background: #14101F (Night Ink)
- Accent: #FFB020 (Lamp Marigold)
- Text: #F2ECFF
- Secondary accents: #B388FF (Orchid Haze, AI moments), #2FD597 (Till Mint, success), receipt paper #FFF9EC for the till scene only
- Display font: Fraunces (900, landing hero)
- Body font: Space Grotesk
- Mono/data font: IBM Plex Mono (prices, receipt, ledger)
- Strongest visual element: the till receipt with perforated edges and the rotated PAID stamp slam

## Share copy (draft)
ShopGenie. Rub the lamp. Stock the stall. Ring the till.

## Audio direction
- Role: cinematic support — a steady bed with a low swell under the stamp, restrained motion-matched accents, subtle audio-reactive lamp glow
- Music: happy-beats-business-moves-vol-12-by-ende-dot-app.mp3 (steady and clean, ~110 BPM; theSKILL's pick for cinematic)
- Music treatment: start at 0, bed at 0.30–0.35, swell under the PAID stamp (~13s), fade out 18.5–20s under the outro
- Music cue guidance: bundled preset read (cues/happy-beats-business-moves-vol-12…music-cues.json); strong-cue locks: PAID stamp → 13.11s strong cue; outro logo land → 17.47s strong cue; ticket deals snap to beat grid ~4.39–7.09 (every other beat, then hold the full set for readability)
- Audio-reactive treatment: subtle; music RMS breathes the lamp glow and hero title presence only. No waveforms, no visualizers.
- SFX posture: moderate — 2 big ones (hook land, PAID slam) plus small motion-matched accents (key ticks, card deals, click, stamp). Coherent palette: impact + casino + keyboard + interface.
- Audio-coupled moments:
  - Hook line entrance — short announcement thud when it lands
  - Wish typing — per-character key ticks (randomized keypress files)
  - Six tickets dealing in — card-place accents on first/last deals, soft drops between
  - Agent reply + ticket-to-cart — UI click + soft drop
  - PAID stamp slam — deep resonant bell (impactBell_heavy), allowed to ring over the music
  - Outro logo — second bell or swell tail, then silence under fade
- Restraint rule: never stack SFX over the stamp bell; no SFX during the final 1.5s fade except the music tail.

## Storyboard

### Scene 1 — The Wish — 3s (0.0–3.0)
Black. A marigold radial glow ignites center-frame and breathes (audio-reactive). Text slams in, two lines: "EVERY SELLER" / "HAS THE SAME WISH." Hold settled through 3.0.
Sequential/interaction: none — one slam, one hold.
Audio intent: arrival — the trailer starts.
Audio-coupled idea: short announcement thud as the lines land; music starts at 0.
Music: vol-12 bed, low.
Transition mood: dramatic → Scene 2 (slow crossfade with scale 0.95→1.0).

### Scene 2 — Stock the shelves — 4.5s (3.0–7.5)
A wish-bar types "plant store for apartments" (key ticks). Then six product tickets deal onto the shelves one by one — 🪴 Monstera $28, 🌿 Pothos $12, 🌵 Succulent Trio $18, 🏺 Pot + Saucer $22, 🧴 Plant Food $14, 🎓 Workshop $30 (real stub catalog copy). Caption locks: "ONE SENTENCE STOCKS THE SHELVES." Full set holds to 7.5.
Sequential/interaction: yes — typed wish, then six ticket deals snapped to every other beat (~4.39–7.09 window), full set held ≥1.2s after the last deal.
Audio intent: building — playful dealing rhythm under a steady bed.
Audio-coupled idea: randomized keypress ticks while typing; card-place accents on first and last deals, soft drops between.
Music: bed continues.
Transition mood: dramatic wipe → Scene 3.

### Scene 3 — The agent minds the counter — 4.5s (7.5–12.0)
Chat window: buyer bubble types "gift under $25 for a plant lover". Agent bubble answers with two picks and prices. One ticket lifts off the shelf and drops into a cart; cart total ticks to a sum. Caption: "THE AGENT MINDS THE COUNTER."
Sequential/interaction: yes — buyer message, agent reply, ticket-to-cart flight, total tick-up.
Audio intent: cleverness — light UI sounds, nothing heavy.
Audio-coupled idea: UI click on send, soft drop on cart land; counter tick if a number rolls.
Music: bed continues.
Transition mood: dramatic crossfade → Scene 4.

### Scene 4 — Ring the till — 4.5s (12.0–16.5)
Paper receipt (#FFF9EC) prints downward with line items and total. "CAPTURE" presses. The PAID stamp slams down rotated at ~13.1 (beat-locked to the 13.11s strong cue) with a deep bell that rings over the music. Receipt + stamp hold to 16.5. Caption: "PAYPAL RINGS THE TILL."
Sequential/interaction: yes — receipt print, capture press, stamp slam; the slam is the video's single biggest moment.
Audio intent: payoff — the bell is the loudest, proudest sound in the video.
Audio-coupled idea: stamp slam = impactBell_heavy at the slam frame; nothing else stacked on it.
Music: swell under the stamp, then settle.
Transition mood: hard cut to black, one beat → Scene 5.

### Scene 5 — Title card — 3.5s (16.5–20.0)
SHOPGENIE full-screen in heavy display type over the lamp glow (logo lands ~17.5, near the 17.47s strong cue). Tagline under it, verbatim: "Rub the lamp. Stock the stall. Ring the till." Small print: "PayPal AI Hackathon 2026 · Sandbox only · Zero keys to demo". Music fades 18.5–20. Hold the lockup to the end — no black tail.
Sequential/interaction: none.
Audio intent: landing — swell tail, then quiet.
Audio-coupled idea: soft bell or nothing on logo land; let the music tail carry.
Music: fade out 18.5–20.0.
Transition mood: end (hold final frame).

**Music mood for this video:** cinematic
**Audio summary:** A steady vol-12 bed swells once under the PAID stamp slam and fades under the title card, with key ticks, card deals, UI clicks, and two deep bells marking the hook and the payoff.
