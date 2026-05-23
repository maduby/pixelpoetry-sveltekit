# AI Knowledge Layer Architecture for PixelPoetry

## Overview

This document outlines a recommended architecture for building an AI-powered knowledge and interaction layer on top of long-form content in a SvelteKit application.

The goal is **not** simply to add “AI chat”, but to create a reusable system that allows users to:

- Save AI summaries of content sections
- Revisit and organise insights
- Ask questions about specific sections
- Add notes and comments
- Share curated summaries
- Build ongoing conversations around content
- Reuse structured AI outputs across the platform

The architecture is designed to scale from a simple MVP into a robust knowledge platform.

---

# Recommended Stack

## Frontend

- SvelteKit
- TailwindCSS
- BetterAuth
- Vercel AI SDK

## Backend

- SvelteKit server routes
- Neon PostgreSQL
- Drizzle ORM (recommended) or Prisma

## AI Providers

Via Vercel AI SDK:

- OpenAI
- Anthropic
- Gemini

The abstraction layer allows provider swapping later.

---

# Core Architectural Principle

The system should be built around **content sections**, not generic chat sessions.

Instead of:

```txt
User → AI Chat
```

Structure data like this:

```txt
Page
  └── Section
        ├── AI Summary
        ├── User Notes
        ├── Comments
        ├── Share Links
        ├── AI Conversations
        └── Saved Insights
```

This creates a reusable semantic knowledge layer around the content.

---

# Why Section-Based Architecture Matters

Benefits:

- AI outputs become reusable
- Easier caching
- Easier regeneration
- Better sharing semantics
- Structured UX
- Better long-term scalability
- Enables semantic search later
- Enables embeddings later
- Enables collaborative annotation workflows

---

# Recommended MVP Features

## 1. AI Section Summaries

### User Flow

User clicks:

```txt
Summarise this section
```

System flow:

```txt
Section text
  → generateObject()
  → structured summary
  → save to database
```

---

## Use Structured Generation

Use:

```ts
generateObject()
```

instead of plain text generation.

Reason:

Structured JSON is reusable across:

- UI rendering
- Search
- Sharing
- Recommendations
- Future AI workflows

---

## Example Summary Schema

```ts
{
  title: string
  shortSummary: string
  keyPoints: string[]
  questions: string[]
  notableQuotes: string[]
}
```

---

# Suggested Database Design

## pages

```txt
id
slug
title
created_at
updated_at
```

---

## sections

```txt
id
page_id
heading
content
position
content_hash
created_at
updated_at
```

---

## ai_summaries

```txt
id
user_id
page_id
section_id
summary_json
model
prompt_version
source_text_hash
created_at
updated_at
```

---

## user_section_notes

```txt
id
user_id
section_id
note
created_at
updated_at
```

---

## ai_threads

```txt
id
user_id
page_id
section_id
title
created_at
updated_at
```

---

## ai_messages

```txt
id
thread_id
role
content
created_at
```

---

## share_links

```txt
id
resource_type
resource_id
visibility
token
created_by
created_at
```

---

# Important Concept: Source Hashing

Each section should have:

```txt
content_hash
```

or:

```txt
source_text_hash
```

This matters because:

- content changes over time
- AI summaries become stale
- cached summaries may no longer reflect source content

The hash allows invalidation/regeneration logic later.

---

# AI Conversations

## Goal

Allow users to ask contextual questions about a section.

Example:

```txt
"What does this paragraph imply about longevity?"
```

---

## Recommended Flow

Use:

```ts
streamText()
```

with context including:

- section text
- saved summary
- user notes
- previous messages

---

## Example Context Assembly

```txt
System Prompt
+
Section Content
+
Existing AI Summary
+
User Notes
+
Conversation History
+
Latest User Question
```

---

# Suggested API Routes

```txt
/api/ai/summarise-section
/api/ai/section-chat
/api/ai/save-note
/api/ai/share-summary
/api/ai/regenerate-summary
```

---

# Route Responsibilities

Each route should:

1. Validate BetterAuth session
2. Check permissions
3. Load section content server-side
4. Build AI context
5. Call AI provider
6. Store result
7. Return JSON or stream

---

# Authentication

Recommended:

- BetterAuth
- Google OAuth

Store only:

```txt
user.id
```

inside AI-related tables.

Keep auth concerns isolated from AI concerns.

---

# UI Recommendations

## Section-Level Actions

Each section should expose actions like:

```txt
[ Summarise ]
[ Ask AI ]
[ Save Note ]
[ Share ]
```

---

## Suggested UX Pattern

### Main Content

Long-form article or document.

### Side Panel / Drawer

Contains:

- AI summary
- Key points
- Saved notes
- Suggested questions
- Conversation thread

This creates a much stronger UX than a generic floating chatbot.

---

# Sharing Model

Recommended visibility levels:

```txt
private
unlisted
shared_with_email
public
```

Default should be:

```txt
private
```

---

# Future Expansion Possibilities

## Semantic Search

Add embeddings later:

```txt
section_embeddings
summary_embeddings
conversation_embeddings
```

Potential providers:

- OpenAI embeddings
- Voyage AI
- Cohere

---

## AI Recommendation Engine

Recommend:

- related sections
- related articles
- similar user insights
- follow-up questions

---

## Collaborative Annotation

Potential future features:

- team workspaces
- collaborative notes
- public annotations
- expert commentary layers

---

# Suggested Initial Scope (MVP)

Focus on:

## Phase 1

- Google login
- AI summaries
- Saved summaries
- Notes
- Basic section chat

---

## Phase 2

- Sharing
- Comments
- Rich conversation history
- Semantic search

---

## Phase 3

- Embeddings
- Recommendations
- Collaboration
- Cross-document knowledge graph

---

# Recommended Technical Choices

## Database

Strong recommendation:

- Neon PostgreSQL
- Drizzle ORM

Reasons:

- excellent with SvelteKit
- lightweight
- edge/serverless friendly
- strong TypeScript support

---

## AI SDK Usage

### Use `generateObject()` for:

- summaries
- extracted metadata
- structured insights

### Use `streamText()` for:

- conversations
- explanations
- follow-up questions

---

# Important Architectural Advice

Avoid building:

```txt
"AI chatbot attached to article"
```

Instead build:

```txt
"Persistent knowledge layer around content"
```

This distinction matters enormously long-term.

The second approach creates:

- reusable intelligence
- durable user value
- scalable information architecture
- richer user retention patterns
- much better UX possibilities later

---

# Final Recommendation

Start simple.

The ideal MVP stack:

```txt
SvelteKit
BetterAuth
Google OAuth
Neon PostgreSQL
Drizzle ORM
Vercel AI SDK
OpenAI or Anthropic
```

Initial features:

- save AI summaries
- contextual section chat
- notes
- user persistence

Then evolve gradually into a richer knowledge platform.
