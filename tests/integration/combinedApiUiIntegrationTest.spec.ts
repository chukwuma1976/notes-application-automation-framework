import test, { expect } from "@playwright/test";
import { generateUserRegistrationData } from "../../data/user-credentials";
import { registerUser, loginAndRetrieveToken, createNote, updateNote, retrieveNoteById, deleteNote, deleteUser } from "../../utils/apiHelpers"
import { blockPopups } from "../../utils/blockPopups";
import { LoginPage } from "../../pages/LoginPage";
import { NotesPage } from "../../pages/NotesPage";

test.describe("Combined UI and API Assisted Notes Integration Test", () => {
    let token: string;
    let noteId: string;
    let loginPage: LoginPage;
    let notesPage: NotesPage;

    test("API Assisted Notes Test", async ({ browser, request }) => {
        // API generated user data
        const { name, email, password } = generateUserRegistrationData();
        await registerUser(request, name, email, password);

        // API login to retrieve token and create a notes for the user
        token = await loginAndRetrieveToken(request, email, password);
        const newNote = await createNote(request, token, "Personal");
        expect(newNote.category).toBe("Personal");
        expect(newNote.id).toBeTruthy();
        noteId = newNote.id;

        // API assisted login to avoid UI login and speed up the test
        const context = await browser.newContext();

        await context.addInitScript((token: string) => {
            localStorage.setItem('token', token);
        }, token);

        const page = await context.newPage();

        await blockPopups(page);
        loginPage = new LoginPage(page);
        notesPage = new NotesPage(page);

        // Confirm presence of created note in UI
        await notesPage.navigateToNotesPage();
        await notesPage.confirmNoteExists(newNote.title, newNote.description);

        // Update the note using API
        const updatedNotePayload = { ...newNote, completed: true, description: "Updated description" };
        const updatedNote = await updateNote(request, token, noteId, updatedNotePayload);
        expect(updatedNote.completed).toBe(true);
        expect(updatedNote.description).toBe("Updated description");

        // Confirm that note is update in the UI
        await page.reload(); // Reload the page to reflect the updated note
        await notesPage.confirmNoteExists(updatedNote.title, updatedNote.description);

        // Delete the note using API
        await deleteNote(request, token, noteId);

        // Confirm note is deleted in UI
        await page.reload(); // Reload the page to reflect the deleted note
        await notesPage.confirmNoNotesMessage();

        // Delete the user using API
        await deleteUser(request, token);
    })
})