# mobile/CLAUDE.md — Mise App Conventions

## Project Overview
Mise is an AI cooking chat app built with Expo SDK 55, React Native, and NativeWind (TailwindCSS v3).

## TypeScript
- **Strict mode** is enabled (`strict: true`, `noUncheckedIndexedAccess: true` in tsconfig.json)
- No `any` types — use `unknown` and narrow with type guards
- All shared types belong in `types/` directory
- Run `npm run typecheck` to check for errors

## Styling
- **NativeWind only** — use the `className` prop for all styling
- Never use `StyleSheet.create` or inline `style` props
- Design tokens come from `output/shared.css` (reference only, do not modify)
- Tailwind config is in `tailwind.config.js`

## Widget Model
The Gemini backend returns `{ blocks: [{ type: string, data: object }] }`. Each block type maps 1:1 to a React Native component. Widget button taps inject a plain-text chat message — no direct state mutations from the widget layer.

## File Structure
```
app/          expo-router screens and layouts
components/   shared React Native components
constants/    Colors, config values
types/        shared TypeScript types
test/         jest setup and test utilities
e2e/          Playwright end-to-end tests
```

## Available Scripts (run from mobile/)
| Script | Command | Purpose |
|--------|---------|---------|
| `npm start` | `expo start` | Expo dev server |
| `npm run ios` | `expo start --ios` | iOS simulator |
| `npm run android` | `expo start --android` | Android emulator |
| `npm run web` | `expo start --web` | Web bundle |
| `npm run lint` | `eslint . --ext .ts,.tsx` | Lint TypeScript files |
| `npm run typecheck` | `tsc --noEmit` | Type check |
| `npm run test` | `jest` | Unit tests |
| `npm run e2e` | `playwright test` | End-to-end tests |
| `npm run check` | lint + typecheck + test | Full quality gate |

## Testing Patterns
- Unit tests live next to their source files as `*.test.ts` or `*.test.tsx`
- `test/setup.ts` provides mocks for: AsyncStorage, expo-router, FlashList, Firebase
- Use `jest-expo` preset — no need to configure transforms manually
- For e2e tests, add files to `e2e/` and run `npm run e2e`

## ESLint
- Uses `eslint-config-expo` flat config (`eslint.config.js`)
- Configured for TypeScript + React Native + Expo

## Prettier
- Single quotes, no semicolons, 2-space indent, trailing commas in ES5 positions
- Run `prettier --write .` to format all files

## Husky + lint-staged
- Pre-commit hook runs lint-staged on staged `*.{ts,tsx}` files
- Hook lives at repo root `.husky/pre-commit`
- lint-staged config is in `package.json`
