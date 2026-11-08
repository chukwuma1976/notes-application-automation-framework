import test, { expect } from "@playwright/test";
import { API_BASE_URL } from "../../../config/configurations";
import { generateUserRegistrationData, userCredentials } from "../../../data/user-credentials";
import { loginAndRetrieveToken } from "../../../utils/apiHelpers";

test.describe("User Registration API Tests", () => {

    const baseUrl = API_BASE_URL;

    test("Test user registration endpoint", async ({ request }) => {

        // Register user
        const { name, email, password } = generateUserRegistrationData();
        const response = await request.post(`${baseUrl}/users/register`, {
            data: {
                name,
                email,
                password
            }
        });

        const result = await response.json();
        expect(response.status()).toBe(201);
        expect(result.message).toBe("User account created successfully")

        //Login new user
        const loginToken = await loginAndRetrieveToken(request, email, password);

        // Delete registered user
        const deleteResponse = await request.delete(`${baseUrl}/users/delete-account`, {
            headers: {
                "x-auth-token": loginToken
            }
        });

        expect(deleteResponse.status()).toBe(200);

    });

    test("Test user registration with missing email will fail", async ({ request }) => {
        const response = await request.post(`${baseUrl}/users/register`, {
            data: {
                name: "registeredUser",
                email: "",
                password: "somePassword123!"
            }
        });

        const result = await response.json();
        expect(response.status()).toBe(400);
        expect(result.message).toBe("A valid email address is required")
    });

    test("Test user registration with missing password will fail", async ({ request }) => {
        const response = await request.post(`${baseUrl}/users/register`, {
            data: {
                name: "registeredUser",
                email: "test@example.com",
                password: ""
            }
        });

        const result = await response.json();
        expect(response.status()).toBe(400);
        expect(result.message).toBe("Password must be between 6 and 30 characters")
    });

    test("Test user registration with missing username and password will fail", async ({ request }) => {
        const response = await request.post(`${baseUrl}/users/register`, {
            data: {
                name: "registeredUser",
                email: "",
                password: ""
            }
        });

        expect(response.status()).toBe(400);
    });

    test("Test user registration with invalid email address will fail", async ({ request }) => {
        const response = await request.post(`${baseUrl}/users/register`, {
            data: {
                name: "registeredUser",
                email: "invalidemailaddress",
                password: "passwordForInvalidEmail"
            }
        });
        const result = await response.json();
        expect(response.status()).toBe(400);
        expect(result.message).toBe("A valid email address is required");
    });

    test("Test user registration with duplicate email address will fail", async ({ request }) => {
        const { email } = userCredentials;
        const response = await request.post(`${baseUrl}/users/register`, {
            data: {
                name: "registeredUser",
                email,
                password: "passwordForInvalidEmail"
            }
        });
        const result = await response.json();
        expect(response.status()).toBe(409);
        expect(result.message).toBe("An account already exists with the same email address");
    });

    test("Test user registration with an invalid password of over 30 characters", async ({ request }) => {
        const response = await request.post(`${baseUrl}/users/register`, {
            data: {
                name: "registeredUser",
                email: "wannabeuser@example.com",
                password: "thispasswordiswaytoolongtobeacceptedbytheapi"
            }
        });
        const result = await response.json();
        expect(response.status()).toBe(400);
        expect(result.message).toBe("Password must be between 6 and 30 characters");
    });

})
