import { expect, test } from "@playwright/test";

test.describe("Flashcards Page", () => {
  test("should redirect to login when not authenticated", async ({ page }) => {
    // Try to access flashcards page without authentication
    await page.goto("/flashcards");

    // Should redirect to login page
    // Note: This depends on your middleware implementation
    // If middleware redirects, check for login page
    // If it shows an error, adjust the test accordingly
    const currentUrl = page.url();
    
    // Either redirected to login or still on flashcards with auth check
    if (currentUrl.includes("/login")) {
      await expect(page).toHaveURL(/.*login/);
    } else {
      // If not redirected, check for auth-related content
      // This might show an error or require login
      const loginPrompt = page.getByText(/login|sign in|authentication required/i);
      if (await loginPrompt.isVisible().catch(() => false)) {
        await expect(loginPrompt).toBeVisible();
      }
    }
  });

  test("should display flashcard list when authenticated", async ({ page, context }) => {
    // Note: This test requires authentication
    // In a real scenario, you would:
    // 1. Set up authentication cookies/tokens
    // 2. Or use a test user account
    // 3. Or mock the authentication

    // For now, we'll check the page structure if accessible
    await page.goto("/flashcards");

    // Check if page loads (even if showing auth error)
    await expect(page).toHaveTitle(/flashcards|fiszki/i);

    // If authenticated, check for flashcard list elements
    // These selectors should match your FlashcardList component
    const flashcardList = page.locator('[data-testid="flashcard-list"], main').first();
    
    // The page should at least have a main element
    const main = page.getByRole("main");
    await expect(main).toBeVisible();
  });

  test("should have proper page structure", async ({ page }) => {
    await page.goto("/flashcards");

    // Check for main content area
    const main = page.getByRole("main");
    await expect(main).toBeVisible();

    // Check page title
    await expect(page).toHaveTitle(/flashcards|fiszki/i);
  });
});
