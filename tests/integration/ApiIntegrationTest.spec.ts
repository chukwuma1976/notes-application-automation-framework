import test, { expect } from "@playwright/test";
import { generateUserRegistrationData } from "../../data/user-credentials";
import { registerUser, loginAndRetrieveToken, createNote, updateNote, retrieveNoteById, deleteNote, deleteUser } from "../../utils/apiHelpers"
import { API_BASE_URL } from "../../config/configurations";

test.describe("API Assisted Notes Integration Test", () => {
    let token: string;
    let noteId: string;

    test("API Assisted Notes Test", async ({ request }) => {
        // API generated user data
        const { name, email, password } = generateUserRegistrationData();
        await registerUser(request, name, email, password);

        // API login to retrieve token and create a notes for the user
        token = await loginAndRetrieveToken(request, email, password);
        const newNote = await createNote(request, token, "Personal");
        expect(newNote.category).toBe("Personal");
        expect(newNote.id).toBeTruthy();
        noteId = newNote.id;

        // Retrieve the created note using API
        const retrievedNoteAfterCreate = await retrieveNoteById(request, token, noteId);
        expect(retrievedNoteAfterCreate.id).toBe(noteId);
        expect(retrievedNoteAfterCreate.category).toBe(newNote.category);
        expect(retrievedNoteAfterCreate.description).toBe(newNote.description);

        // Update the note using API
        const updatedNotePayload = { ...newNote, completed: true };
        const updatedNote = await updateNote(request, token, noteId, updatedNotePayload);
        expect(updatedNote.completed).toBe(true);

        // Retrieve the updated note using API
        const retrievedNoteAfterUpdate = await retrieveNoteById(request, token, noteId);
        expect(retrievedNoteAfterUpdate.completed).toBe(true);

        // Delete the note using API
        await deleteNote(request, token, noteId);

        // Verify that the note has been deleted using API
        const cannotdeleteNoteResponse = await request.delete(`${API_BASE_URL}/notes/${noteId}`, {
            headers: { "x-auth-token": token }
        });
        expect(cannotdeleteNoteResponse.status()).toBe(404);

        // Delete the user using API
        await deleteUser(request, token);
    })
})