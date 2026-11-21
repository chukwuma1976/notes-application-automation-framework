import test, { expect } from "@playwright/test";
import { generateUserRegistrationData, invalidCredentialCombinations, missingCredentialCombinations, passwordLengthCombinations, userCredentials } from "../../../data/user-credentials";
import { API_BASE_URL } from "../../../config/configurations";
import { deleteUser, loginAndRetrieveToken, registerUser } from "../../../utils/apiHelpers";

test.describe("Change Password Test", () => {

    let user: Record<string, string>;
    let token: string;

    test.beforeEach(async ({ request }) => {
        user = generateUserRegistrationData();
        await registerUser(request, user.name, user.email, user.password);
        token = await loginAndRetrieveToken(request, user.email, user.password);
    })

    test("Test change password", async ({ request }) => {
        const updatedPassword = "brandNewPassword"
        const response = await request.post(`${API_BASE_URL}/users/change-password`,
            {
                headers: { "x-auth-token": token },
                data: { currentPassword: user.password, newPassword: updatedPassword }
            }
        );
        expect(response.status()).toBe(200);

        //sign in with new password
        token = await loginAndRetrieveToken(request, user.email, updatedPassword);
    });

    /**
    Boundary Value Testing (or Boundary Value Analysis, BVA) is a black-box software testing technique that focuses on 
    testing the edges (minimum and maximum limits) of valid and invalid input ranges rather than values in the middle. 
    Because developers frequently make off-by-one errors (such as using < instead of <=), defects cluster disproportionately 
    at these exact boundaries.
     */

    //Edge of valid inputs: Passwords must be between 6 and 30 letters
    test("Test 6 letter password", async ({ request }) => {
        const updatedPassword = "newPas"
        expect(updatedPassword.length).toBe(6);
        const response = await request.post(`${API_BASE_URL}/users/change-password`,
            {
                headers: { "x-auth-token": token },
                data: { currentPassword: user.password, newPassword: updatedPassword }
            }
        );
        expect(response.status()).toBe(200);

        //sign in with new password
        token = await loginAndRetrieveToken(request, user.email, updatedPassword);
    });

    test("Test 30 letter password", async ({ request }) => {
        const updatedPassword = "updatePasswordupdatePassword12"
        expect(updatedPassword.length).toBe(30);
        const response = await request.post(`${API_BASE_URL}/users/change-password`,
            {
                headers: { "x-auth-token": token },
                data: { currentPassword: user.password, newPassword: updatedPassword }
            }
        );

        expect(response.status()).toBe(200);

        //sign in with new password
        token = await loginAndRetrieveToken(request, user.email, updatedPassword);
    });

    //Edge of invalid inputs: Passwords must be between 6 and 30 letters
    test("Test 5 letter password", async ({ request }) => {
        const updatedPassword = "five5"
        expect(updatedPassword.length).toBe(5);
        const response = await request.post(`${API_BASE_URL}/users/change-password`,
            {
                headers: { "x-auth-token": token },
                data: { currentPassword: user.password, newPassword: updatedPassword }
            }
        );

        expect(response.status()).toBe(400);
    });

    test("Test 31 letter password", async ({ request }) => {
        const updatedPassword = "updatePasswordupdatePassword123"
        expect(updatedPassword.length).toBe(31);
        const response = await request.post(`${API_BASE_URL}/users/change-password`,
            {
                headers: { "x-auth-token": token },
                data: { currentPassword: user.password, newPassword: updatedPassword }
            }
        );

        expect(response.status()).toBe(400);
    });

    test.afterEach(async ({ request }) => {
        await deleteUser(request, token);
    })

});
