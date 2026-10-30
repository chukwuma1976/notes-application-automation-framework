import test from "@playwright/test"
import { LoginPage } from "../../pages/LoginPage"
import { NotesPage } from "../../pages/NotesPage";
import { blockPopups } from "../../utils/blockPopups";
import { userCredentials } from "../../data/user-credentials";
import { generateNotesData } from "../../data/notes-data";

test.describe("End to end testing", () => {

    let loginPage: LoginPage;
    let notesPage: NotesPage;
    const { email, password } = userCredentials;
    const noteCategories = ["Personal", "Work", "Home"];

    test.beforeEach(async ({ page }) => {

        await blockPopups(page);
        loginPage = new LoginPage(page);
        notesPage = new NotesPage(page);

        await loginPage.navigateToLogin();
        await loginPage.login(email, password);
        await loginPage.confirmNavigationToLandingPage();

    })

    test("Create a new note", async ({ page }) => {

        // Create multiple notes for each category
        const notesDataArray = [];
        for (const category of noteCategories) {
            const noteData = generateNotesData(category);
            notesDataArray.push(noteData);
            await notesPage.clickAddNoteButton();
            await notesPage.enterNoteData(noteData.category, noteData.title, noteData.description);
            await notesPage.submitNote();
        }

        // Verify that all created notes exist in the "All" category and their respective categories
        for (const noteData of notesDataArray) {
            await notesPage.navigateToCategory("All");
            await notesPage.confirmNoteExists(noteData.title, noteData.description);
            await notesPage.navigateToCategory(noteData.category);
            await notesPage.confirmNoteExists(noteData.title, noteData.description);
        }

        // Delete all created notes from the "All" category
        for (const noteData of notesDataArray) {
            await notesPage.navigateToCategory("All");
            await notesPage.clickDeleteNote(noteData.title);
        }

        await notesPage.logout();
    })

    test("Edit a note and mark as complete", async ({ page }) => {

        // Create a note to edit
        const noteData = generateNotesData("Personal");
        await notesPage.clickAddNoteButton();
        await notesPage.enterNoteData(noteData.category, noteData.title, noteData.description);
        await notesPage.submitNote();

        // Edit the note
        await notesPage.navigateToCategory("All");
        await notesPage.clickEditNote(noteData.title);
        const updatedNoteData = { ...noteData, title: "Updated " + noteData.title, description: "Updated " + noteData.description };
        await notesPage.enterNoteData(updatedNoteData.category, updatedNoteData.title, updatedNoteData.description);
        await notesPage.markNoteInProgressAsComplete();
        await notesPage.submitNote();

        // Verify the updated note exists
        await notesPage.navigateToCategory("All");
        await notesPage.confirmNoteExists(updatedNoteData.title, updatedNoteData.description);

        // Verify the note is marked as complete
        await notesPage.navigateToCategory("All");

        // Delete the updated note
        await notesPage.clickDeleteNote(updatedNoteData.title);

        await notesPage.logout();
    })
});