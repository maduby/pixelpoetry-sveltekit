# Saved Insights AI

## 2026-05-23 — MVP Implementation Notes

Pixel Poetry now has a logged-in saved-takeaways layer for explainer essays. The editorial content remains unchanged; AI works only on passages the reader intentionally highlights and saves.

## User Flow

1. A reader highlights text inside explainer prose, quote, stat, or visual moments.
2. A compact fixed bottom action bar appears with `🥡 Save takeaway` and a close control.
3. On mobile, the action bar presents as a mini bottom sheet with safe-area padding.
4. Logged-in readers tap it to save the marked text immediately, with a short packed animation.
5. `/account` lists the reader's saved takeaways and any notes.
6. The reader can search saved takeaways, select one/many/all, and generate a private recap from only that selected set.
7. The account page keeps a compact shelf of the reader's 5 most recent recaps.
8. Opening a recap uses the shared bottom-sheet/full-screen pattern with edit, email, delete, and source navigation actions.
9. The recap includes links back to Pixel Poetry, the relevant explainer, the saved passages used, and any retrieved editorial sources that support the recap.
10. The reader can email that recap to their own account email through Resend, including the same recapped-piece and source links.

Logged-out readers are routed to login before saving.

## Provider Setup

V1 supports two server-side provider paths through the AI SDK:

- `AI_PROVIDER=minimax`: direct MiniMax API using MiniMax's OpenAI-compatible endpoint.
- `AI_PROVIDER=gateway`: Vercel AI Gateway using the Gateway model string.

Direct MiniMax:

```env
AI_PROVIDER=minimax
MINIMAX_API_KEY=...
MINIMAX_MODEL=MiniMax-M2.7
MINIMAX_BASE_URL=https://api.minimax.io/v1
```

Vercel AI Gateway:

```env
AI_PROVIDER=gateway
AI_GATEWAY_API_KEY=...
AI_GATEWAY_MODEL=minimax/minimax-m2.7
```

Default direct MiniMax model: `MiniMax-M2.7`.
Default Gateway model: `minimax/minimax-m2.7`.

Why this path:

- MiniMax M2.7 is available directly through MiniMax and through Vercel AI Gateway.
- AI SDK usage stays clean: use an OpenAI-compatible provider for MiniMax, or pass the Gateway model string to `generateText`.
- Gateway gives Vercel-side observability, cost tracking, retries, and model swapping when we want that path.
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
- `insight_summary.insight_ids`: saved takeaway IDs used to generate the recap, stored so the UI and email can link back to the recapped passages.
- Recap retention: v1 keeps the 5 most recent recaps per user and prunes older ones after a new recap is generated.
- `insight_email_delivery`: email-to-self delivery status.
- `source_document`: canonical explainer source records.
- `source_chunk`: meaningful source/reference chunks with optional `vector(1536)` embeddings.
- `saved_insight_source_match`: private source matches for each saved takeaway.
- `insight_summary_source`: source chunks attached to a generated recap.

Migrations:

- `drizzle/0001_red_madame_masque.sql` — saved takeaways, summaries, email deliveries.
- `drizzle/0002_married_randall.sql` — selected insight IDs on summaries.
- `drizzle/0003_bouncy_james_howlett.sql` — source grounding tables and pgvector extension.

## Source Grounding

See `docs/ai/source-grounding.md`.

Current behavior:

- Existing Longevity and Ultra-Processed sources are ingested through `src/lib/explainers/registry.ts`.
- `pnpm sources:ingest` upserts canonical source documents and source chunks.
- Embeddings are optional. With embeddings disabled, retrieval uses explainer/chapter/step context plus lexical overlap.
- Recap prompts receive only selected takeaways and retrieved source snippets as `allowedSources`.
- Recaps may include a `sources` array, but the model is instructed to cite only supplied source IDs.

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
- `insight_summary_opened`
- `insight_summary_edited`
- `insight_summary_deleted`
- `insight_email_requested`
- `insight_email_sent`
- `insight_email_failed`

Never send selected text, notes, summaries, prompt text, or email addresses to PostHog.

## Prompt Version

Current prompt version: `saved-takeaways-summary-v2-grounded`.

The prompt instructs the model to use only saved passages, reader notes, and retrieved source snippets, avoid inventing facts or citations, and write in a warm concise editorial voice.
