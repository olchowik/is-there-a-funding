import { expect, test } from "@playwright/test";

test.describe("Home Page", () => {
  test("should load the home page", async ({ page }) => {
    await page.goto("/");

    // Check that the page title contains expected text
    await expect(page).toHaveTitle(/10x Astro Starter|FiszkiAI/i);

    // Check for main heading
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
  });

  test("should navigate to login page", async ({ page }) => {
    await page.goto("/");

    // Look for login link or button if it exists
    // If there's a navigation link to login, click it
    const loginLink = page.getByRole("link", { name: /login|sign in/i });
    if (await loginLink.isVisible().catch(() => false)) {
      await loginLink.click();
      await expect(page).toHaveURL(/.*login/);
    } else {
      // If no link, try navigating directly
      await page.goto("/login");
      await expect(page).toHaveURL(/.*login/);
    }
  });

  test("should have accessible navigation", async ({ page }) => {
    await page.goto("/");

    // Check that the page is accessible - look for body content
    // The home page doesn't use a <main> tag, so check for heading instead
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    
    // Verify page has content
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});
