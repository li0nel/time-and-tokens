# Mise

**An AI cooking assistant powered by Gemini.** Chat naturally about food, get recipe cards with structured ingredient lists, and manage your shopping list — all in one mobile app.

## What is Mise?

Mise is a mobile-first cooking companion where you chat with an AI that understands food. Ask it anything — "what can I make with chicken thighs and miso?" — and it responds with rich, typed widget blocks: recipe cards, ingredient lists, step-by-step instructions, and a shopping list you can check off at the store.

The AI doesn't just return text. It uses a structured tool harness to create, search, and update recipes in your personal collection. The chat *is* the interface — every action flows through conversation.

### Key features

- **AI chat** with Gemini — recipe discovery, meal planning, cooking Q&A
- **Typed widget blocks** — recipe cards, ingredient lists, and shopping lists rendered as native components, not plain text
- **Shopping list** — built from recipes, works offline, check items off at the store
- **Recipe collection** — save, search, and revisit your recipes
- **Offline mode** — recipes and shopping list work without a connection; chat resumes when you're back online
- **Firebase auth** — sign in with email, Google, or Apple

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React Native (Expo), NativeWind (Tailwind CSS) |
| AI | Google Gemini with structured tool calls |
| Auth & backend | Firebase |
| Design | shadcn-inspired component system |

## Getting started

```bash
cd mobile
npm install
npm start          # Expo dev server
npm run ios        # iOS simulator
npm run android    # Android emulator
```

Type-check:
```bash
cd mobile && npx tsc --noEmit
```

## Project structure

```
mise/
├── mobile/              # React Native app (Expo)
│   ├── app/             # Expo Router screens
│   ├── components/      # Shared UI components
│   └── types/           # TypeScript types
├── output/screens/      # Static HTML mockups (pixel reference)
├── specs/               # Product specs
├── docs/                # Architecture docs & brainstorms
└── scripts/             # Quality measurement tools
```

## Documentation

| Doc | Path |
|-----|------|
| Product spec | `specs/spec-1-2026-03-05T17:57.md` |
| Architecture | `docs/brainstorms/2026-03-06-mise-app-architecture-brainstorm.md` |
| Implementation plan | `docs/plans/2026-03-06-feat-mise-app-mvp-plan.md` |

## How the widget model works

The Gemini backend returns structured blocks:

```json
{ "blocks": [{ "type": "recipe_card", "data": { ... } }] }
```

Each block type maps 1:1 to a React Native component. Widget button taps (like "Add to shopping list") inject a plain-text chat message back into the conversation — no direct state mutations. The chat is the single source of truth for all actions.

---

*Built by [li0nel](https://github.com/li0nel)*
