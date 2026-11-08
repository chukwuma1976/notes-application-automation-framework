import test, { expect } from "@playwright/test";
import { invalidCredentialCombinations, missingCredentialCombinations, passwordLengthCombinations, userCredentials } from "../../../data/user-credentials";
import { API_BASE_URL } from "../../../config/configurations";
import { loginAndRetrieveToken } from "../../../utils/apiHelpers";

test.describe("API Login Test", () => {

    const baseUrl = API_BASE_URL;
    const { email, password } = userCredentials;

    test("Test a login endpoint", async ({ request }) => {
        const response = await request.post(`${baseUrl}/users/login`, {
            data: { email, password }
        });

        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        const token = responseBody.data.token;
        expect(token).toBeTruthy();

    });

    for (const combination of invalidCredentialCombinations) {
        test(`Test login scenario ${combination.scenario}`, async ({ request }) => {
            const response = await request.post(`${baseUrl}/users/login`, {
                data: combination
            });

            const result = await response.json();
            expect(response.status()).toBe(401);
            expect(result.message).toBe("Incorrect email address or password");
        });
    }

    for (const combination of missingCredentialCombinations) {
        test(`Test login scenario ${combination.scenario}`, async ({ request }) => {
            const response = await request.post(`${baseUrl}/users/login`, {
                data: combination
            });

            expect(response.status()).toBe(400);
        });
    }

    for (const combination of passwordLengthCombinations) {
        test(`Test login scenario ${combination.scenario}`, async ({ request }) => {
            const response = await request.post(`${baseUrl}/users/login`, {
                data: combination
            });

            expect(response.status()).toBe(400);
            const result = await response.json();
            expect(result.message).toBe("Password must be between 6 and 30 characters");
        });
    }

    test('logout invalidates token', async ({ request }) => {
        const token = await loginAndRetrieveToken(request, email, password);

        const response = await request.delete(`${baseUrl}/users/logout`, { headers: { "x-auth-token": token } });
        const result = await response.json();

        expect(response.status()).toBe(200);
        expect(result.message).toBe("User has been successfully logged out");

        const invalidTokenResponse = await request.get(`${API_BASE_URL}/notes`, {
            headers: { "x-auth-token": token }
        });

        const invalidTokenResult = await response.json();
        expect(invalidTokenResponse.status()).toBe(401);
        expect(invalidTokenResult.message).toBe("User has been successfully logged out");

    });

});
