/**
 * e2e/chat.spec.ts
 *
 * End-to-end tests for the chat screen.
 *
 * Requirements:
 *   - Expo web server running: npm run web (or npx expo start --web)
 *   - baseURL: http://localhost:8081 (configured in playwright.config.ts)
 *   - TEST_EMAIL and TEST_PASSWORD env vars for a valid Firebase test account.
 *
 * Full AI response tests require a live Firebase project with Gemini enabled.
 * Tests that interact with the AI are annotated with `test.skip` when
 * TEST_EMAIL / TEST_PASSWORD are not provided, so `npm run e2e` still passes
 * in environments without credentials.
 */

import { test, expect } from '@playwright/test'

// ---------------------------------------------------------------------------
// Helper: sign in with email/password via the UI
// ---------------------------------------------------------------------------

async function signIn(
  page: import('@playwright/test').Page,
  email: string,
  password: string,
) {
  await page.goto('/')

  const emailInput = page.locator(
    '[data-testid="email-input"], [testid="email-input"]',
  )
  await expect(emailInput).toBeVisible({ timeout: 10000 })

  await emailInput.fill(email)
  await page
    .locator('[data-testid="password-input"], [testid="password-input"]')
    .fill(password)
  await page
    .locator('[data-testid="sign-in-button"], [testid="sign-in-button"]')
    .click()

  // Wait for navigation to the chat screen (chat input appears).
  await expect(
    page.locator('[data-testid="chat-input"], [testid="chat-input"]'),
  ).toBeVisible({ timeout: 15000 })
}

// ---------------------------------------------------------------------------
// Tests that run without credentials (UI structure)
// ---------------------------------------------------------------------------

test.describe('Chat screen — unauthenticated', () => {
  test('redirects unauthenticated users to sign-in', async ({ page }) => {
    await page.goto('/')

    // Should redirect away from chat to sign-in.
    await expect(
      page.locator('[data-testid="email-input"], [testid="email-input"]'),
    ).toBeVisible({ timeout: 10000 })
  })
})

// ---------------------------------------------------------------------------
// Tests that require a Firebase test account
// ---------------------------------------------------------------------------

// eslint-disable-next-line expo/no-dynamic-env-var
const TEST_EMAIL = process.env['TEST_EMAIL']
// eslint-disable-next-line expo/no-dynamic-env-var
const TEST_PASSWORD = process.env['TEST_PASSWORD']
const hasCredentials = Boolean(TEST_EMAIL && TEST_PASSWORD)

test.describe('Chat screen — authenticated', () => {
  test.skip(!hasCredentials, 'Requires TEST_EMAIL and TEST_PASSWORD env vars')

  test('chat input is present after sign-in', async ({ page }) => {
    await signIn(page, TEST_EMAIL!, TEST_PASSWORD!)

    // The chat input text field should be visible.
    const chatInput = page.locator(
      '[data-testid="chat-input"], [testid="chat-input"]',
    )
    await expect(chatInput).toBeVisible({ timeout: 10000 })
  })

  test('sends a message and sees a response', async ({ page }) => {
    await signIn(page, TEST_EMAIL!, TEST_PASSWORD!)

    // Type a cooking question.
    const chatInput = page.locator(
      '[data-testid="chat-input"], [testid="chat-input"]',
    )
    await chatInput.fill('Suggest a quick pasta recipe')

    // Send the message.
    const sendButton = page.locator(
      '[data-testid="send-button"], [testid="send-button"]',
    )
    await sendButton.click()

    // The thinking indicator should appear briefly.
    // (It may disappear quickly — just confirm it appeared or a response showed.)

    // Wait for the AI response to appear in the chat feed.
    // The assistant message is rendered via ChatMessage/WidgetRenderer.
    // Expect at least one assistant message block to appear.
    const assistantMessage = page.locator(
      '[data-testid="assistant-message"], [testid="assistant-message"]',
    )
    await expect(assistantMessage.first()).toBeVisible({ timeout: 30000 })
  })

  test('recipe card renders with action buttons', async ({ page }) => {
    await signIn(page, TEST_EMAIL!, TEST_PASSWORD!)

    // Ask for a specific recipe card response.
    const chatInput = page.locator(
      '[data-testid="chat-input"], [testid="chat-input"]',
    )
    await chatInput.fill('Show me a recipe card for spaghetti carbonara')

    const sendButton = page.locator(
      '[data-testid="send-button"], [testid="send-button"]',
    )
    await sendButton.click()

    // Wait for a recipe card to appear.
    // RecipeCard has data-testid="recipe-card".
    const recipeCard = page.locator(
      '[data-testid="recipe-card"], [testid="recipe-card"]',
    )
    await expect(recipeCard.first()).toBeVisible({ timeout: 30000 })

    // The recipe card should have action buttons (View Ingredients, Start Cooking).
    const startCookingButton = page.getByText('Start Cooking')
    await expect(startCookingButton.first()).toBeVisible({ timeout: 5000 })
  })

  test('tapping Start Cooking sends a cook steps request', async ({ page }) => {
    await signIn(page, TEST_EMAIL!, TEST_PASSWORD!)

    // First get a recipe card.
    const chatInput = page.locator(
      '[data-testid="chat-input"], [testid="chat-input"]',
    )
    await chatInput.fill('Show me a recipe card for spaghetti carbonara')

    const sendButton = page.locator(
      '[data-testid="send-button"], [testid="send-button"]',
    )
    await sendButton.click()

    // Wait for the recipe card.
    const recipeCard = page.locator(
      '[data-testid="recipe-card"], [testid="recipe-card"]',
    )
    await expect(recipeCard.first()).toBeVisible({ timeout: 30000 })

    // Tap 'Start Cooking' which injects a chat message and triggers a
    // cook_steps response from the AI.
    const startCookingButton = page.getByText('Start Cooking')
    await startCookingButton.first().click()

    // Expect a cook steps widget to appear in the chat.
    const cookSteps = page.locator(
      '[data-testid="cook-steps"], [testid="cook-steps"]',
    )
    await expect(cookSteps.first()).toBeVisible({ timeout: 30000 })
  })
})
