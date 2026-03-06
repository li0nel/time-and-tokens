---
title: "feat: Build Mise AI Cooking Chat App MVP"
type: feat
status: active
date: 2026-03-06
deepened: 2026-03-06
origin: docs/brainstorms/2026-03-06-mise-app-architecture-brainstorm.md
---

# Build Mise AI Cooking Chat App MVP

## Enhancement Summary

**Deepened on:** 2026-03-06
**Research agents used:** 8 (NativeWind+Expo, Firebase AI Logic, Chat FlatList Performance, Security Review, TypeScript Patterns, Expo Router+Firebase Auth, Testing Framework, Agent-Friendly Codebase)

### Key Improvements

1. **Phase 0 added**: Project foundation with testing framework (ESLint, Jest, Playwright, Husky), Claude Code hooks for agent quality gates, and CLAUDE.md conventions
2. **FlashList v2 over FlatList**: Cell recycling, `startRenderingFromBottom`, no `inverted` hack — 5-10x better chat performance
3. **Keyboard handling**: `react-native-keyboard-controller` with `KeyboardStickyView` replaces RN's broken `KeyboardAvoidingView`
4. **Auth persistence**: `initializeAuth` with `getReactNativePersistence(AsyncStorage)` — sessions survive app restarts
5. **SDK pinning**: Expo SDK 52 required (NativeWind v4 broken on SDK 53, Firebase JS SDK auth broken on SDK 53/Hermes)
6. **Security hardening**: Billing alerts, email verification, App Check roadmap
7. **Agent implementation guide**: Task decomposition with `bd` CLI, quality gates via Claude Code hooks, feature-based file ownership

### New Considerations Discovered

- NativeWind hot reload is flaky — agents must restart with `npx expo start -c` when styles don't apply
- `signInWithPopup` only works on web — native needs `expo-auth-session` + `signInWithCredential`
- Gemini structured output `Schema` builder doesn't support `anyOf` — flat schema with optional fields is correct
- FlashList v2 is new and has open issues around `maintainVisibleContentPosition` when initial data doesn't fill the screen

---

## Overview

Build an end-to-end AI cooking chat app where conversations produce rich, interactive widgets — recipe cards, ingredient lists, step-by-step cook mode, and suggestion chips. The LLM returns structured JSON blocks that map 1:1 to React Native components. No tag parsing, no XML — type-safe from Gemini to screen.

**One-shot MVP target:** User signs in, chats with AI, AI searches recipes, returns structured widgets matching the existing HTML mock designs.

**Key architectural insight:** Firebase AI Logic (`firebase/ai`) lets us call Gemini directly from the client with built-in security, per-user rate limits, and structured output support. **No backend Cloud Function needed.**

(see brainstorm: docs/brainstorms/2026-03-06-mise-app-architecture-brainstorm.md)

## Problem Statement / Motivation

The Mise product has 25 polished HTML mockups (in `output/screens/`) and a complete CSS design system (`output/shared.css`), but no working app. We need to go from static mocks to a functional cross-platform app with real AI-powered cooking conversations.

## Proposed Solution

A single Expo (React Native) app targeting web (dev-first), iOS, and Android. Firebase handles auth and AI. Recipes are hardcoded (50 recipes in a static TypeScript file). No database, no custom backend.

## Technical Approach

### Architecture

```
┌──────────────────────────────────────────────┐
│            Expo App (React Native)            │
│                                               │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Firebase  │  │  Chat    │  │  Widget    │  │
│  │   Auth    │  │  Screen  │  │  Renderer  │  │
│  └──────────┘  └────┬─────┘  └─────┬──────┘  │
│                     │               │         │
│              useChat hook           │         │
│              │                      │         │
│     ┌────────┴──────────┐    block[] → RN     │
│     │ Firebase AI Logic  │    components      │
│     │ (firebase/ai)      │                    │
│     │                    │                    │
│     │ model.startChat()  │                    │
│     │ chat.sendMessage() │                    │
│     │                    │                    │
│     │ Tool call?         │                    │
│     │ → Look up from     │                    │
│     │   hardcoded data   │                    │
│     │ → Send result back │                    │
│     │ → Get final JSON   │                    │
│     └────────────────────┘                    │
└───────────────────────────────────────────────┘
         ↕ (via Firebase SDK, no custom server)
    Google Cloud (Gemini 2.5 Flash)
```

**What's different from the brainstorm:**
1. Cloud Function eliminated — Firebase AI Logic calls Gemini directly from client
2. Firestore eliminated — 50 recipes hardcoded in `data/recipes.ts`
3. Firebase AI Logic provides: security, per-user rate limits, structured output, function calling, future on-device inference

### Research Insights: Critical Technical Decisions

**Pin to Expo SDK 52.** Both NativeWind v4 and Firebase JS SDK auth have breaking issues on SDK 53:
- NativeWind: Babel plugin conflict causes Metro to misinterpret the app entry file ([nativewind#1486](https://github.com/nativewind/nativewind/issues/1486))
- Firebase Auth: `initializeAuth()` crashes on Hermes engine ([firebase-js-sdk#9020](https://github.com/firebase/firebase-js-sdk/issues/9020))
- Firebase: Dual package hazard with `unstable_enablePackageExports` ([expo#36598](https://github.com/expo/expo/issues/36598))

**Use FlashList v2 instead of FlatList for the chat list.** FlashList v2 provides cell recycling (10x faster JS thread), built-in `maintainVisibleContentPosition`, and `startRenderingFromBottom` — eliminating the `inverted` hack that causes 30-40 FPS drops on Android.

**Use `react-native-keyboard-controller` for keyboard handling.** RN's `KeyboardAvoidingView` is platform-inconsistent. `KeyboardStickyView` from keyboard-controller provides native-driven animations on both platforms.

**Auth persistence requires explicit setup.** Use `initializeAuth` with `getReactNativePersistence(AsyncStorage)` instead of `getAuth()` — otherwise sessions are lost on app restart.

### Implementation Phases

#### Phase 0: Project Foundation & Testing Setup

**This phase must complete before any feature work begins.** It establishes the testing framework, quality gates, and conventions that enforce code quality when AI agents implement the plan.

##### 0.1 Testing Dependencies

```bash
cd mise-app

# Dev dependencies: linting
npx expo install -- --save-dev \
  eslint eslint-config-expo \
  prettier eslint-config-prettier eslint-plugin-prettier

# Dev dependencies: unit testing
npx expo install jest-expo jest -- --save-dev
npm install --save-dev \
  @testing-library/react-native \
  @testing-library/jest-native \
  jest-junit

# Dev dependencies: e2e testing
npm install --save-dev @playwright/test
npx playwright install chromium

# Dev dependencies: git hooks
npm install --save-dev husky lint-staged
npx husky init
```

##### 0.2 `mise-app/eslint.config.js`

```js
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/", "node_modules/", ".expo/", "babel.config.js"],
  },
  {
    rules: {
      "no-console": "warn",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
]);
```

##### 0.3 `mise-app/tsconfig.json`

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "forceConsistentCasingInFileNames": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

##### 0.4 `mise-app/.prettierrc`

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100
}
```

##### 0.5 Jest Configuration in `mise-app/package.json`

```json
{
  "jest": {
    "preset": "jest-expo",
    "setupFilesAfterSetup": ["./test/setup.ts"],
    "transformIgnorePatterns": [
      "node_modules/(?!(?:.pnpm/)?((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@shopify/flash-list|nativewind|react-native-css-interop|react-native-reanimated))"
    ],
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/$1"
    },
    "collectCoverageFrom": [
      "**/*.{ts,tsx}",
      "!**/*.d.ts",
      "!**/index.ts",
      "!types/**",
      "!test/**",
      "!e2e/**"
    ]
  }
}
```

##### 0.6 `mise-app/test/setup.ts`

```typescript
import "@testing-library/jest-native/extend-expect";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
  useSegments: () => [],
  Redirect: ({ href }: { href: string }) => null,
  Slot: () => null,
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

// FlashList mock — renders items like FlatList in tests
jest.mock("@shopify/flash-list", () => {
  const { FlatList } = require("react-native");
  return { FlashList: FlatList, MasonryFlashList: FlatList };
});

// Firebase mocks
jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({})),
}));

jest.mock("firebase/auth", () => ({
  initializeAuth: jest.fn(() => ({})),
  getReactNativePersistence: jest.fn(),
  onAuthStateChanged: jest.fn((auth, cb) => {
    cb({ uid: "test-user", email: "test@mise.app" });
    return jest.fn();
  }),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(),
}));

jest.mock("firebase/ai", () => ({
  getGenerativeModel: jest.fn(() => ({
    startChat: jest.fn(() => mockChatSession),
  })),
  getAI: jest.fn(),
  GoogleAIBackend: jest.fn(),
  Schema: {
    object: jest.fn(() => ({})),
    string: jest.fn(() => ({})),
    number: jest.fn(() => ({})),
    array: jest.fn(() => ({})),
    enumString: jest.fn(() => ({})),
  },
}));

const mockChatSession = {
  sendMessage: jest.fn().mockResolvedValue({
    response: {
      text: () => JSON.stringify({ blocks: [{ type: "text", content: "Mock response" }] }),
      functionCalls: () => null,
    },
  }),
};

export { mockChatSession };
```

##### 0.7 `mise-app/playwright.config.ts`

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:8081",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 5"] } },
  ],
  webServer: {
    command: "npx expo start --web --port 8081",
    port: 8081,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});
```

##### 0.8 `mise-app/.husky/pre-commit`

```bash
npx lint-staged
```

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --max-warnings 0", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

##### 0.9 npm Scripts

```json
{
  "scripts": {
    "start": "expo start",
    "start:web": "expo start --web",
    "lint": "eslint . --max-warnings 0",
    "lint:fix": "eslint . --fix",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write \"**/*.{ts,tsx,js,json}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,json}\"",
    "test": "jest --passWithNoTests",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage --passWithNoTests",
    "e2e": "npx playwright test",
    "e2e:headed": "npx playwright test --headed",
    "check": "npm run lint && npm run typecheck && npm run test",
    "check:all": "npm run check && npm run e2e",
    "prepare": "husky"
  }
}
```

**`npm run check`** is the agent quality gate — a single command that runs lint, typecheck, and unit tests. Under 30 seconds for this project size.

##### 0.10 Claude Code Hooks — `.claude/settings.json`

These hooks enforce quality mechanically. Agents cannot bypass them.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/mise-app/.claude/hooks/lint-changed.sh",
            "timeout": 30
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/mise-app/.claude/hooks/quality-gate.sh",
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```

**`mise-app/.claude/hooks/lint-changed.sh`** — runs after every file edit:

```bash
#!/bin/bash
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
[ -z "$FILE_PATH" ] && exit 0

case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx)
    cd "$CLAUDE_PROJECT_DIR/mise-app"
    npx eslint "$FILE_PATH" --no-error-on-unmatched-pattern 2>&1
    if [ $? -ne 0 ]; then
      echo "ESLint errors in $FILE_PATH. Fix before continuing." >&2
      exit 2
    fi
    ;;
esac
exit 0
```

**`mise-app/.claude/hooks/quality-gate.sh`** — runs when agent tries to stop:

```bash
#!/bin/bash
INPUT=$(cat)
STOP_HOOK_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active')
# Prevent infinite loops
[ "$STOP_HOOK_ACTIVE" = "true" ] && exit 0

cd "$CLAUDE_PROJECT_DIR/mise-app"
ERRORS=""

npx tsc --noEmit 2>&1 || ERRORS="${ERRORS}\n- TypeScript compilation failed"
npx eslint . --quiet 2>&1 || ERRORS="${ERRORS}\n- ESLint has errors"
npx jest --passWithNoTests --bail 2>&1 || ERRORS="${ERRORS}\n- Tests are failing"

if [ -n "$ERRORS" ]; then
  echo "Quality gates failed:${ERRORS}" >&2
  echo "Fix these issues before completing your task." >&2
  exit 2
fi
exit 0
```

##### 0.11 `mise-app/CLAUDE.md`

```markdown
# CLAUDE.md — Mise App

## Commands
- Type check: `npm run typecheck`
- Lint: `npm run lint`
- Test: `npm run test`
- Full check: `npm run check` (lint + typecheck + test)
- E2E: `npm run e2e`
- Dev server: `npm run start:web`

## Architecture
- Expo Router for navigation (file-based routing in app/)
- Firebase AI Logic for Gemini calls (client-side, no backend)
- Feature-based organization (components/chat/, components/widgets/)
- Shared types in types/blocks.ts (DO NOT modify without explicit approval)
- Design tokens from output/shared.css ported to tailwind.config.js

## Rules

### File Ownership
Edit only files within your assigned task scope. If you need changes
outside your scope, create a bd issue.

### Testing Requirements
Every task MUST include tests:
- Components: render test + key interaction test
- Hooks: behavior test with mock data
- Services: request/response parsing test

### Code Style
- Use types from types/blocks.ts, never define shared types inline
- No console.log in committed code
- No `any` types in widget code (strict mode)
- NativeWind className for styling (not inline StyleSheet)

### Task Workflow
1. `bd show <id>` to read task details
2. `bd update <id> --status=in_progress`
3. Implement the feature
4. Write tests
5. Run `npm run check` (must pass)
6. `bd close <id>`
7. Commit and push

### Known Gotchas
- NativeWind hot reload is flaky. If styles don't apply, restart with `npx expo start -c`
- NativeWind className is undefined in Jest tests. Test behavior/content, not styles.
- FlashList mocks as FlatList in tests (see test/setup.ts)
- Firebase AI mocks are in test/setup.ts — use mockChatSession for chat tests
```

##### 0.12 Example Test Files

**`mise-app/__tests__/services/chat.test.ts`:**

```typescript
import { createChatSession, sendChatMessage } from "../../services/chat";
import { mockChatSession } from "../../test/setup";
import { getRecipeById } from "../../data/recipes";

jest.mock("../../data/recipes", () => ({
  getRecipeCatalog: jest.fn(() => "- [test] Test Recipe (Italian)"),
  getRecipeById: jest.fn((id: string) =>
    id === "beef-bourguignon"
      ? { id: "beef-bourguignon", name: "Boeuf Bourguignon", cuisine: "French" }
      : undefined
  ),
}));

describe("chat service", () => {
  beforeEach(() => jest.clearAllMocks());

  it("sends a message and returns parsed blocks", async () => {
    const chat = await createChatSession();
    const blocks = await sendChatMessage(chat, "Hello");
    expect(mockChatSession.sendMessage).toHaveBeenCalledWith("Hello");
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("text");
  });
});
```

**`mise-app/__tests__/components/WidgetRenderer.test.tsx`:**

```tsx
import { render, screen } from "@testing-library/react-native";
import { WidgetRenderer } from "../../components/widgets/WidgetRenderer";
import { Block } from "../../types/blocks";

describe("WidgetRenderer", () => {
  it("renders a text block", () => {
    const block: Block = { type: "text", content: "Hello from Mise!" };
    render(<WidgetRenderer block={block} />);
    expect(screen.getByText("Hello from Mise!")).toBeTruthy();
  });

  it("returns null for unknown block types", () => {
    const block = { type: "unknown" } as any;
    const { toJSON } = render(<WidgetRenderer block={block} />);
    expect(toJSON()).toBeNull();
  });
});
```

**`mise-app/e2e/auth.spec.ts`:**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("shows sign-in screen when not authenticated", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/sign in/i)).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
  });
});
```

**`mise-app/e2e/chat.spec.ts`:**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Chat", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder(/email/i).fill(process.env.TEST_EMAIL ?? "test@mise.app");
    await page.getByPlaceholder(/password/i).fill(process.env.TEST_PASSWORD ?? "testpass123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByPlaceholder(/ask mise/i)).toBeVisible({ timeout: 10_000 });
  });

  test("can send a message and see AI response", async ({ page }) => {
    await page.getByPlaceholder(/ask mise/i).fill("What can you help me cook?");
    await page.getByRole("button", { name: /send/i }).click();
    await expect(page.getByText("What can you help me cook?")).toBeVisible();
    await expect(page.getByText(/recipe|cook|help/i)).toBeVisible({ timeout: 15_000 });
  });
});
```

##### 0.13 GitHub Actions CI — `mise-app/.github/workflows/ci.yml`

```yaml
name: CI
on:
  push:
    branches: [main]
    paths: ["mise-app/**"]
  pull_request:
    branches: [main]
    paths: ["mise-app/**"]

defaults:
  run:
    working-directory: mise-app

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm, cache-dependency-path: mise-app/package-lock.json }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run format:check

  unit-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm, cache-dependency-path: mise-app/package-lock.json }
      - run: npm ci
      - run: npm test -- --coverage --ci

  e2e-web:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    needs: [lint-and-typecheck, unit-tests]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm, cache-dependency-path: mise-app/package-lock.json }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test --reporter=list
        env:
          CI: true
          TEST_EMAIL: ${{ secrets.TEST_EMAIL }}
          TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}
```

##### 0.14 File Structure for Testing

```
mise-app/
├── test/
│   └── setup.ts                    # Jest setup (all mocks)
├── __tests__/
│   ├── services/
│   │   └── chat.test.ts
│   ├── components/
│   │   ├── WidgetRenderer.test.tsx
│   │   ├── RecipeCard.test.tsx
│   │   ├── IngredientsList.test.tsx
│   │   └── ChatInput.test.tsx
│   ├── hooks/
│   │   ├── useAuth.test.ts
│   │   └── useChat.test.ts
│   └── data/
│       └── recipes.test.ts
├── e2e/
│   ├── auth.spec.ts
│   └── chat.spec.ts
├── .claude/
│   └── hooks/
│       ├── lint-changed.sh
│       └── quality-gate.sh
├── eslint.config.js
├── playwright.config.ts
├── .prettierrc
├── .husky/
│   └── pre-commit
└── CLAUDE.md
```

---

#### Phase 1: Project Scaffold & Config

**Create `mise-app/` as a new directory inside the repo.**

##### 1.1 Expo App Init

```bash
npx create-expo-app@latest mise-app --template tabs
cd mise-app
```

**Pin to Expo SDK 52.** Do not upgrade to SDK 53 until NativeWind v4 and Firebase JS SDK auth issues are resolved.

##### 1.2 Install Dependencies

```bash
# Core
npx expo install expo-router expo-linking expo-constants expo-status-bar

# Firebase JS SDK (includes AI Logic)
npm install firebase

# NativeWind (Tailwind for RN)
npm install nativewind tailwindcss

# Storage (for auth persistence + chat history)
npx expo install @react-native-async-storage/async-storage

# Chat performance
npm install @shopify/flash-list

# Keyboard handling
npx expo install react-native-keyboard-controller

# Safe area
npx expo install react-native-safe-area-context

# Animations (for send button, thinking indicator)
npx expo install react-native-reanimated
```

##### 1.3 NativeWind Config Files

**`mise-app/babel.config.js`:**

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

**`mise-app/metro.config.js`:**

```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: "./global.css" });
```

**`mise-app/global.css`:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Import `global.css` in `app/_layout.tsx`:

```tsx
import "../global.css";
```

##### 1.4 `mise-app/tailwind.config.js`

Port the design tokens from `output/shared.css`. **Use px values, not rem** — rem is 16px on web but 14dp on native, causing 12.5% size differences.

```js
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: "#FAFAF8", surface: "#FFFFFF", elevated: "#F5F2EC" },
        border: { DEFAULT: "#E8E2D9", subtle: "#F0EBE2", strong: "#C8BFB4" },
        text: { DEFAULT: "#1C1917", 2: "#6B6360", 3: "#A8A09A", 4: "#C4BCB5", inv: "#FAFAF8" },
        brand: { DEFAULT: "#C8481C", hover: "#B83D14", light: "#FCE9E2", muted: "#F5D0C0", 50: "#FFF5F2" },
        success: { DEFAULT: "#15803D", bg: "#F0FDF4" },
        warning: { DEFAULT: "#B45309", bg: "#FFFBEB" },
        info: { DEFAULT: "#1D4ED8", bg: "#EFF6FF" },
        user: { bubble: "#1C1917", text: "#F5F2EC" },
      },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
      fontSize: {
        "2xs": "10px", xs: "11px", sm: "13px", base: "15px",
        md: "16px", lg: "18px", xl: "20px", "2xl": "22px",
      },
      borderRadius: {
        xs: "4px", sm: "8px", md: "12px", lg: "16px",
        xl: "20px", "2xl": "24px", full: "9999px",
      },
    },
  },
  plugins: [],
};
```

##### 1.5 `mise-app/services/firebase.ts`

```typescript
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getAI, GoogleAIBackend } from "firebase/ai";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Use initializeAuth (not getAuth) for persistent sessions on native
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const ai = getAI(app, { backend: new GoogleAIBackend() });
```

##### 1.6 File Structure

```
mise-app/
├── app/                              # Expo Router
│   ├── _layout.tsx                   # Root layout (auth gate + global.css import)
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   └── (app)/
│       ├── _layout.tsx               # App shell (header)
│       └── index.tsx                 # Chat screen (home)
├── components/
│   ├── chat/
│   │   ├── ChatFeed.tsx              # FlashList of messages
│   │   ├── ChatInput.tsx             # Text input + send (KeyboardStickyView)
│   │   ├── MessageBubble.tsx         # User message (dark bubble)
│   │   ├── AIMessage.tsx             # AI message (renders blocks)
│   │   ├── QuickReplies.tsx          # Suggestion chips
│   │   └── ThinkingIndicator.tsx     # Animated dots
│   └── widgets/
│       ├── WidgetRenderer.tsx        # block.type → component
│       ├── TextBlock.tsx             # Markdown-ish text
│       ├── RecipeCard.tsx            # Recipe card widget
│       ├── IngredientsList.tsx       # Checkable ingredients
│       └── CookSteps.tsx            # All steps stacked
├── data/
│   └── recipes.ts                    # 50 hardcoded recipes (static)
├── services/
│   ├── firebase.ts                   # Firebase init (app, auth, ai)
│   ├── auth.ts                       # signIn, signUp, signOut
│   └── chat.ts                       # Gemini chat via firebase/ai
├── hooks/
│   ├── useAuth.ts                    # Auth state + loading
│   └── useChat.ts                    # Messages state + send
├── types/
│   └── blocks.ts                     # Block type definitions
├── test/
│   └── setup.ts                      # Jest mocks
├── __tests__/                        # Unit tests
├── e2e/                              # Playwright e2e tests
├── .claude/hooks/                    # Quality gate scripts
├── global.css
├── tailwind.config.js
├── babel.config.js
├── metro.config.js
├── eslint.config.js
├── playwright.config.ts
├── .prettierrc
├── CLAUDE.md
├── app.json
├── firebase.json
└── package.json
```

---

#### Phase 2: Authentication (~5 files)

##### 2.1 `mise-app/hooks/useAuth.ts`

```typescript
import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../services/firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  return { user, loading };
}
```

##### 2.2 `mise-app/services/auth.ts`

```typescript
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
} from "firebase/auth";
import { Platform } from "react-native";
import { auth } from "./firebase";

export const signIn = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const signUp = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

// signInWithPopup works on web only.
// Native requires expo-auth-session + signInWithCredential.
export const signInWithGoogle = () => {
  if (Platform.OS === "web") {
    return signInWithPopup(auth, new GoogleAuthProvider());
  }
  // TODO: Implement expo-auth-session flow for native
  throw new Error("Google sign-in on native requires expo-auth-session setup");
};

export const signOut = () => firebaseSignOut(auth);
```

##### 2.3 `mise-app/app/_layout.tsx` — Root Auth Gate

```tsx
import "../global.css";
import { useAuth } from "../hooks/useAuth";
import { Redirect, Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { KeyboardProvider } from "react-native-keyboard-controller";

// Prevent splash screen from auto-hiding until auth resolves
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  if (loading) return null; // splash screen still visible
  if (!user) return <Redirect href="/(auth)/sign-in" />;

  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <Slot />
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
```

> **Research note:** On Expo SDK 53+, use `Stack.Protected` instead of `<Redirect>` to eliminate auth flicker. On SDK 52, `<Redirect>` works fine with `SplashScreen.preventAutoHideAsync()`.

##### 2.4 `mise-app/app/(auth)/sign-in.tsx`

Match `output/screens/view-51-sign-in.html`:
- Logo + tagline ("mise." with terracotta dot)
- Email + password fields
- "Forgot password?" link
- Sign In button (brand color)
- Divider "or"
- "Continue with Google" button
- Footer: "Don't have an account? Sign up"

##### 2.5 `mise-app/app/(auth)/sign-up.tsx`

Similar to sign-in but with `createUserWithEmailAndPassword`.

**Security checklist (from research):**
- [ ] Enable email verification in Firebase Console
- [ ] Enable email enumeration protection in Firebase Console
- [ ] Enforce minimum 8 character passwords in client validation
- [ ] Set Google Cloud billing alerts + budget cap

---

#### Phase 3: Chat Core (~8 files)

##### 3.1 `mise-app/types/blocks.ts` — Block Type Definitions

```typescript
export type BlockType = "text" | "recipe_card" | "ingredients" | "cook_steps" | "quick_replies";

export interface TextBlock {
  type: "text";
  content: string;
}

export interface RecipeCardBlock {
  type: "recipe_card";
  data: {
    id: string;
    name: string;
    subtitle?: string;
    cuisine: string;
    time: string;
    servings: number;
    difficulty: number; // 1-3 stars
    description: string;
  };
}

export interface IngredientsBlock {
  type: "ingredients";
  data: {
    recipe_name: string;
    servings: number;
    items: Array<{
      amount: string;
      name: string;
      note?: string;
    }>;
  };
}

export interface CookStepsBlock {
  type: "cook_steps";
  data: {
    recipe_name: string;
    steps: Array<{
      num: number;
      title: string;
      text: string;
      time?: string;
      tip?: string;
      warning?: string;
    }>;
  };
}

export interface QuickRepliesBlock {
  type: "quick_replies";
  data: {
    options: string[];
  };
}

export type Block =
  | TextBlock
  | RecipeCardBlock
  | IngredientsBlock
  | CookStepsBlock
  | QuickRepliesBlock;

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;       // user: text typed; ai: unused (blocks)
  blocks?: Block[];      // ai messages only
  timestamp: number;
}
```

##### 3.2 `mise-app/data/recipes.ts` — Hardcoded Recipe Data

```typescript
export interface Recipe {
  id: string;
  name: string;
  subtitle?: string;
  cuisine: string;
  difficulty: number;    // 1-3
  time: string;
  servings: number;
  description: string;
  tags: string[];
  ingredients: Array<{ amount: string; name: string; note?: string }>;
  steps: Array<{ num: number; title: string; text: string; time?: string; tip?: string; warning?: string }>;
  tips?: Array<{ icon: string; label: string; text: string }>;
}

export const RECIPES: Recipe[] = [
  {
    id: "beef-bourguignon",
    name: "Boeuf Bourguignon",
    subtitle: "Julia Child's Classic",
    cuisine: "French",
    difficulty: 3,
    time: "3h 30min",
    servings: 6,
    description: "Beef braised in Burgundy wine with lardons, pearl onions and mushrooms.",
    tags: ["beef", "french", "stew", "wine", "julia-child"],
    ingredients: [
      { amount: "170 g", name: "Lardons", note: "thick-cut pancetta or bacon" },
      { amount: "1.3 kg", name: "Stewing beef, cut into 5cm cubes", note: "Chuck, brisket or beef cheek" },
      // ... (full list from view-17 mock)
    ],
    steps: [
      { num: 1, title: "Blanch the lardons", text: "Bring a medium pot of water to a boil...", time: "8 min" },
      // ... (full list from view-17 mock)
    ],
    tips: [
      { icon: "🥩", label: "Dry the beef", text: "Pat every piece completely dry..." },
      { icon: "🍷", label: "Use good wine", text: "Julia's rule: if you wouldn't drink it..." },
      { icon: "🔥", label: "Brown in small batches", text: "Never crowd the pan..." },
    ],
  },
  // ... 49 more recipes
];

export function getRecipeCatalog(): string {
  return RECIPES.map((r) =>
    `- [${r.id}] ${r.name} (${r.cuisine}) — ${r.time}, ${r.servings} servings, difficulty ${r.difficulty}/3. ${r.description}`
  ).join("\n");
}

export function getRecipeById(id: string): Recipe | undefined {
  return RECIPES.find((r) => r.id === id);
}
```

##### 3.3 `mise-app/services/chat.ts` — Gemini Chat via Firebase AI Logic

```typescript
import { getGenerativeModel, Schema } from "firebase/ai";
import { ai } from "./firebase";
import { getRecipeCatalog, getRecipeById } from "../data/recipes";
import { Block, ChatMessage } from "../types/blocks";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ── Response Schema (flat structure — Gemini doesn't support anyOf) ──

const blockSchema = Schema.object({
  properties: {
    type: Schema.enumString({
      values: ["text", "recipe_card", "ingredients", "cook_steps", "quick_replies"],
    }),
    content: Schema.string(),
    data: Schema.object({
      properties: {
        id: Schema.string(),
        name: Schema.string(),
        subtitle: Schema.string(),
        cuisine: Schema.string(),
        time: Schema.string(),
        servings: Schema.number(),
        difficulty: Schema.number(),
        description: Schema.string(),
        recipe_name: Schema.string(),
        items: Schema.array({
          items: Schema.object({
            properties: {
              amount: Schema.string(),
              name: Schema.string(),
              note: Schema.string(),
            },
            optionalProperties: ["note"],
          }),
        }),
        steps: Schema.array({
          items: Schema.object({
            properties: {
              num: Schema.number(),
              title: Schema.string(),
              text: Schema.string(),
              time: Schema.string(),
              tip: Schema.string(),
              warning: Schema.string(),
            },
            optionalProperties: ["time", "tip", "warning"],
          }),
        }),
        options: Schema.array({ items: Schema.string() }),
      },
      optionalProperties: [
        "id", "name", "subtitle", "cuisine", "time", "servings",
        "difficulty", "description", "recipe_name", "items", "steps", "options",
      ],
    }),
  },
  optionalProperties: ["content", "data"],
});

const responseSchema = Schema.object({
  properties: {
    blocks: Schema.array({ items: blockSchema }),
  },
});

// ── Tool Declaration ──

const tools = [{
  functionDeclarations: [{
    name: "get_recipe_details",
    description: "Get the full details of a recipe by ID from the catalog.",
    parameters: Schema.object({
      properties: {
        recipe_id: Schema.string({
          description: "Recipe ID from the catalog (e.g., 'beef-bourguignon')",
        }),
      },
    }),
  }],
}];

// ── System Prompt (uses systemInstruction, not user message) ──

const SYSTEM_PROMPT = `You are Mise, a knowledgeable and warm AI cooking companion.
You teach users to think like a chef — understanding technique, vocabulary, and intention.
Your tagline: "Not a recipe app. A culinary education."

## Response Format
Respond with a JSON object containing a "blocks" array.
Each block has a "type" and type-specific fields.

Block types:
- "text": { type: "text", content: "..." } — Conversational text.
- "recipe_card": { type: "recipe_card", data: { id, name, subtitle?, cuisine, time, servings, difficulty, description } }
- "ingredients": { type: "ingredients", data: { recipe_name, servings, items: [{ amount, name, note? }] } }
- "cook_steps": { type: "cook_steps", data: { recipe_name, steps: [{ num, title, text, time?, tip?, warning? }] } }
- "quick_replies": { type: "quick_replies", data: { options: ["..."] } } — ALWAYS include as last block.

## Guidelines
- Be warm, educational. Explain the "why" behind techniques.
- A single response can contain MULTIPLE blocks.
- ALWAYS end with quick_replies.
- When presenting a recipe, call get_recipe_details to get full data.
- Only answer questions related to cooking, recipes, and food preparation.
  If asked about unrelated topics, politely decline and redirect to cooking.

## Recipe Catalog
`;

// ── Chat Service ──

export async function createChatSession() {
  const catalog = getRecipeCatalog();

  const model = getGenerativeModel(ai, {
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_PROMPT + catalog,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    },
    tools: tools,
  });

  return model.startChat();
}

export async function sendChatMessage(
  chat: any,
  message: string
): Promise<Block[]> {
  let result = await chat.sendMessage(message);
  let functionCalls = result.response.functionCalls();

  let iterations = 0;
  while (functionCalls && functionCalls.length > 0 && iterations < 3) {
    const responses = [];

    for (const call of functionCalls) {
      if (call.name === "get_recipe_details") {
        const recipe = getRecipeById(call.args.recipe_id);
        responses.push({
          functionResponse: {
            name: call.name,
            response: recipe || { error: "Recipe not found" },
          },
        });
      }
    }

    result = await chat.sendMessage(responses);
    functionCalls = result.response.functionCalls();
    iterations++;
  }

  const parsed = JSON.parse(result.response.text());
  return parsed.blocks;
}

// ── Local Storage (daily scope) ──

const STORAGE_KEY = "mise_chat_history";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function loadTodayHistory(): Promise<ChatMessage[]> {
  const raw = await AsyncStorage.getItem(`${STORAGE_KEY}_${todayKey()}`);
  return raw ? JSON.parse(raw) : [];
}

export async function saveTodayHistory(messages: ChatMessage[]): Promise<void> {
  await AsyncStorage.setItem(`${STORAGE_KEY}_${todayKey()}`, JSON.stringify(messages));
}
```

##### 3.4 `mise-app/hooks/useChat.ts`

```typescript
import { useState, useEffect, useCallback, useRef } from "react";
import { ChatMessage, Block } from "../types/blocks";
import {
  createChatSession,
  sendChatMessage,
  loadTodayHistory,
  saveTodayHistory,
} from "../services/chat";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const history = await loadTodayHistory();
      setMessages(history);
      chatRef.current = await createChatSession();
    })();
  }, []);

  useEffect(() => {
    if (messages.length > 0) saveTodayHistory(messages);
  }, [messages]);

  const send = useCallback(async (text: string) => {
    if (!chatRef.current) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const blocks = await sendChatMessage(chatRef.current, text);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "",
        blocks,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "",
        blocks: [{ type: "text", content: "Sorry, something went wrong. Please try again." }],
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { messages, loading, send };
}
```

##### 3.5 `mise-app/app/(app)/index.tsx` — Chat Screen

```tsx
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { ChatFeed } from "../../components/chat/ChatFeed";
import { ChatInput } from "../../components/chat/ChatInput";
import { useChat } from "../../hooks/useChat";

export default function ChatScreen() {
  const { messages, loading, send } = useChat();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <ChatFeed messages={messages} loading={loading} onChipPress={send} />
      <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
        <ChatInput onSend={send} disabled={loading} bottomInset={insets.bottom} />
      </KeyboardStickyView>
    </View>
  );
}
```

##### 3.6 `mise-app/components/chat/ChatFeed.tsx`

**Use FlashList v2** (not FlatList):

```tsx
import { FlashList } from "@shopify/flash-list";
import React, { useCallback, useRef } from "react";
import { ChatMessage } from "../../types/blocks";
import { MessageBubble } from "./MessageBubble";
import { AIMessage } from "./AIMessage";
import { ThinkingIndicator } from "./ThinkingIndicator";

interface Props {
  messages: ChatMessage[];
  loading: boolean;
  onChipPress: (text: string) => void;
}

export function ChatFeed({ messages, loading, onChipPress }: Props) {
  const renderItem = useCallback(({ item }: { item: ChatMessage }) => {
    if (item.role === "user") return <MessageBubble text={item.content} />;
    return <AIMessage message={item} onAction={onChipPress} />;
  }, [onChipPress]);

  return (
    <FlashList
      data={messages}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      maintainVisibleContentPosition={{
        startRenderingFromBottom: true,
        autoscrollToBottomThreshold: 0.2,
      }}
      contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 16 }}
      ListFooterComponent={loading ? <ThinkingIndicator /> : null}
      estimatedItemSize={100}
    />
  );
}
```

> **Research note:** Do NOT use `inverted={true}` — causes 30-40 FPS drops on Android. FlashList v2's `startRenderingFromBottom` is the correct approach. FlashList mocks as FlatList in Jest (see test/setup.ts).

##### 3.7 `mise-app/components/chat/ChatInput.tsx`

```tsx
import { useState, useCallback } from "react";
import { View, TextInput, Pressable, Text } from "react-native";

interface Props {
  onSend: (text: string) => void;
  disabled: boolean;
  bottomInset: number;
}

export function ChatInput({ onSend, disabled, bottomInset }: Props) {
  const [text, setText] = useState("");

  const handleSend = useCallback(() => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  }, [text, onSend]);

  return (
    <View
      className="bg-bg-surface border-t border-border-subtle px-3 pt-2"
      style={{ paddingBottom: Math.max(bottomInset, 8) }}
    >
      <View className="flex-row items-end gap-2">
        <TextInput
          testID="chat-input"
          className="flex-1 bg-bg-elevated rounded-full px-4 py-2 text-base text-text"
          placeholder="Ask Mise anything..."
          placeholderTextColor="#A8A09A"
          value={text}
          onChangeText={setText}
          multiline
          maxLength={4000}
          editable={!disabled}
          blurOnSubmit={false}
        />
        {text.trim().length > 0 && (
          <Pressable
            testID="send-button"
            onPress={handleSend}
            disabled={disabled}
            className="w-9 h-9 rounded-full bg-brand items-center justify-center mb-0.5"
          >
            <Text className="text-text-inv text-lg">↑</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
```

##### 3.8 `mise-app/components/chat/MessageBubble.tsx`

Dark rounded bubble for user messages (`bg-user-bubble text-user-text`).

##### 3.9 `mise-app/components/chat/AIMessage.tsx`

Maps AI `ChatMessage` to widget components via `WidgetRenderer`. No bubble — AI text renders directly. If the last block is `quick_replies`, passes them up to `ChatFeed`.

##### 3.10 `mise-app/components/chat/ThinkingIndicator.tsx`

Three animated dots (matching `.thinking` in shared.css). Use `react-native-reanimated` for smooth 60fps animation.

---

#### Phase 4: Widget Renderer + Core 5 Widgets (~6 files)

##### 4.1 `mise-app/components/widgets/WidgetRenderer.tsx`

```tsx
import { Block } from "../../types/blocks";
import { TextBlock } from "./TextBlock";
import { RecipeCard } from "./RecipeCard";
import { IngredientsList } from "./IngredientsList";
import { CookSteps } from "./CookSteps";

const WIDGET_MAP: Record<string, React.ComponentType<any>> = {
  text: TextBlock,
  recipe_card: RecipeCard,
  ingredients: IngredientsList,
  cook_steps: CookSteps,
};

interface Props {
  block: Block;
  onAction?: (text: string) => void;
}

export function WidgetRenderer({ block, onAction }: Props) {
  const Component = WIDGET_MAP[block.type];
  if (!Component) return null;
  return <Component block={block} onAction={onAction} />;
}
```

##### 4.2 `mise-app/components/widgets/TextBlock.tsx`

Renders `block.content` as styled text. Basic markdown: `**bold**`, `*italic*`, `\n` → line breaks.

##### 4.3 `mise-app/components/widgets/RecipeCard.tsx`

Match `output/screens/view-03-chat-recipe-card.html`:
- Gradient hero area with emoji placeholder
- Recipe name + subtitle
- Star rating row (difficulty 1-3)
- Meta row: `⏱ 3h 30 min` · `👥 6 servings` · `🇫🇷 French`
- Description text
- Two action buttons: "Start Cooking" (brand) + "View Full Recipe" (outline)
- **"Start Cooking" tap** → `onAction("Let's start cooking [recipe name]")`
- Add `testID` props for e2e testing

##### 4.4 `mise-app/components/widgets/IngredientsList.tsx`

Match `output/screens/view-05-chat-ingredients-widget.html`:
- Widget header + servings badge
- Ingredient rows: checkbox (local state), name (left), amount (right)
- **Checkbox state is local React state only**
- Use `React.memo` for performance in FlashList

##### 4.5 `mise-app/components/widgets/CookSteps.tsx`

Match `output/screens/view-10-chat-cook-mode.html`:
- Header: "COOK MODE" + step count
- All steps stacked vertically (no pagination)
- Numbered circle, title, body, optional timer/tip/warning
- Use `React.memo` for performance

##### 4.6 `mise-app/components/chat/QuickReplies.tsx`

Horizontal `ScrollView` of chips. Chip tap → `onAction(chipText)`.

---

### Build Sequence

Build in this order with testing at each step:

```
0. Project foundation           →  npm run check passes (lint, typecheck, test)
1. Project scaffold             →  npx expo start --web shows tabs template
2. Tailwind + design tokens     →  styled components render with correct colors
3. Firebase init + Auth         →  can sign in/up, auth persists across restarts
   └─ Write tests: useAuth.test.ts, auth e2e
4. Hardcode 50 recipes          →  data/recipes.ts, getRecipeCatalog(), getRecipeById()
   └─ Write tests: recipes.test.ts
5. Chat UI (mock blocks)        →  see widgets with hardcoded Block[] data
   └─ Write tests: WidgetRenderer.test.tsx, RecipeCard.test.tsx
6. WidgetRenderer + widgets     →  all 5 widget types render beautifully
   └─ Write tests: all widget component tests
7. Firebase AI Logic wiring     →  real Gemini responses using recipe data
   └─ Write tests: chat.test.ts, useChat.test.ts
8. End-to-end flow              →  full demo works
   └─ Write tests: auth.spec.ts, chat.spec.ts (Playwright)
```

**Step 5 is key**: build the entire chat UI with hardcoded mock `Block[]` arrays (copy data from the HTML mocks). Perfect the widgets without needing Gemini. Then swap in real AI at step 7.

---

## Agent Implementation Guide

### Task Decomposition for `bd` CLI

The plan decomposes into a DAG of tasks. Phase 0 is sequential (one agent). Phases 1-4 can parallelize.

#### Phase 0: Foundation (Sequential — 1 agent)

```bash
bd create --title="Scaffold Expo project with SDK 52" \
  --description="Run create-expo-app, install all dependencies (Firebase, NativeWind, FlashList, keyboard-controller, etc.), configure babel/metro/tailwind." \
  --type=task --priority=0

bd create --title="Set up testing framework" \
  --description="Configure ESLint, TypeScript strict, Jest, Playwright, Husky. Create test/setup.ts with all mocks. Create CLAUDE.md. Set up .claude/hooks." \
  --type=task --priority=0

bd create --title="Define all TypeScript types" \
  --description="Create types/blocks.ts with all block types, ChatMessage interface. These types are the contract layer — frozen after this task." \
  --type=task --priority=0
```

#### Phase 1: Foundation Layer (Parallel — 3 agents)

```bash
bd create --title="Build Firebase Auth flow" \
  --description="services/firebase.ts (with initializeAuth + persistence), services/auth.ts, hooks/useAuth.ts, app/_layout.tsx (auth gate + splash screen), (auth)/sign-in.tsx, (auth)/sign-up.tsx. Include useAuth.test.ts." \
  --type=feature --priority=1

bd create --title="Hardcode 50 recipes in data/recipes.ts" \
  --description="Create full Recipe interface, 50 recipes covering diverse cuisines. First 3 from HTML mocks. getRecipeCatalog() and getRecipeById() helpers. Include recipes.test.ts." \
  --type=task --priority=1

bd create --title="Build design system + tailwind tokens" \
  --description="Port all tokens from output/shared.css to tailwind.config.js. Create global.css. Verify colors render correctly on web." \
  --type=task --priority=1
```

#### Phase 2: Chat + Widgets (Parallel — 2-3 agents)

```bash
bd create --title="Build chat UI components" \
  --description="ChatFeed (FlashList), ChatInput (KeyboardStickyView), MessageBubble, AIMessage, ThinkingIndicator, QuickReplies. Use hardcoded mock Block[] for testing. Include component tests." \
  --type=feature --priority=1

bd create --title="Build Core 5 widget components" \
  --description="WidgetRenderer, TextBlock, RecipeCard, IngredientsList, CookSteps. Match HTML mocks exactly. Include testID props. Include widget tests." \
  --type=feature --priority=1

bd create --title="Build Gemini chat service" \
  --description="services/chat.ts — Schema builder, tool declaration, system prompt, createChatSession, sendChatMessage with tool call loop, daily storage. Include chat.test.ts and useChat.test.ts." \
  --type=feature --priority=1
```

#### Phase 3: Integration (Sequential — 1 agent)

```bash
bd create --title="Wire end-to-end flow + e2e tests" \
  --description="Connect chat service to chat UI. Test full flow: sign in → send message → see AI response with widgets. Write Playwright e2e tests (auth.spec.ts, chat.spec.ts)." \
  --type=task --priority=2
```

#### Dependencies

```bash
# Phase 1 depends on Phase 0
bd dep add <auth-task> <scaffold-task>
bd dep add <auth-task> <types-task>
bd dep add <recipes-task> <types-task>
bd dep add <design-task> <scaffold-task>

# Phase 2 depends on Phase 1
bd dep add <chat-ui-task> <design-task>
bd dep add <chat-ui-task> <types-task>
bd dep add <widgets-task> <design-task>
bd dep add <widgets-task> <types-task>
bd dep add <gemini-task> <recipes-task>
bd dep add <gemini-task> <types-task>

# Phase 3 depends on Phase 2
bd dep add <e2e-task> <chat-ui-task>
bd dep add <e2e-task> <widgets-task>
bd dep add <e2e-task> <gemini-task>
bd dep add <e2e-task> <auth-task>
```

### Quality Gates

Every agent must pass these gates before marking a task complete:

**Automated (enforced by Claude Code hooks — cannot bypass):**
- `npx tsc --noEmit` passes (TypeScript compiles)
- `npx eslint . --max-warnings 0` passes (no lint errors)
- `npx jest --passWithNoTests --bail` passes (all tests green)

**Instructed (in CLAUDE.md — agent should follow):**
- New code has at least one test file
- Components have a render test at minimum
- Hooks have a behavior test
- `testID` props added to interactive elements (for Playwright/Maestro)
- No `console.log` in production code
- Types from `types/blocks.ts` used (no inline shared types)

### Testing Back-Pressure Summary

| Layer | What | When | Time | Catches |
|-------|------|------|------|---------|
| ESLint | Lint changed file | Every file edit (PostToolUse hook) | 1-2s | Unused vars, `any`, dead code |
| TypeScript | Type check project | Every file edit + before stop | 2-5s | Wrong types, missing imports |
| Jest | Unit tests | Before task completion (Stop hook) | 5-15s | Logic errors, wrong renders |
| Playwright | E2E web tests | Phase 3 + CI | 1-5min | Integration failures, broken flows |

---

## System-Wide Impact

### Interaction Graph

```
User types message
  → useChat.send(text)
    → setMessages (optimistic user bubble)
    → setLoading(true) (show thinking dots)
    → chat.sendMessage(text) [Firebase AI Logic → Gemini]
      → Gemini may call get_recipe_details tool
        → Client looks up from hardcoded data/recipes.ts (sync, instant)
        → Client sends recipe data back to Gemini
      → Gemini returns structured JSON
    → JSON.parse → Block[]
    → setMessages (add AI response with blocks)
    → saveTodayHistory (AsyncStorage)
    → setLoading(false)
```

### Error Propagation

- **Network error** → `sendMessage` throws → catch in `useChat` → error TextBlock
- **Auth expired** → `onAuthStateChanged` fires with null → redirect to sign-in
- **Gemini rate limited** → Firebase AI Logic returns 429 → show "Please wait a moment"
- **Malformed JSON** → `JSON.parse` throws → catch → error TextBlock
- **Recipe not found** → tool returns `{ error: "..." }` → Gemini adapts naturally

### State Lifecycle Risks

- **Chat session reset on app restart**: The `startChat()` session is in-memory only. On restart, we create a new session without prior context. **Mitigation**: For MVP this is acceptable. History is in AsyncStorage for display, but Gemini won't "remember." Can replay history into session on init later.
- **Recipe data is static**: Hardcoded in `data/recipes.ts`. Adding recipes requires a code change and redeploy. **Mitigation**: Perfect for MVP. Migrate to Firestore when needed.
- **Auth persistence**: Using `initializeAuth` with `getReactNativePersistence(AsyncStorage)` ensures sessions survive app restarts on native. On web, Firebase uses `indexedDB` by default.

### Security Considerations (from research)

**Do now (before any users):**
1. Require Firebase Auth before allowing AI calls
2. Set Google Cloud billing alerts + budget cap
3. Use `systemInstruction` parameter (not a user message) for system prompt
4. Enable email verification + email enumeration protection in Firebase Console

**Do before public launch:**
5. Enable Firebase App Check with DeviceCheck (iOS) / Play Integrity (Android)

**Defer for MVP:**
- Encrypting AsyncStorage chat history (cooking conversations, not sensitive)
- Server-side prompt injection filtering
- Moving system prompt server-side

## Acceptance Criteria

### Functional Requirements

- [ ] User can sign in with email/password
- [ ] User can sign in with Google (web)
- [ ] User can sign up with email/password
- [ ] Chat screen renders with empty state and welcome prompt
- [ ] User can type and send messages
- [ ] AI responds with structured blocks rendered as widgets
- [ ] TextBlock renders text with basic formatting
- [ ] RecipeCard renders with gradient hero, title, meta, action buttons
- [ ] IngredientsList renders with checkable items (local state)
- [ ] CookSteps renders all steps stacked with numbered circles, tips, warnings
- [ ] QuickReplies render as horizontal chips; tapping sends as user message
- [ ] Widget buttons ("Start Cooking") inject text as user message
- [ ] ThinkingIndicator shows animated dots while waiting for AI
- [ ] Chat history persists locally for the current day
- [ ] Chat history resets on new day
- [ ] Gemini tool calls (get_recipe_details) look up from hardcoded data

### Non-Functional Requirements

- [ ] Works on web via `npx expo start --web`
- [ ] Renders on iOS simulator and Android emulator
- [ ] AI response time < 5 seconds typical
- [ ] Design matches HTML mocks in `output/screens/`
- [ ] Firebase per-user rate limits configured
- [ ] Pinned to Expo SDK 52

### Quality Gates

- [ ] TypeScript strict mode, no `any` types in widget code
- [ ] All block types defined in `types/blocks.ts`
- [ ] ESLint passes with zero warnings (`--max-warnings 0`)
- [ ] All unit tests pass (`npm run test`)
- [ ] Playwright e2e tests pass for auth + chat flows
- [ ] `npm run check` passes (lint + typecheck + test)

## Dependencies & Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| `firebase/ai` Schema builder doesn't support our schema shape | High | Test schema early. Fallback: use `responseMimeType: "application/json"` with JSON schema string. |
| NativeWind v4 hot reload flaky | Medium | Restart with `npx expo start -c`. Document in CLAUDE.md. |
| NativeWind broken on SDK 53 | High | Pin to SDK 52. Monitor nativewind#1486 for fix. |
| Firebase JS SDK auth broken on SDK 53/Hermes | High | Pin to SDK 52. Use `initializeAuth` (not `getAuth`). |
| FlashList v2 `maintainVisibleContentPosition` bugs | Medium | Test with real message loads. Fallback: FlatList with manual scroll. |
| `signInWithPopup` fails on native | Medium | Web-first for MVP. Implement `expo-auth-session` flow for native. |
| System prompt exposed in client code | Low | Acceptable for MVP cooking app. Move to Cloud Function later. |
| Gemini hallucinates recipes not in catalog | Low | System prompt + tool constraints. |
| Chat context lost on app restart | Medium | Display from AsyncStorage, Gemini starts fresh. Replay history later. |
| 50 hardcoded recipes = static data | Low | Perfect for MVP. Migrate to Firestore when needed. |
| `react-native-keyboard-controller` requires dev build (not Expo Go) for native | Medium | Fine for web-first dev. Build dev client when testing native. |

## Cost Estimate

| Service | Free Tier | MVP Usage | Monthly Cost |
|---------|----------|-----------|-------------|
| Firebase Auth | 10K MAU | < 100 | $0 |
| Gemini via Firebase AI Logic | Included | ~$2-5 dev | ~$3 |
| **Total** | | | **~$0-3/month** |

## Sources & References

### Origin

- **Brainstorm document:** [docs/brainstorms/2026-03-06-mise-app-architecture-brainstorm.md](docs/brainstorms/2026-03-06-mise-app-architecture-brainstorm.md)
  - Key decisions carried forward: Structured JSON blocks, LLM-as-search, daily chat scope, widget-tap-as-message, NativeWind styling
  - **Updated**: Cloud Function replaced with Firebase AI Logic; Firestore replaced with hardcoded data

### Internal References

- Design system: `output/shared.css`
- All-widgets showcase: `output/screens/view-17-chat-all-widgets.html`
- Auth mock: `output/screens/view-51-sign-in.html`
- Chat empty: `output/screens/view-01-chat-empty.html`
- Cook mode: `output/screens/view-10-chat-cook-mode.html`
- Ingredients: `output/screens/view-05-chat-ingredients-widget.html`
- Recipe card: `output/screens/view-03-chat-recipe-card.html`

### External References

- Firebase AI Logic: https://firebase.google.com/docs/ai-logic
- Firebase AI Logic structured output: https://firebase.google.com/docs/ai-logic/generate-structured-output
- Firebase AI Logic function calling: https://firebase.google.com/docs/ai-logic/function-calling
- Expo + Firebase guide: https://docs.expo.dev/guides/using-firebase/
- NativeWind docs: https://www.nativewind.dev/
- FlashList v2: https://shopify.github.io/flash-list/docs/v2-changes/
- Keyboard controller: https://kirillzyusko.github.io/react-native-keyboard-controller/
- Expo Router auth: https://docs.expo.dev/router/advanced/authentication/
- Expo unit testing: https://docs.expo.dev/develop/unit-testing/
- Expo ESLint: https://docs.expo.dev/guides/using-eslint/
- Playwright: https://playwright.dev/
- Claude Code hooks: https://code.claude.com/docs/en/hooks

### Research Sources (from /deepen-plan)

- NativeWind SDK 53 breakage: https://github.com/nativewind/nativewind/issues/1486
- Firebase JS SDK Hermes crash: https://github.com/firebase/firebase-js-sdk/issues/9020
- Firebase dual package hazard: https://github.com/expo/expo/issues/36598
- FlashList v2 (Shopify Engineering): https://shopify.engineering/flashlist-v2
- Android inverted FlatList perf: https://github.com/facebook/react-native/issues/30034
- NativeWind className in Jest: https://github.com/nativewind/nativewind/issues/1414
- FlashList testing: https://shopify.github.io/flash-list/docs/testing/
- Expo Router testing: https://docs.expo.dev/router/reference/testing/
- React Native keyboard handling: https://docs.expo.dev/guides/keyboard-handling/
- Claude Code hooks enforcement: https://claudefa.st/blog/tools/hooks/stop-hook-task-enforcement
- Task decomposition for agents: https://mgx.dev/insights/task-decomposition-for-coding-agents-architectures-advancements-and-future-directions/
- Parallel agent management: https://devcenter.upsun.com/posts/git-worktrees-for-parallel-ai-coding-agents/
