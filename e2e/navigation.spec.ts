import { expect, test } from "@playwright/test";

test.describe("Navigation", () => {
  test("should navigate between pages", async ({ page }) => {
    // Start at home
    await page.goto("/");
    await expect(page).toHaveURL("/");

    // Navigate to login
    await page.goto("/login");
    await expect(page).toHaveURL(/.*login/);

    // Navigate back to home
    await page.goto("/");
    await expect(page).toHaveURL("/");
  });

  test("should handle browser back/forward navigation", async ({ page }) => {
    await page.goto("/");
    await page.goto("/login");
    
    // Go back
    await page.goBack();
    await expect(page).toHaveURL("/");

    // Go forward
    await page.goForward();
    await expect(page).toHaveURL(/.*login/);
  });

  test("should maintain page state on navigation", async ({ page }) => {
    await page.goto("/login");

    // Fill in email
    const emailInput = page.getByLabel(/email/i);
    await emailInput.fill("test@example.com");

    // Navigate away and back
    await page.goto("/");
    await page.goto("/login");

    // Form should be reset (browser default behavior)
    const newEmailInput = page.getByLabel(/email/i);
    await expect(newEmailInput).toHaveValue("");
  });
});
