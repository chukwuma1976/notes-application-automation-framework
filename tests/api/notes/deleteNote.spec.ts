import test, { expect } from "@playwright/test";
import { userCredentials } from "../../../data/user-credentials";
import { loginAndRetrieveToken } from "../../../utils/apiHelpers";
import { generateNotesData } from "../../../data/notes-data";
import { API_BASE_URL } from "../../../config/configurations";

test.describe("Delete Notes Endpoints", () => {

    let token: string;
    const { email, password } = userCredentials;

    test.beforeEach(async ({ request }) => {
        token = await loginAndRetrieveToken(request, email, password);
    });

    test("should create, read, update, and delete a new note", async ({ request }) => {

        const headers = {
            'x-auth-token': token,
            'Accept': 'application/json'
        }

        // Create a note
        const createNotePayload = generateNotesData("Personal");
        const response = await request.post(`${API_BASE_URL}/notes`, {
            headers,
            data: createNotePayload
        });

        expect(response.status()).toBe(200);
        const createdNote = await response.json();
        const id = createdNote.data.id;

        //Delete created note without a token
        const noTokenResponse = await request.delete(`${API_BASE_URL}/notes/${id}`, {});
        expect(noTokenResponse.status()).toBe(401);

        //Delete created note with a token
        const deleteNoteResponse = await request.delete(`${API_BASE_URL}/notes/${id}`, {
            headers
        });
        expect(deleteNoteResponse.status()).toBe(200);

        //Confirm note is deleted
        const cannotGetASingleNoteResponse = await request.get(`${API_BASE_URL}/notes/${id}`, {
            headers
        });
        expect(cannotGetASingleNoteResponse.status()).toBe(404);

        //Attempt a second deletion/delete with a non existent note id
        const deleteNoteResponse2 = await request.delete(`${API_BASE_URL}/notes/${id}`, {
            headers
        });
        expect(deleteNoteResponse2.status()).toBe(404);
    });

})