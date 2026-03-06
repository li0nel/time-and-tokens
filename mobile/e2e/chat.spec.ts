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
 * Gemini API calls are mocked via page.route() to avoid consuming real quota
 * and to make tests deterministic. Auth calls (signInWithPassword) are real.
 */

import { test, expect, type Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Mock Gemini responses
// ---------------------------------------------------------------------------

const GEMINI_URL_PATTERN = '**/models/**:generateContent'

const MOCK_TEXT_RESPONSE = JSON.stringify({
  candidates: [
    {
      content: {
        role: 'model',
        parts: [
          {
            text: '{ "blocks": [{ "type": "text", "content": "Here is a great pasta dish for you!" }, { "type": "quick_replies", "replies": ["Show recipe card", "Give me ingredients"] }] }',
          },
        ],
      },
      finishReason: 'STOP',
    },
  ],
})

const MOCK_RECIPE_CARD_RESPONSE = JSON.stringify({
  candidates: [
    {
      content: {
        role: 'model',
        parts: [
          {
            text: '{ "blocks": [{ "type": "recipe_card", "recipeId": "recipe-004", "title": "Pasta Carbonara", "description": "A classic Roman pasta dish with eggs, Pecorino Romano, pancetta, and black pepper.", "cookTime": "20min", "servings": 2, "difficulty": "medium", "cuisine": "Italian" }, { "type": "quick_replies", "replies": ["Start cooking", "View ingredients"] }] }',
          },
        ],
      },
      finishReason: 'STOP',
    },
  ],
})

const MOCK_COOK_STEPS_RESPONSE = JSON.stringify({
  candidates: [
    {
      content: {
        role: 'model',
        parts: [
          {
            text: '{ "blocks": [{ "type": "cook_steps", "recipeTitle": "Pasta Carbonara", "steps": [{ "stepNumber": 1, "instruction": "Cook spaghetti in salted boiling water until al dente." }, { "stepNumber": 2, "instruction": "Whisk eggs and cheese together. Season with black pepper." }, { "stepNumber": 3, "instruction": "Fry pancetta until crisp." }, { "stepNumber": 4, "instruction": "Combine pasta with pancetta fat, then stir in egg mixture off heat." }] }] }',
          },
        ],
      },
      finishReason: 'STOP',
    },
  ],
})

/** Set up Gemini API mock. The handler picks the response based on the request body. */
async function mockGemini(page: Page) {
  await page.route(GEMINI_URL_PATTERN, async (route) => {
    const requestBody = route.request().postData() ?? ''
    let responseBody = MOCK_TEXT_RESPONSE

    // Check "Start cooking" first — it takes priority even when conversation
    // history contains earlier keywords like "carbonara" or "spaghetti".
    if (requestBody.includes('Start cooking')) {
      responseBody = MOCK_COOK_STEPS_RESPONSE
    } else if (
      requestBody.includes('recipe card') ||
      requestBody.includes('carbonara') ||
      requestBody.includes('spaghetti')
    ) {
      responseBody = MOCK_RECIPE_CARD_RESPONSE
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: responseBody,
    })
  })
}

// ---------------------------------------------------------------------------
// Helper: sign in with email/password via the UI
// ---------------------------------------------------------------------------

async function signIn(page: Page, email: string, password: string) {
  await page.goto('/')

  const emailInput = page.locator(
    '[data-testid="email-input"], [testid="email-input"]'
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
    page.locator('[data-testid="chat-input"], [testid="chat-input"]')
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
      page.locator('[data-testid="email-input"], [testid="email-input"]')
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
    await mockGemini(page)
    await signIn(page, TEST_EMAIL!, TEST_PASSWORD!)

    // The chat input text field should be visible.
    const chatInput = page.locator(
      '[data-testid="chat-input"], [testid="chat-input"]'
    )
    await expect(chatInput).toBeVisible({ timeout: 10000 })
  })

  test('sends a message and sees a response', async ({ page }) => {
    await mockGemini(page)
    await signIn(page, TEST_EMAIL!, TEST_PASSWORD!)

    // Type a cooking question.
    const chatInput = page.locator(
      '[data-testid="chat-input"], [testid="chat-input"]'
    )
    await chatInput.fill('Suggest a quick pasta recipe')

    // Send the message.
    const sendButton = page.locator(
      '[data-testid="send-button"], [testid="send-button"]'
    )
    await sendButton.click()

    // Wait for the AI response to appear in the chat feed.
    const assistantMessage = page.locator(
      '[data-testid="assistant-message"], [testid="assistant-message"]'
    )
    await expect(assistantMessage.first()).toBeVisible({ timeout: 15000 })
  })

  test('recipe card renders with action buttons', async ({ page }) => {
    await mockGemini(page)
    await signIn(page, TEST_EMAIL!, TEST_PASSWORD!)

    // Ask for a specific recipe card response.
    const chatInput = page.locator(
      '[data-testid="chat-input"], [testid="chat-input"]'
    )
    await chatInput.fill('Show me a recipe card for spaghetti carbonara')

    const sendButton = page.locator(
      '[data-testid="send-button"], [testid="send-button"]'
    )
    await sendButton.click()

    // Wait for a recipe card to appear.
    const recipeCard = page.locator(
      '[data-testid="recipe-card"], [testid="recipe-card"]'
    )
    await expect(recipeCard.first()).toBeVisible({ timeout: 15000 })

    // The recipe card should have action buttons.
    const startCookingButton = page.getByText('Start Cooking')
    await expect(startCookingButton.first()).toBeVisible({ timeout: 5000 })
  })

  test('AI response contains no error blocks', async ({ page }) => {
    await mockGemini(page)
    await signIn(page, TEST_EMAIL!, TEST_PASSWORD!)

    // Send a generic message.
    const chatInput = page.locator(
      '[data-testid="chat-input"], [testid="chat-input"]'
    )
    await chatInput.fill('Hello')

    const sendButton = page.locator(
      '[data-testid="send-button"], [testid="send-button"]'
    )
    await sendButton.click()

    // Wait for the AI response to appear.
    const assistantMessage = page.locator(
      '[data-testid="assistant-message"], [testid="assistant-message"]'
    )
    await expect(assistantMessage.first()).toBeVisible({ timeout: 15000 })

    // Assert that no error block text is visible in the page.
    await expect(page.getByText(/encountered an error/i)).not.toBeVisible()
    await expect(page.getByText(/^Sorry/i)).not.toBeVisible()
  })

  test('tapping Start Cooking sends a cook steps request', async ({ page }) => {
    await mockGemini(page)
    await signIn(page, TEST_EMAIL!, TEST_PASSWORD!)

    // First get a recipe card.
    const chatInput = page.locator(
      '[data-testid="chat-input"], [testid="chat-input"]'
    )
    await chatInput.fill('Show me a recipe card for spaghetti carbonara')

    const sendButton = page.locator(
      '[data-testid="send-button"], [testid="send-button"]'
    )
    await sendButton.click()

    // Wait for the recipe card.
    const recipeCard = page.locator(
      '[data-testid="recipe-card"], [testid="recipe-card"]'
    )
    await expect(recipeCard.first()).toBeVisible({ timeout: 15000 })

    // Tap 'Start Cooking' which injects a chat message and triggers a
    // cook_steps response from the AI.
    const startCookingButton = page.getByText('Start Cooking')
    await startCookingButton.first().click()

    // Expect a cook steps widget to appear in the chat.
    const cookSteps = page.locator(
      '[data-testid="cook-steps"], [testid="cook-steps"]'
    )
    await expect(cookSteps.first()).toBeVisible({ timeout: 15000 })
  })
})
