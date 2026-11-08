import test, { expect } from "@playwright/test";
import { userCredentials } from "../../../data/user-credentials";
import { loginAndRetrieveToken } from "../../../utils/apiHelpers";
import { generateNotesData } from "../../../data/notes-data";
import { API_BASE_URL } from "../../../config/configurations";

test.describe("Create Note", () => {

    let token: string;
    const { email, password } = userCredentials;
    let headers: Record<string, string>;

    test.beforeEach(async ({ request }) => {
        token = await loginAndRetrieveToken(request, email, password);
        headers = {
            'x-auth-token': token,
            'Accept': 'application/json'
        };
    });

    test("should create a new note", async ({ request }) => {

        // Create a note
        const createNotePayload = generateNotesData("Personal");
        const response = await request.post(`${API_BASE_URL}/notes`, {
            headers,
            data: createNotePayload
        });

        expect(response.status()).toBe(200);
        const createdNote = await response.json();
        const newNote = createdNote.data;

        expect(newNote.id).toBeTruthy();
        expect(newNote.title).toBe(createNotePayload.title);
        expect(newNote.description).toBe(createNotePayload.description);
        expect(newNote.category).toBe(createNotePayload.category);

        const id = newNote.id;

        //Delete created note
        const deleteNoteResponse = await request.delete(`${API_BASE_URL}/notes/${id}`, {
            headers
        });
        expect(deleteNoteResponse.status()).toBe(200);

        //Confirm note is deleted
        const cannotGetASingleNoteResponse = await request.get(`${API_BASE_URL}/notes/${id}`, {
            headers
        });
        expect(cannotGetASingleNoteResponse.status()).toBe(404);

    });

    test("creating a note with missing fields will fail", async ({ request }) => {

        // Create a note
        const createNotePayload = generateNotesData("Personal");
        const response = await request.post(`${API_BASE_URL}/notes`, {
            headers,
            data: {
                title: createNotePayload.title,
                description: createNotePayload.description
            } // Missing category
        });

        const createdNote = await response.json();
        expect(createdNote.success).toBe(false);

    });

    test("creating a note with an invalid category will fail", async ({ request }) => {

        // Create a note
        const createNotePayload = generateNotesData("Personal");
        const response = await request.post(`${API_BASE_URL}/notes`, {
            headers,
            data: {
                category: "InvalidCategory",
                title: createNotePayload.title,
                description: createNotePayload.description
            } // Invalid category
        });

        expect(response.status()).toBe(400);
        const createdNote = await response.json();
        expect(createdNote.message).toBe("Category must be one of the categories: Home, Work, Personal");

    });

    test("creating a note without a token will fail", async ({ request }) => {

        // Create a note
        const createNotePayload = generateNotesData("Personal");
        const response = await request.post(`${API_BASE_URL}/notes`, {
            data: createNotePayload
        });

        expect(response.status()).toBe(401);
        const createdNote = await response.json();
        expect(createdNote.message).toBe("No authentication token specified in x-auth-token header");

    });

})
