# CLAUDE.md

## Overview
**Mise** is an AI cooking chat powered by Gemini with recipe cards, ingredient lists, and shopping lists rendered as typed widget blocks.

- Static HTML mockups: `output/screens/` (reference UI — 23 screens covering chat, recipe, shopping, auth, offline)
- Native app (source of truth): `mobile/`
- Issue tracking: uses `bd` (beads CLI); run `bd ready` to find work

## Documentation
| Doc | Path |
|-----|------|
| Current product spec | `specs/spec-1-2026-03-05T17:57.md` |
| Architecture & backend | `docs/brainstorms/2026-03-06-mise-app-architecture-brainstorm.md` |
| Implementation plan | `docs/plans/2026-03-06-feat-mise-app-mvp-plan.md` |

## Build & Run
All commands run from `mobile/`:
```bash
npm start        # Expo dev server
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web bundle (required for e2e tests)
```

## 🚦 Quality Gate — MANDATORY Before Closing Any Bead

Every agent MUST run all three checks before closing a bead. **No exceptions.**

```bash
cd mobile && npm test              # Unit tests — all must pass
cd mobile && npm run typecheck     # TypeScript — zero errors
cd mobile && npm run e2e           # E2E tests — all must pass
```

If any check fails, fix the issue before closing the bead. Do not skip, do not comment out tests.

### E2E test notes
- Playwright auto-starts the Expo web server (`npx expo start --web`) if not running
- Gemini API calls are mocked via `page.route('**/models/**:generateContent', ...)` — no real quota consumed
- Tests require `TEST_EMAIL` and `TEST_PASSWORD` env vars (a real Firebase test account); skip gracefully when absent
- Run `cd mobile && npm run e2e -- --headed` to watch tests live
- Key smoke tests to verify after any change:
  1. Unauthenticated → redirects to sign-in
  2. Sign in → chat input visible
  3. Send message → AI response appears (no error blocks)
  4. Recipe card renders with action buttons
  5. Tapping "Start Cooking" shows cook steps

### AI model configuration
- Gemini model: **`gemini-2.5-flash`** (in `mobile/services/chat.ts`)
- **Do NOT change the model name** without checking https://ai.google.dev/gemini-api/docs/models
- After any model change, verify in the app that responses render correctly (no "Sorry, I encountered an error" blocks)
- The e2e mock pattern is `**/models/**:generateContent` — update if the Firebase AI SDK changes its URL pattern

## Conventions
**TypeScript**: Strict mode. No `any`. All shared types go in `mobile/types/` (beads: `time-and-tokens-let`).

**Styling**: NativeWind only — use `className` prop. Never use `StyleSheet.create`.

**Widget model** (critical — read before building components):
- The Gemini backend returns `{ blocks: [{ type: string, data: object }] }`
- Each block type maps 1:1 to a React Native component in `mobile/components/blocks/`
- Widget button taps inject a plain-text chat message — no direct state mutations from widgets
- New block types require: (1) type definition in `types/blocks.ts`, (2) parser in `services/chat.ts` `flatBlockToBlock`, (3) React Native component, (4) registration in `AIMessage.tsx`

**Static mockups in `output/screens/`**: Pixel-reference only. `output/shared.css` holds design tokens. Do not modify these files unless specifically tasked.

## App Structure

### Screens (Expo Router)
```
app/
  _layout.tsx          # Root layout — always renders <Slot />
  (app)/
    _layout.tsx        # Auth guard — redirects to sign-in if not authenticated
    index.tsx          # Chat screen (main)
  (auth)/
    sign-in.tsx        # Sign-in screen
```

### Components
```
components/
  chat/
    AIMessage.tsx      # Renders a list of blocks for an AI message
    ChatFeed.tsx       # Scrollable message list (FlashList)
    ChatInput.tsx      # Message composer
    MessageBubble.tsx  # User message bubble
    ThinkingIndicator.tsx
  blocks/              # One component per block type
    RecipeCard.tsx
    IngredientsBlock.tsx
    CookStepsBlock.tsx
    QuickReplies.tsx
```

### Services
```
services/
  chat.ts     # Gemini chat session, sendChatMessage, history persistence
  gemini.ts   # Firebase AI SDK initialisation
```

### Types
```
types/
  blocks.ts   # Block union type — canonical source of truth for all block shapes
```
