import test, { expect } from "@playwright/test";
import { userCredentials } from "../../data/user-credentials";
import { API_BASE_URL } from "../../config/configurations";

test.describe("API Endpoints Test", () => {

    const baseUrl = API_BASE_URL;
    const { email, password } = userCredentials;

    test("Test a healthcheck endpoint", async ({ request }) => {
        const response = await request.get(`${baseUrl}/health-check`);
        expect(response.status()).toBe(200);
    });

    test("Test a login endpoint", async ({ request }) => {
        const response = await request.post(`${baseUrl}/users/login`, {
            data: { email, password }
        });

        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        const token = responseBody.data.token;
        expect(token).toBeTruthy();

    });

});