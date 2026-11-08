import test, { expect } from "@playwright/test";
import { userCredentials } from "../../../data/user-credentials";
import { createNote, deleteNote, loginAndRetrieveToken } from "../../../utils/apiHelpers";
import { API_BASE_URL } from "../../../config/configurations";

test.describe("Update Notes Endpoints", () => {

    let token: string;
    let id: string;
    const { email, password } = userCredentials;
    let headers: Record<string, string>;
    let newNote: any;

    test.beforeEach(async ({ request }) => {
        token = await loginAndRetrieveToken(request, email, password);
        headers = {
            'x-auth-token': token,
            'Accept': 'application/json'
        }
        // Create a note
        newNote = await createNote(request, token, "Personal");
        id = newNote.id;
    });

    test("should update a note by passing in all fields", async ({ request }) => {
        const updateNotePayload = { ...newNote, title: "Updated Title", completed: true };
        const updateNoteResponse = await request.put(`${API_BASE_URL}/notes/${id}`, {
            headers,
            data: updateNotePayload
        });
        const updatedNote = await updateNoteResponse.json();

        expect(updateNoteResponse.status()).toBe(200);
        expect(updatedNote.data.title).toBe(updateNotePayload.title);
    });

    test("should update a note by marking a note as complete", async ({ request }) => {
        const updateNoteResponse = await request.patch(`${API_BASE_URL}/notes/${id}`, {
            headers,
            data: { completed: true }
        });
        const updatedNote = await updateNoteResponse.json();

        expect(updateNoteResponse.status()).toBe(200);
        expect(updatedNote.data.completed).toBe(true);

        //Assert that other fields remain unchanged
        expect(updatedNote.data.category).toBe(newNote.category);
        expect(updatedNote.data.title).toBe(newNote.title);
        expect(updatedNote.data.description).toBe(newNote.description);
    });

    test("should update a note by marking a note as incomplete", async ({ request }) => {
        //Update newly created note to complete
        await request.patch(`${API_BASE_URL}/notes/${id}`, {
            headers,
            data: { completed: true }
        });

        //Mark note as incomplete
        const updatedNoteResponse = await request.patch(`${API_BASE_URL}/notes/${id}`, {
            headers,
            data: { completed: false }
        });
        const updatedNote = await updatedNoteResponse.json();

        expect(updatedNoteResponse.status()).toBe(200);
        expect(updatedNote.data.completed).toBe(false);

        //Assert that other fields remain unchanged
        expect(updatedNote.data.category).toBe(newNote.category);
        expect(updatedNote.data.title).toBe(newNote.title);
        expect(updatedNote.data.description).toBe(newNote.description);
    });

    test("updating a note with an invalid category will fail", async ({ request }) => {
        const updateNotePayload = { description: "Testing update", category: "Work", completed: "invalid" };
        const updateNoteResponse = await request.put(`${API_BASE_URL}/notes/${id}`, {
            headers,
            data: updateNotePayload
        });

        expect(updateNoteResponse.status()).toBe(400);

    });

    test("updating a note with an invalid completion value will fail", async ({ request }) => {
        const updateNoteResponse = await request.patch(`${API_BASE_URL}/notes/${id}`, {
            headers,
            data: { completed: "invalid" }
        });
        const result = await updateNoteResponse.json();

        expect(updateNoteResponse.status()).toBe(400);
        expect(result.message).toBe("Note completed status must be boolean");
    });

    test("updating a note with missing or invalid fields will fail", async ({ request }) => {
        //Update newly created note with missing category and invalid completion field
        const updateNotePayload = { title: "Updated Title", description: newNote.description, completed: "invalid" };
        const updateNoteResponse = await request.put(`${API_BASE_URL}/notes/${id}`, {
            headers,
            data: updateNotePayload
        });
        const result = await updateNoteResponse.json();

        expect(updateNoteResponse.status()).toBe(400);
        expect(result.message).toBe("Category must be one of the categories: Home, Work, Personal");
    });

    test("updating a note with a non existent id will fail", async ({ request }) => {
        //Update newly created note with non existent id
        const updateNotePayload = { ...newNote, title: "Updated Title", completed: true };
        const updateNoteResponse = await request.put(`${API_BASE_URL}/notes/nonExistentId}`, {
            headers,
            data: updateNotePayload
        });
        const result = await updateNoteResponse.json();

        expect(updateNoteResponse.status()).toBe(400);
        expect(result.message).toBe("Note ID must be a valid ID");
    });

    test("updating a note without a token will fail", async ({ request }) => {
        const updateNotePayload = { ...newNote, title: "Updated Title", completed: true };
        const updateNoteResponse = await request.put(`${API_BASE_URL}/notes/${id}`, {
            data: updateNotePayload
        });
        const result = await updateNoteResponse.json();

        expect(updateNoteResponse.status()).toBe(401);
        expect(result.message).toBe("No authentication token specified in x-auth-token header");
    });

    test("updating completion status with missing completion field will fail", async ({ request }) => {
        const updateNoteResponse = await request.patch(`${API_BASE_URL}/notes/${id}`, {
            headers,
            data: {}
        });
        const result = await updateNoteResponse.json();

        expect(updateNoteResponse.status()).toBe(400);
        expect(result.message).toBe("Note completed status must be boolean");
    });

    test("updating a completion status with a non existent id will fail", async ({ request }) => {
        const updateNoteResponse = await request.patch(`${API_BASE_URL}/notes/nonexistentId`, {
            headers,
            data: { completed: true }
        });
        const result = await updateNoteResponse.json();

        expect(updateNoteResponse.status()).toBe(400);
        expect(result.message).toBe("Note ID must be a valid ID");
    });

    test("updating a completion status without a token will fail", async ({ request }) => {
        const updateNoteResponse = await request.patch(`${API_BASE_URL}/notes/${id}`, {
            data: { completed: true }
        });
        const result = await updateNoteResponse.json();

        expect(updateNoteResponse.status()).toBe(401);
        expect(result.message).toBe("No authentication token specified in x-auth-token header");
    });

    test.afterEach(async ({ request }) => {
        await deleteNote(request, token, id);
    })

})
