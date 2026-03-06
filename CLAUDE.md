# CLAUDE.md

## Overview
**Mise** is an AI cooking chat powered by Gemini with recipe cards, ingredient lists, and shopping lists rendered as typed widget blocks.

- Static HTML mockups: `output/screens/` (reference UI)
- Native app (source of truth): `mobile/`
- Issue tracking: `AGENTS.md` — uses `bd` (beads); run `bd ready` to find work

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
npm run web      # Web bundle
```

Type-check (substitute for lint until ESLint is configured):
```bash
cd mobile && npx tsc --noEmit
```

Quality metrics (from repo root):
```bash
bash scripts/measure-quality.sh
```

## Conventions
**TypeScript**: Strict mode. No `any`. All shared types go in `mobile/types/` (beads: `time-and-tokens-let`).

**Styling**: NativeWind only — use `className` prop. Never use `StyleSheet.create`.

**Widget model** (critical — read before building components):
- The Gemini backend returns `{ blocks: [{ type: string, data: object }] }`
- Each block type maps 1:1 to a React Native component
- Widget button taps inject a plain-text chat message — no direct state mutations

**Static mockups in `output/screens/`**: Pixel-reference only. `output/shared.css` holds design tokens. Do not modify these files unless specifically tasked.
