# Brainstorm: Mise App Architecture

**Date:** 2026-03-06
**Status:** Reviewed

## What We're Building

Mise is an AI cooking chat app where conversations produce rich, interactive widgets — recipe cards, ingredient lists, step-by-step cook mode, tips, timers, and more. The LLM doesn't just talk; it *renders UI*.

**MVP goal:** A one-shottable, end-to-end working app that demonstrates the full pipeline: user signs in, chats with the AI, the AI searches a recipe database, and returns structured responses that render as beautiful widgets — all matching the existing HTML mock designs.

## Why This Approach

### The Core Insight: Structured JSON Output

Instead of parsing custom XML tags from freeform LLM text, we use **Gemini's native structured output** to enforce a JSON schema. The LLM returns an array of typed content blocks:

```json
{
  "blocks": [
    { "type": "text", "content": "What a wonderful choice..." },
    { "type": "recipe_card", "data": { "name": "Boeuf Bourguignon", "cuisine": "French", ... } },
    { "type": "ingredients", "data": { "servings": 6, "items": [...] } },
    { "type": "text", "content": "Before we start, three things..." },
    { "type": "tips", "data": { "items": [...] } },
    { "type": "quick_replies", "data": { "options": ["Start cooking", "Adjust servings"] } }
  ]
}
```

Each block type maps 1:1 to a React Native component. No parsing. No malformed tags. Type-safe from LLM to screen.

### Why Gemini 2.0 Flash

- **$0.10/M input, $0.40/M output** — 3-10x cheaper than alternatives
- **Native structured output** — enforces our widget JSON schema
- **Function calling** — the `search_recipes` tool is a first-class Gemini feature
- **Fast** — Flash models are optimized for speed
- **Stays in Google ecosystem** with Firebase

### Why Firebase Everything

Keeping auth, database, and compute in one ecosystem eliminates integration friction:

- **Firebase Auth** → Email + Google sign-in
- **Firestore** → Recipe database (seeded collection)
- **Cloud Functions (2nd gen)** → API proxy to Gemini (built on Cloud Run under the hood)
- **Firebase JS SDK** → Works with Expo Go for fast dev iteration

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│            Expo App (React Native)           │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │ Firebase  │  │  Chat    │  │  Widget   │  │
│  │   Auth    │  │  Screen  │  │ Renderer  │  │
│  └──────────┘  └────┬─────┘  └─────┬─────┘  │
│                     │              │         │
│              ┌──────┴──────────────┘         │
│              │  Chat Service                 │
│              │  (sends messages,             │
│              │   receives block arrays)      │
│              └──────┬───────────────         │
│                     │ HTTPS POST             │
└─────────────────────┼───────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │   Firebase Cloud Function  │
        │   /api/chat                │
        │                           │
        │  1. Verify Firebase token  │
        │  2. Build Gemini prompt    │
        │  3. Attach tools:          │
        │     - search_recipes       │
        │  4. Call Gemini 2.0 Flash  │
        │  5. If tool call →         │
        │     query Firestore        │
        │  6. Return structured JSON │
        └──────┬──────────┬─────────┘
               │          │
      ┌────────┴──┐  ┌───┴──────────┐
      │  Gemini   │  │  Firestore   │
      │  2.0 Flash│  │  (recipes)   │
      └───────────┘  └──────────────┘
```

## Key Decisions

### 1. Widget Format: Structured JSON blocks
- LLM returns `{ blocks: [...] }` where each block has `type` + `data`
- Gemini enforces schema via `response_mime_type: "application/json"` + `response_schema`
- App maps block types to React Native components via a registry

### 2. MVP Widget Set: Core 5
| Widget | Block Type | Data Shape |
|--------|-----------|------------|
| Text message | `text` | `{ content: string }` |
| Recipe card | `recipe_card` | `{ name, cuisine, time, servings, difficulty, description }` |
| Ingredients list | `ingredients` | `{ servings, items: [{ amount, name, note? }] }` |
| Cook steps | `cook_steps` | `{ steps: [{ num, title, text, time?, tip?, warning? }] }` |
| Quick reply chips | `quick_replies` | `{ options: string[] }` |

### 3. Backend: Single Firebase Cloud Function
- One HTTPS callable function: `/api/chat`
- Accepts: `{ message: string, conversationHistory: [...] }`
- Returns: `{ blocks: [...] }`
- Handles the Gemini tool-call loop internally (search_recipes → Firestore query → back to Gemini)

### 4. Recipe Search: LLM-as-Search
- **No search infrastructure needed.** All 50 recipe summaries (~2K tokens) are included in the Gemini system prompt or tool response.
- Gemini does semantic matching: "something hearty with red wine" → Beef Bourguignon
- Cost: ~$0.0002 per call for the extra context — negligible
- When Gemini picks a recipe, the Cloud Function fetches the full recipe document from Firestore by ID
- Scales to ~200 recipes before we'd need actual search infrastructure

### 5. Recipe Data: Seeded Firestore
- 20-50 recipes pre-loaded via seed script
- Each recipe document contains: name, cuisine, difficulty, times, servings, ingredients[], steps[], tips[], description
- Recipe summaries (name + cuisine + tags + description) cached as a single "catalog" document for inclusion in LLM context

### 6. Auth: Email + Google
- Firebase Auth with email/password + Google OAuth
- Auth state managed client-side via `onAuthStateChanged`
- Cloud Function verifies Firebase ID token on every request

### 7. Chat Storage: Local Only, Daily Scope
- AsyncStorage (or MMKV for performance) stores conversation history on-device
- **History scope: all messages from today** (midnight to midnight). Fresh context each new day.
- Full day's history sent with each API request — with Gemini's 1M context window, even a long session is trivial
- No Firestore cost for chat messages
- Can add server-side persistence later

### 8. Widget Interactivity: Inject as Chat Message
- Tapping any widget button (e.g., "Start Cooking", quick reply chip) injects a pre-defined text as a user message
- Example: tapping "Start Cooking" on a recipe card sends "Let's start cooking Boeuf Bourguignon"
- Keeps the interaction model uniform — every action is a chat turn
- The LLM handles the response naturally based on what was "said"
- Ingredient checkboxes are local UI state only (not sent to LLM)

### 9. Styling: NativeWind (Tailwind for RN)
- Use NativeWind to stay close to the CSS mental model from the HTML mocks
- Port CSS variables from shared.css into tailwind.config.js as custom theme tokens
- Enables `className="bg-surface rounded-xl p-4"` syntax in React Native
- Works with Expo Go, fast to iterate, familiar to web developers

### 10. Development: Expo Go + Firebase JS SDK
- Use `@firebase/auth`, `@firebase/firestore` (JS packages, not native)
- Works in Expo Go — no custom dev client needed
- Web-first development for fastest feedback loop
- `npx expo start --web` for browser testing

## Tech Stack Summary

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Expo (React Native) | iOS, Android, Web from one codebase |
| UI Framework | React Native + custom components | Match existing CSS design system |
| Auth | Firebase Auth (JS SDK) | Email + Google, works with Expo Go |
| Database | Firestore | Recipes collection, serverless, free tier |
| API | Firebase Cloud Functions (2nd gen) | Stays in Firebase, free tier: 2M calls/month |
| LLM | Gemini 2.0 Flash | $0.10/$0.40 per M tokens, structured output |
| Chat Storage | AsyncStorage / MMKV | Local-only for MVP, zero server cost |
| Styling | NativeWind (Tailwind for RN) | Closest to CSS mental model, fast iteration |

## Data Flow: A Chat Turn

1. User types "I want to make Beef Bourguignon"
2. App sends `POST /api/chat` with message + conversation history + Firebase ID token
3. Cloud Function verifies token, builds Gemini prompt with system instructions + widget schema
4. Gemini decides to call `search_recipes({ query: "beef bourguignon" })`
5. Cloud Function queries Firestore `recipes` collection
6. Results passed back to Gemini as tool response
7. Gemini returns structured JSON: `{ blocks: [{ type: "text", ... }, { type: "recipe_card", ... }] }`
8. Cloud Function returns blocks to app
9. App's WidgetRenderer maps each block to a React Native component
10. User sees the beautiful recipe card rendered in-chat

## File Structure (Proposed)

```
mise-app/
├── app/                          # Expo Router (file-based routing)
│   ├── (auth)/
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── (app)/
│   │   ├── _layout.tsx           # Tab navigator
│   │   ├── index.tsx             # Chat screen (home)
│   │   └── settings.tsx
│   └── _layout.tsx               # Root layout (auth gate)
├── components/
│   ├── chat/
│   │   ├── ChatFeed.tsx          # ScrollView of messages
│   │   ├── ChatInput.tsx         # Text input + send button
│   │   ├── MessageBubble.tsx     # User message bubble
│   │   └── QuickReplies.tsx      # Suggestion chips
│   └── widgets/
│       ├── WidgetRenderer.tsx    # Block type → component mapper
│       ├── RecipeCard.tsx
│       ├── IngredientsList.tsx
│       ├── CookSteps.tsx
│       └── TextBlock.tsx
├── services/
│   ├── firebase.ts               # Firebase app init
│   ├── auth.ts                   # Sign in/up/out helpers
│   └── chat.ts                   # POST /api/chat, manage history
├── hooks/
│   ├── useAuth.ts                # Auth state hook
│   └── useChat.ts                # Chat state + send message
├── theme/
│   └── tokens.ts                 # Design tokens from shared.css
├── functions/                    # Firebase Cloud Functions
│   ├── src/
│   │   ├── index.ts              # Cloud Function entry
│   │   ├── gemini.ts             # Gemini API client + schema
│   │   ├── tools.ts              # search_recipes implementation
│   │   └── prompts.ts            # System prompt + widget instructions
│   └── package.json
├── scripts/
│   └── seed-recipes.ts           # Seed Firestore with recipes
├── app.json                      # Expo config
├── firebase.json                 # Firebase project config
└── package.json
```

## Open Questions

*None remaining — all key decisions resolved through Q&A.*

## Cost Estimate (MVP)

| Service | Free Tier | Expected MVP Usage |
|---------|----------|-------------------|
| Firebase Auth | 10K MAU free | Well within |
| Firestore | 50K reads/day, 20K writes/day | Well within (50 recipes, rare writes) |
| Cloud Functions | 2M invocations/month | Well within |
| Gemini 2.0 Flash | ~$0.10/M input tokens | ~$1-5/month for dev/testing |
| **Total MVP cost** | | **~$0-5/month** |

## Next Steps

1. `/ce:plan` — Create detailed implementation plan with file-by-file breakdown
2. Set up Firebase project + Expo app scaffold
3. Implement Cloud Function with Gemini integration
4. Build WidgetRenderer + Core 5 widgets
5. Seed Firestore with recipes
6. Wire it all together
