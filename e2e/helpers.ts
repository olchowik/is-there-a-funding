import { Page } from "@playwright/test";

/**
 * Helper functions for E2E tests
 */

/**
 * Wait for the page to be fully loaded and ready
 */
export async function waitForPageReady(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.waitForLoadState("domcontentloaded");
}

/**
 * Create a test user email
 */
export function generateTestEmail(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `test-${timestamp}-${random}@example.com`;
}

/**
 * Wait for API response (useful for testing async operations)
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeout = 5000
): Promise<void> {
  await page.waitForResponse(
    (response) => {
      const url = response.url();
      if (typeof urlPattern === "string") {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    },
    { timeout }
  );
}

/**
 * Check if user is authenticated (by checking for auth cookies or tokens)
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const cookies = await page.context().cookies();
  return cookies.some(
    (cookie) =>
      cookie.name.includes("sb-") || cookie.name.includes("auth") || cookie.name.includes("session")
  );
}

/**
 * Login helper (if you have test credentials)
 * Note: Adjust this based on your authentication flow
 */
export async function loginAsTestUser(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  
  // Wait for redirect or success
  await page.waitForURL(/.*flashcards|.*\/$/, { timeout: 10000 });
}
