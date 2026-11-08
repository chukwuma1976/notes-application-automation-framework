import test, { expect } from "@playwright/test"
import { generateUserRegistrationData } from "../../../data/user-credentials";
import { createNote, deleteUser, loginAndRetrieveToken, registerUser } from "../../../utils/apiHelpers";
import { API_BASE_URL } from "../../../config/configurations";

test.describe("Role Based Access Control (RBAC) Tests", () => {
    //User A and User B will be created for testing RBAC scenarios
    let tokenUserA: string = "";
    let tokenUserB: string = "";
    let noteUserA: Record<string, any> = {};
    let noteUserB: Record<string, any> = {};

    test.beforeEach(async ({ request }) => {
        //1. Register multiple new users 
        const userA = generateUserRegistrationData();
        await registerUser(request, userA.name, userA.email, userA.password);
        const userB = generateUserRegistrationData();
        await registerUser(request, userB.name, userB.email, userB.password);

        //2. Login each user and get their token
        tokenUserA = await loginAndRetrieveToken(request, userA.email, userA.password);
        tokenUserB = await loginAndRetrieveToken(request, userB.email, userB.password);

        //3. Create a note for each user
        noteUserA = await createNote(request, tokenUserA, "Work");
        noteUserB = await createNote(request, tokenUserB, "Home");
    })

    test("Test retrieving notes from another user fails", async ({ request }) => {
        //4. Attempt to retrieve a note from another user using their token
        const response1 = await request.get(`${API_BASE_URL}/notes/${noteUserA.id}`, {
            headers: { "x-auth-token": tokenUserB }
        });

        const response2 = await request.get(`${API_BASE_URL}/notes/${noteUserB.id}`, {
            headers: { "x-auth-token": tokenUserA }
        });

        //5. Assert that the response status is 404 Not Found or appropriate error message
        expect(response1.status()).toBe(404); // Expecting 404 Not Found
        expect(response2.status()).toBe(404); // Expecting 404 Not Found

    })

    test("Test updating a note from another user fails", async ({ request }) => {
        //6. Attempt to update a note from another user using their token
        const response1 = await request.put(`${API_BASE_URL}/notes/${noteUserA.id}`, {
            headers: { "x-auth-token": tokenUserB },
            data: { title: "Updated Title" }
        });

        const response2 = await request.put(`${API_BASE_URL}/notes/${noteUserB.id}`, {
            headers: { "x-auth-token": tokenUserA },
            data: { title: "Updated Title" }
        });

        //7. Assert that the response status is 403 Forbidden or appropriate error message
        expect(response1.status()).toBe(400); // Expecting 403 Forbidden
        expect(response2.status()).toBe(400); // Expecting 403 Forbidden

    })

    test("Test deleting a note from another user fails", async ({ request }) => {
        //8. Attempt to delete a note from another user using their token
        const deleteNoteResponse1 = await request.delete(`${API_BASE_URL}/notes/${noteUserA.id}`, {
            headers: { "x-auth-token": tokenUserB }
        });

        const deleteNoteResponse2 = await request.delete(`${API_BASE_URL}/notes/${noteUserB.id}`, {
            headers: { "x-auth-token": tokenUserA }
        });

        //9. Assert that the response status is 403 Forbidden or appropriate error message
        expect(deleteNoteResponse1.status()).toBe(404); // Expecting 403 Forbidden or appropriate error message
        expect(deleteNoteResponse2.status()).toBe(404); // Expecting 403 Forbidden or appropriate error message

    })

    test.afterEach(async ({ request }) => {
        //10. Clean up by deleting the created users and their notes
        await deleteUser(request, tokenUserA);
        await deleteUser(request, tokenUserB);
    })

})