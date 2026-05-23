# Saved Insights AI

## 2026-05-23 — MVP Implementation Notes

Pixel Poetry now has a logged-in saved-takeaways layer for explainer essays. The editorial content remains unchanged; AI works only on passages the reader intentionally highlights and saves.

## User Flow

1. A reader highlights text inside explainer prose, quote, stat, or visual moments.
2. A compact fixed bottom action bar appears with `🥡 Save takeaway` and a close control.
3. On mobile, the action bar presents as a mini bottom sheet with safe-area padding.
4. Logged-in readers tap it to save the marked text immediately, with a short packed animation.
5. `/account` lists the reader's saved takeaways and any notes.
6. The reader can generate a private recap from saved takeaways.
7. The reader can email that recap to their own account email through Resend.

Logged-out readers are routed to login before saving.

## Provider Setup

V1 uses Vercel AI Gateway through the AI SDK.

```env
AI_GATEWAY_API_KEY=...
AI_GATEWAY_MODEL=minimax/minimax-m2.7
```

Default model: `minimax/minimax-m2.7`.

Why this path:

- MiniMax M2.7 is available directly through Vercel AI Gateway.
- AI SDK usage stays clean: pass the Gateway model string to `generateText`.
- Gateway gives Vercel-side observability, cost tracking, retries, and model swapping.
- The young direct MiniMax provider package was deliberately avoided for v1.

Future option: OpenRouter also exposes MiniMax M2.7 at `openrouter.ai/minimax/minimax-m2.7/api`. If Gateway pricing, availability, or BYOK needs change, add an OpenRouter provider behind `$lib/server/ai/provider.ts` without changing the UI or persistence layer.

## Resend Setup

```env
RESEND_API_KEY=...
RESEND_FROM_EMAIL="Pixel Poetry <summaries@postman.pixelpoetry.dev>"
```

Rules:

- `RESEND_API_KEY` is only imported in `$lib/server`.
- V1 only sends to `locals.user.email`.
- The smoke endpoint sends a test email only to the logged-in user.
- Delivery records store status and Resend ID, not arbitrary recipient data.

## Database

Tables added:

- `saved_insight`: selected passage, optional note, explainer/chapter/step metadata, hashes.
- `insight_summary`: structured private AI recap JSON, provider/model/prompt metadata.
- `insight_email_delivery`: email-to-self delivery status.

Migration: `drizzle/0001_red_madame_masque.sql`.

## PostHog Events

Track behavior only:

- `insight_selection_started`
- `insight_takeaway_clicked`
- `insight_save_opened`
- `insight_saved`
- `insight_save_failed`
- `insight_summary_requested`
- `insight_summary_completed`
- `insight_summary_failed`
- `insight_email_requested`
- `insight_email_sent`
- `insight_email_failed`

Never send selected text, notes, summaries, prompt text, or email addresses to PostHog.

## Prompt Version

Current prompt version: `saved-takeaways-summary-v1`.

The prompt instructs the model to use only saved passages and reader notes, avoid inventing facts or citations, and write in a warm concise editorial voice.
