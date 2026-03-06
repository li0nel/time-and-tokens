/**
 * e2e/auth.spec.ts
 *
 * End-to-end tests for authentication screens.
 *
 * Requirements:
 *   - Expo web server running: npm run web (or npx expo start --web)
 *   - baseURL: http://localhost:8081 (configured in playwright.config.ts)
 *
 * These tests do NOT require Firebase credentials — they verify the UI
 * layer only (routing to sign-in, error rendering for invalid input).
 */

import { test, expect } from '@playwright/test'

test.describe('Auth screen', () => {
  test('sign-in screen is visible on initial load', async ({ page }) => {
    await page.goto('/')

    // Unauthenticated users should be redirected to the sign-in screen.
    // The email input has testID="email-input" which Expo Web renders as
    // an HTML input with data-testid="email-input".
    await expect(
      page.locator('[data-testid="email-input"], [testid="email-input"]'),
    ).toBeVisible({ timeout: 10000 })
  })

  test('shows validation error when submitting empty credentials', async ({
    page,
  }) => {
    await page.goto('/')

    // Wait for the sign-in form to be ready.
    const signInButton = page.locator(
      '[data-testid="sign-in-button"], [testid="sign-in-button"]',
    )
    await expect(signInButton).toBeVisible({ timeout: 10000 })

    // Submit without entering credentials.
    await signInButton.click()

    // The screen shows an error when email/password are empty.
    const errorText = page.getByText('Please enter your email and password.')
    await expect(errorText).toBeVisible({ timeout: 5000 })
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/')

    // Fill in credentials that are syntactically valid but not registered.
    const emailInput = page.locator(
      '[data-testid="email-input"], [testid="email-input"]',
    )
    const passwordInput = page.locator(
      '[data-testid="password-input"], [testid="password-input"]',
    )
    await expect(emailInput).toBeVisible({ timeout: 10000 })

    await emailInput.fill('invalid@example.com')
    await passwordInput.fill('wrongpassword')

    const signInButton = page.locator(
      '[data-testid="sign-in-button"], [testid="sign-in-button"]',
    )
    await signInButton.click()

    // Firebase will reject the credentials and the error banner should appear.
    // This test requires network access to Firebase — it may fail without
    // proper Firebase project configuration.
    const errorBanner = page.locator('.bg-red-50, [class*="bg-red"]')
    await expect(errorBanner).toBeVisible({ timeout: 15000 })
  })
})
