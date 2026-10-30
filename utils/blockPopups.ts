import { Page } from '@playwright/test';

/**
 * Domains/paths that serve ads, consent/anti-adblock popups, or tracking.
 * Matched against the full request URL.
 *
 * Do NOT add practice.expandtesting.com here: that's the app under test
 * (its API, socket.io and static assets must keep working).
 */
export const BLOCKED_URL_PATTERNS: RegExp[] = [
    // Google ads and the consent / "ad blocker detected" popup
    /fundingchoicesmessages\.google\.com/,
    /googlesyndication\.com/,
    /doubleclick\.net/,
    /adtrafficquality\.google/,
    /gstatic\.com\/mysidia/,
    /encrypted-tbn\d*\.gstatic\.com\/shopping/,

    // Third-party ad networks and cookie-sync pixels seen in the logs
    /admaster\.cc/,
    /adnxs\.com/,
    /casalemedia\.com/,
    /taboola\.com/,
    /amazon-adsystem\.com/,
    /outbrain\.com/,

    // Analytics (not popups, but noise and extra load in CI)
    /googletagmanager\.com/,
    /analytics\.google\.com/,
];

/**
 * Call at the start of a test (or in a beforeEach), BEFORE page.goto().
 * Aborts any request whose URL matches BLOCKED_URL_PATTERNS.
 */
export async function blockPopups(
    page: Page,
    patterns: RegExp[] = BLOCKED_URL_PATTERNS
): Promise<void> {
    for (const pattern of patterns) {
        await page.route(pattern, (route) => route.abort());
    }
}