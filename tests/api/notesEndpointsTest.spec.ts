import test, { expect } from "@playwright/test";
import { userCredentials } from "../../data/user-credentials";
import { API_BASE_URL } from "../../config/configurations";
import { generateNotesData } from "../../data/notes-data";
import { loginAndRetrieveToken } from "../../utils/apiHelpers";

test.describe("Notes Endpoints", () => {

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
        const newNote = createdNote.data;

        expect(newNote.id).toBeDefined();
        expect(newNote.title).toBe(createNotePayload.title);
        expect(newNote.description).toBe(createNotePayload.description);
        expect(newNote.category).toBe(createNotePayload.category);

        const id = newNote.id;

        //Retrieve all notes
        const getAllNotesResponse = await request.get(`${API_BASE_URL}/notes`, {
            headers
        });
        expect(getAllNotesResponse.status()).toBe(200);

        //Retrieve a single note
        const getASingleNoteResponse = await request.get(`${API_BASE_URL}/notes/${id}`, {
            headers
        });
        expect(getASingleNoteResponse.status()).toBe(200);
        console.log("New note: ", await getASingleNoteResponse.json());

        //Update newly created note
        const updateNotePayload = { ...createNotePayload, title: "Updated Title", completed: true };
        const updateNoteResponse = await request.put(`${API_BASE_URL}/notes/${id}`, {
            headers,
            data: updateNotePayload
        });
        expect(updateNoteResponse.status()).toBe(200);
        console.log("Updated note: ", await updateNoteResponse.json());

        //Delete created note
        const deleteNoteResponse = await request.delete(`${API_BASE_URL}/notes/${id}`, {
            headers
        });
        expect(deleteNoteResponse.status()).toBe(200);
        console.log("Deleted note: ", await deleteNoteResponse.json());

        //Confirm note is deleted
        const cannotGetASingleNoteResponse = await request.get(`${API_BASE_URL}/notes/${id}`, {
            headers
        });
        console.log("Cannot get single note status: ", cannotGetASingleNoteResponse.status());
        console.log("Cannot get single note body: ", await cannotGetASingleNoteResponse.json());

    });

})