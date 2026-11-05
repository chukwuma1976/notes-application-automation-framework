import test, { expect } from "@playwright/test"
import { userCredentials } from "../../../data/user-credentials";
import { createNote, deleteNote, loginAndRetrieveToken } from "../../../utils/apiHelpers";
import { generateNotesData } from "../../../data/notes-data";
import { API_BASE_URL } from "../../../config/configurations";

test.describe("Retrieve Notes API Tests", () => {

    let token: string;
    const { email, password } = userCredentials;
    let headers: Record<string, string>;

    test.beforeEach(async ({ request }) => {
        token = await loginAndRetrieveToken(request, email, password);
        headers = {
            'x-auth-token': token,
            'Accept': 'application/json'
        }

    });

    test("should retrieve all notes", async ({ request }) => {
        const response = await request.get(`${API_BASE_URL}/notes`, {
            headers
        });
        expect(response.status()).toBe(200);
        const result = await response.json();
        expect(Array.isArray(result.data)).toBeTruthy();

    });

    test("Retrieving all notes without a token will fail", async ({ request }) => {
        const response = await request.get(`${API_BASE_URL}/notes`);
        expect(response.status()).toBe(401)
        const result = await response.json();
        expect(result.message).toBe("No authentication token specified in x-auth-token header");

    });


    test("should retrieve a note by id", async ({ request }) => {

        // Create a note
        const newNote = await createNote(request, token, "Personal");
        const id = newNote.id;

        //Retrieve a single note
        const response = await request.get(`${API_BASE_URL}/notes/${id}`, {
            headers
        });
        expect(response.status()).toBe(200);
        const result = await response.json();
        expect(result.data.category).toBe(newNote.category);

        //Delete created note
        await deleteNote(request, token, id);

    });

    test("retrieving a note with an invalid id will fail", async ({ request }) => {
        const response = await request.get(`${API_BASE_URL}/notes/invalid-id`, {
            headers
        });
        expect(response.status()).toBe(400);
        const result = await response.json();
        expect(result.message).toBe("Note ID must be a valid ID");
    });

    test("retrieving a note with a non-existent id will fail", async ({ request }) => {

        // Create a note
        const newNote = await createNote(request, token, "Personal");
        const id = newNote.id;

        //Delete created note
        await deleteNote(request, token, id);

        //try to retrieve the deleted note with the same id
        const response = await request.get(`${API_BASE_URL}/notes/${id}`, {
            headers
        });
        expect(response.status()).toBe(404);
        const result = await response.json();
        expect(result.message).toBe("No note was found with the provided ID, Maybe it was deleted");

    });

    test("retrieving a note by id without a token will fail", async ({ request }) => {

        // Create a note
        const newNote = await createNote(request, token, "Personal");
        const id = newNote.id;

        //Retrieve a single note
        const response = await request.get(`${API_BASE_URL}/notes/${id}`);
        expect(response.status()).toBe(401)
        const result = await response.json();
        expect(result.message).toBe("No authentication token specified in x-auth-token header");

        //Delete created note
        await deleteNote(request, token, id);

    });

})

