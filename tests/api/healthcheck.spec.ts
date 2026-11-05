import test, { expect } from "@playwright/test";
import { API_BASE_URL } from "../../config/configurations";

test.describe("Health Check Test", () => {

    const baseUrl = API_BASE_URL;

    test("Test a healthcheck endpoint", async ({ request }) => {
        const response = await request.get(`${baseUrl}/health-check`);
        expect(response.status()).toBe(200);
    });

});