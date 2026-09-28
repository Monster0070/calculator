# yks-studio: notes for Claude

Remotion project that produces Instagram content for the YKS (Turkish university entrance exam) account **@resesifnet**.
The user is a Turkish-speaking student who works from the Claude app. Reply in Turkish, keep content accurate
(it is educational; double-check every fact/answer), and deliver finished files with SendUserFile.

## Layout

- `icerik/*.json`: all content (reels, gonderiler, anketler) + `hesap.json` (handle, palette, TTS speed, music flag).
- `src/compositions/`: `SoruReels` (quiz video), `ReelsKapak`, `BilgiPost`, `AnketStory`, `Marka` (profile photo, palette sheet), `Onizleme` (QA contact sheet).
- `src/lib/zaman.ts`: reels timeline derived from voice durations. `src/lib/zengin-metin.tsx`: markup (`**`, `==`, `~~`, `^{}`, `_{}`, `→`, `\n`).
- `src/tema.tsx`: palettes. The chosen palette is `gece` ("Gece Mesaisi"); the user picked it and handle `resesifnet`. Don't change these without asking.
- `scripts/ses.mjs` (TTS via Google Translate's `translate.googleapis.com/translate_tts`, cached by hash in `src/generated/ses.json`), `scripts/sfx.mjs`, `scripts/render.mjs`, `scripts/kare.mjs`.
- `cikti/`: committed deliverables (mp4/png + Instagram caption .txt). `out/`: scratch, gitignored.

## Voice

The user found the Google TTS voice too poor, so `hesap.json` has `"seslendirme": false`: reels render with music + SFX only,
and `npm run metin` (also run automatically after rendering reels) writes timestamped voice scripts
(`cikti/SESLENDIRME-METINLERI.txt`, `cikti/reels/<id>-seslendirme.txt`) that the user records over in CapCut/Instagram.
Google TTS durations in `src/generated/ses.json` still drive the pacing. If the user sends their own recordings, put them in
`public/ses/<id>/<kanca|soru|cevap|aciklama>.mp3`, write their real durations into `ses.json` (and keep `ses.mjs` from
overwriting them), set `seslendirme: true`, and re-render so the karaoke highlight follows their voice.

## Workflow for new content

1. Add items to `icerik/*.json` (ids: `[a-z0-9-]`). For math, write explicit `soruSes`/`aciklamaSes` (spoken Turkish).
2. `npm run ses`: only new/changed lines are synthesized (needed for pacing even with `seslendirme: false`).
3. QA: `npm run render -- onizleme` then Read `out/onizleme/<id>.png` (8 key moments per reel). Check that text fits (content must stay above y≈1520 for the Instagram caption overlay).
4. `npm run render -- reels-<id> kapak-<id> gonderi-<id> ...` (≈90 s per reel on 4 cores).
5. Send files to the user, commit `cikti/` + sources.

## Environment gotchas

- Remotion's bundled ffmpeg (`@remotion/compositor-*`) is minimal: no `s16le` muxer, no `hstack`; use WAV pipes (see `scripts/lib/araclar.mjs`).
- In the cloud container the browser is `/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell` (auto-detected). Node `fetch` needs `NODE_USE_ENV_PROXY=1`; `ses.mjs` re-execs itself with it.
- `<Freeze>` frames are clamped to the composition's duration, so sheet compositions (`onizleme-*`, `palet-karsilastirma`) are registered as `Composition`s with the reel's length and rendered as stills (prefix list `TEK_KARE` in `render.mjs`).
- Poppins lacks arrows and most Unicode superscripts: use markup (`^{}`) and `→` (rendered as SVG), never raw `⁵`.
