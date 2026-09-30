# HEAR2SAY Study UI

Static browser interface published with GitHub Pages from `main/docs`.

## This repository contains only the frontend

- No EPUB, PDF, MP3, WAV, or book archive files
- No server secrets, passwords, user records, subscription records, or payment data

The browser uses a narrow Supabase Edge Function proxy. The underlying server verifies login and subscription status before it issues a short-lived private-book link.

## Browser-safe build configuration

- Supabase URL: `https://fifwypgivvibcojchatb.supabase.co`
- Supabase publishable browser key
- API proxy: `https://fifwypgivvibcojchatb.supabase.co/functions/v1/hear2say-pages-api`

Never add private book files, audio, user exports, or server secrets here.
