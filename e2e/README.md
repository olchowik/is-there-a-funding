# E2E Tests with Playwright

This directory contains end-to-end tests for the FiszkiAI application using Playwright.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests in UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Run tests in debug mode
```bash
npm run test:e2e:debug
```

### View test report
```bash
npm run test:e2e:report
```

## Test Structure

- `home.spec.ts` - Tests for the home page
- `auth.spec.ts` - Tests for authentication (login/signup)
- `flashcards.spec.ts` - Tests for the flashcards page
- `navigation.spec.ts` - Tests for navigation between pages
- `helpers.ts` - Helper functions for tests

## Configuration

Tests are configured in `playwright.config.ts`. The default configuration:
- Runs tests against Chromium, Firefox, WebKit, and mobile viewports
- Uses `http://localhost:4321` as the base URL
- Automatically starts the dev server before tests
- Generates HTML reports and screenshots on failure

## Environment Variables

You can override the base URL using:
```bash
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000 npm run test:e2e
```

## Writing Tests

Example test:
```typescript
import { test, expect } from '@playwright/test';

test('should load home page', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/FiszkiAI/);
});
```

## Notes

- Tests require the application to be running (automatically started by Playwright)
- Some tests may require authentication - use the helpers in `helpers.ts`
- API endpoints should be available for full E2E testing
- For CI/CD, set `CI=true` environment variable for optimized test runs
