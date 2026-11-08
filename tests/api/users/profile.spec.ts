import test, { expect } from "@playwright/test";
import { API_BASE_URL } from "../../../config/configurations";
import { generateUserRegistrationData } from "../../../data/user-credentials";
import { createNote, deleteUser, loginAndRetrieveToken, registerUser, retrieveNotes } from "../../../utils/apiHelpers";

test.describe("User Profile API Tests", () => {

    const baseUrl = API_BASE_URL;
    const { name, email, password } = generateUserRegistrationData();
    let loginToken: string;
    let headers: Record<string, string>;
    const updatePayload = {
        "name": "Updated Test User",
        "phone": "5551234567",
        "company": "Example Company"
    };

    test.beforeAll(async ({ request }) => {
        // Register user
        await registerUser(request, name, email, password)
        //Login user and get token
        loginToken = await loginAndRetrieveToken(request, email, password);
        headers = { "x-auth-token": loginToken };
    })

    test("Test get user profile endpoint", async ({ request }) => {

        //Get user profile
        const response = await request.get(`${baseUrl}/users/profile`, { headers });
        const userProfile = await response.json();

        expect(response.status()).toBe(200);
        expect(userProfile.data.id).toBeTruthy();
        expect(userProfile.data.name).toBe(name);
        expect(userProfile.data.email).toBe(email);

    });

    test("Test get user profile endpoint with missing token", async ({ request }) => {
        const response = await request.get(`${baseUrl}/users/profile`);
        const result = await response.json();
        expect(response.status()).toBe(401);
        expect(result.message).toBe("No authentication token specified in x-auth-token header");
    });

    test("Test get user profile endpoint with invalid token", async ({ request }) => {
        const response = await request.get(`${baseUrl}/users/profile`, {
            headers: {
                "x-auth-token": "invalidLoginToken"
            }
        })
        const result = await response.json();
        expect(response.status()).toBe(401);
        expect(result.message).toBe("Access token is not valid or has expired, you will need to login");
    });

    test("Test update user profile endpoint", async ({ request }) => {
        const response = await request.patch(`${baseUrl}/users/profile`, {
            headers,
            data: updatePayload
        })
        const userProfile = await response.json();

        expect(response.status()).toBe(200);
        expect(userProfile.data.name).toBe(updatePayload.name);
        expect(userProfile.data.phone).toBe(updatePayload.phone);
        expect(userProfile.data.company).toBe(updatePayload.company);
    });

    test("Test update user profile endpoint with missing token", async ({ request }) => {
        const response = await request.patch(`${baseUrl}/users/profile`, {
            data: updatePayload
        })
        const result = await response.json();

        expect(response.status()).toBe(401);
        expect(result.message).toBe("No authentication token specified in x-auth-token header");
    });

    test("Test update user profile endpoint with invalid token", async ({ request }) => {
        const response = await request.patch(`${baseUrl}/users/profile`, {
            headers: { "x-auth-token": "invalidToken" },
            data: updatePayload
        })
        const result = await response.json();

        expect(response.status()).toBe(401);
        expect(result.message).toBe("Access token is not valid or has expired, you will need to login");
    });

    test("Test update user profile endpoint with missing required name fails", async ({ request }) => {
        const response = await request.patch(`${baseUrl}/users/profile`, {
            headers,
            data: {
                "phone": "5551234567",
                "company": "Example Company"
            }
        })
        const result = await response.json();

        expect(response.status()).toBe(400);
        expect(result.message).toBe("User name must be between 4 and 30 characters");
    });

    test("Test update user profile endpoint with invalid name fails", async ({ request }) => {
        const response = await request.patch(`${baseUrl}/users/profile`, {
            headers,
            data: {
                "name": "thisusernameiswaytoolongtobeacceptedbytheapi",
                "phone": "5551234567",
                "company": "Example Company"
            }
        })
        const result = await response.json();

        expect(response.status()).toBe(400);
        expect(result.message).toBe("User name must be between 4 and 30 characters");
    });

    test.afterAll(async ({ request }) => {
        // Delete registered user
        await deleteUser(request, loginToken);
    })

})

test.describe("User Profile API Delete Tests - Unauthorized Access", () => {

    const baseUrl = API_BASE_URL;
    const { name, email, password } = generateUserRegistrationData();
    let loginToken: string;
    let headers: Record<string, string>;

    test.beforeAll(async ({ request }) => {
        // Register user
        await registerUser(request, name, email, password)
        //Login user and get token
        loginToken = await loginAndRetrieveToken(request, email, password);
        headers = { "x-auth-token": loginToken };
    })

    test("Delete user profile endpoint with missing token", async ({ request }) => {
        const response = await request.delete(`${baseUrl}/users/delete-account`);
        const result = await response.json();

        expect(response.status()).toBe(401);
        expect(result.message).toBe("No authentication token specified in x-auth-token header");
    });

    test("Delete user profile endpoint with invalid token", async ({ request }) => {
        const response = await request.delete(`${baseUrl}/users/delete-account`, {
            headers: { "x-auth-token": "invalidLoginToken" }
        });
        const result = await response.json();

        expect(response.status()).toBe(401);
        expect(result.message).toBe("Access token is not valid or has expired, you will need to login");
    });

    test.afterAll(async ({ request }) => {
        // Delete registered user
        await deleteUser(request, loginToken);
    })

})


test.describe("User Profile API Delete Tests", () => {

    const baseUrl = API_BASE_URL;
    const { name, email, password } = generateUserRegistrationData();

    test("Deleting user profile and login after deletion will fail", async ({ request }) => {
        // Register user
        await registerUser(request, name, email, password)
        //Login user and get token
        const loginToken = await loginAndRetrieveToken(request, email, password);

        // Delete registered user
        await deleteUser(request, loginToken);

        // Login again after user credentials are deleted will fail
        const loginResponse = await request.post(`${baseUrl}/users/login`, {
            data: { email, password }
        });
        expect(loginResponse.status()).toBe(401);

        // Delete registered user again after deletion will fail
        const response = await request.delete(`${baseUrl}/users/delete-account`, { headers: { "x-auth-token": loginToken } });
        expect(response.status()).toBe(401);
    });

    test("Deleting user profile after creating note makes notes inaccessible", async ({ request }) => {
        // Register user
        await registerUser(request, name, email, password)
        //Login user and get token
        const loginToken = await loginAndRetrieveToken(request, email, password);

        //Create notes
        await createNote(request, loginToken, "Home");
        await createNote(request, loginToken, "Personal");
        await createNote(request, loginToken, "Work");

        //Retrieve notes and confirm presence
        const notes = await retrieveNotes(request, loginToken);
        expect(Array.isArray(notes)).toBeTruthy();

        // Delete registered user
        await deleteUser(request, loginToken);

        // Attempt to retrieve notes
        const response = await request.get(`${API_BASE_URL}/notes`, {
            headers: { "x-auth-token": loginToken }
        });
        expect(response.status()).toBe(401);

    });

})

/*
Confirm whether account deletion also deletes associated notes.
1) Create a user account and log in to obtain an authentication token.
2) Create a note associated with the user account.
3) Delete the user account using the authentication token.
4) Attempt to retrieve the previously created note using the same authentication token.
5) Assert that the response indicates that the note no longer exists or that access is denied due to account deletion.
*/