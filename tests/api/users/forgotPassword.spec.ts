import test, { expect } from "@playwright/test";
import { TESTEMAIL_API_KEY } from "../../../data/user-credentials";
import { API_BASE_URL, TESTEMAIL, TESTEMAIL_NAMESPACE } from "../../../config/configurations";
import { extractResetToken } from "../../../utils/extractResetToken";

test.describe("Forgot Password Test", () => {

    const baseUrl = API_BASE_URL;

    test("Test forgot password functionality", async ({ request }) => {

        // Health check for testmail since a free tier is being used with 100 emails per month
        let healthCheck;
        try {
            healthCheck = await request.get('https://api.testmail.app/api/json', {
                params: {
                    apikey: TESTEMAIL_API_KEY,
                    namespace: TESTEMAIL_NAMESPACE,
                    livequery: 'true',
                }
            });
        } catch (error) {
            test.skip(true, `testmail.app request failed: ${(error as Error).message}`);
            return;
        }

        test.skip(
            healthCheck.status() !== 200,
            `testmail.app returned ${healthCheck.status()} (free tier quota may be used up).`
        );

        // Sent reset token to testemail
        const postforgotPasswordResponse = await request.post(`${baseUrl}/users/forgot-password`, { data: { email: TESTEMAIL } });
        expect(postforgotPasswordResponse.status()).toBe(200);
        const postforgotPasswordResult = await postforgotPasswordResponse.json();
        expect(postforgotPasswordResult.message).toContain(TESTEMAIL);

        // Get reset token
        const resetResponse = await request.get('https://api.testmail.app/api/json', {
            params: {
                apikey: TESTEMAIL_API_KEY,
                namespace: TESTEMAIL_NAMESPACE,
                livequery: 'true',
                timestamp_from: Date.now() //Account for time lag or it will return last response
            }
        });

        const result = await resetResponse.json();
        const token = extractResetToken(result);

        // Verify token
        const verifyTokenResponse = await request.post(`${API_BASE_URL}/users/verify-reset-password-token`,
            { data: { token: token } }
        )
        expect(verifyTokenResponse.status()).toBe(200);

        // Reset forgotten password
        const timestamp = Date.now();
        const password = `newPassword${timestamp}`
        const resetForgottenResponse = await request.post(`${API_BASE_URL}/users/verify-reset-password-token`,
            { data: { token: token, newPassword: password } }
        )
        expect(resetForgottenResponse.status()).toBe(200);

    });

});
