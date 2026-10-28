# 🎬 Notes Application Automation Framework

A Playwright + TypeScript UI test automation framework for the [Notes React Application](https://practice.expandtesting.com/notes/app/) on ExpandTesting's practice site. It uses the Page Object Model, centralized test data, and a GitHub Actions pipeline.

## 🎬 YouTube Playlist Automate Right With Playwright on the Eye Of A Hero channel

[![YouTube Channel](resources/images/eyeofaherobanner.jpg)](https://www.youtube.com/playlist?list=PLJ_hmx7qs4no)

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Running Tests](#running-tests)
- [Test Suites](#test-suites)
- [Utilities](#utilities)
- [Reports and Traces](#reports-and-traces)
- [CI/CD](#cicd)

## Tech Stack

- [Playwright](https://playwright.dev/) (`@playwright/test`)
- TypeScript
- Node.js (LTS)
- GitHub Actions

## Project Structure

```
.github/
  workflows/
    playwright.yml        # CI pipeline
data/
  notes-data.ts           # Test data for notes
  user-credentials.ts     # User credential data
pages/
  LoginPage.ts            # Page object: login page
  NotesPage.ts            # Page object: notes page
resources/
  images/
    eyeofaherobanner.jpg  # Static resources used by tests
tests/
  ui/
    createNoteE2E.spec.ts     # End-to-end: create a note
    logintest.spec.ts         # Login (positive) tests
    negativeLoginTest.spec.ts # Login (negative) tests
utils/
  blockPopups.ts          # Blocks ad/popup/tracking requests
.gitignore
package.json
playwright.config.ts
README.md
```

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- npm (included with Node.js)
- A test account for the Notes application

## Setup

Install dependencies and the Chromium browser:

```bash
npm ci
npx playwright install chromium
```

## Environment Variables

Credentials are read from environment variables and are never committed to the repository.

| Variable   | Description                         |
| ---------- | ----------------------------------- |
| `EMAIL`    | Email of the test account           |
| `PASSWORD` | Password of the test account        |

### Local

Create a `.env` file in the project root (make sure it is listed in `.gitignore`):

```
EMAIL=your-test-email@example.com
PASSWORD=your-test-password
```

### CI

Add `EMAIL` and `PASSWORD` as repository secrets in GitHub under **Settings > Secrets and variables > Actions**. The workflow passes them to the test run as environment variables.

## Running Tests

Run the full test suite:

```bash
npx playwright test
```

Run the note end-to-end test only:

```bash
npx playwright test tests/ui/createNoteE2E.spec.ts
```

Other useful options:

```bash
# Run a single file
npx playwright test tests/ui/logintest.spec.ts

# Run in headed mode
npx playwright test --headed

# Run in UI mode
npx playwright test --ui

# Debug a test
npx playwright test --debug
```

## Test Suites

| File                        | Description                          |
| --------------------------- | ------------------------------------ |
| `logintest.spec.ts`         | Verifies successful login            |
| `negativeLoginTest.spec.ts` | Verifies login failures and messages |
| `createNoteE2E.spec.ts`     | End-to-end flow for creating a note  |

## Utilities

### blockPopups

`utils/blockPopups.ts` aborts requests to ad networks, consent popups, and tracking domains so overlays do not cover page elements (especially in CI). Call it before navigating:

```ts
import { blockPopups } from '../../utils/blockPopups';

test.beforeEach(async ({ page }) => {
  await blockPopups(page);
  await page.goto('https://practice.expandtesting.com/notes/app/login');
});
```

To block additional domains, add a pattern to `BLOCKED_URL_PATTERNS` in the file.

## Reports and Traces

After a run, open the HTML report:

```bash
npx playwright show-report
```

To view a report downloaded from a CI run, extract the artifact zip first, then run:

```bash
npx playwright show-report "path/to/extracted/playwright-report"
```

Traces are only available if `trace` is enabled in `playwright.config.ts` (for example, `trace: 'on-first-retry'`). Opening the report's `index.html` directly from the file system or from inside a zip will not work. Use `show-report` or drop a `trace.zip` onto [trace.playwright.dev](https://trace.playwright.dev).

## CI/CD

The workflow in `.github/workflows/playwright.yml` runs on pushes to `main` and `feature/*` branches, and on pull requests to `main`. It:

1. Checks out the repository
2. Sets up Node.js (LTS)
3. Installs dependencies with `npm ci`
4. Installs Playwright browsers
5. Runs the tests with `EMAIL` and `PASSWORD` provided from GitHub secrets
6. Uploads the `playwright-report/` folder as an artifact (retained for 30 days)

To view results, open the workflow run in the **Actions** tab and download the `playwright-report` artifact.