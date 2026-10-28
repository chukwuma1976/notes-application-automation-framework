import test from "@playwright/test"
import { LoginPage } from "../pages/LoginPage"
import { NotesPage } from "../pages/NotesPage";
import { blockPopups } from "../utils/blockPopups";
import { userCredentials } from "../data/user-credentials";
import { generateNotesData } from "../data/notes-data";

test.describe("End to end testing", () => {

    let loginPage: LoginPage;
    let notesPage: NotesPage;
    const { email, password } = userCredentials;
    const noteCategories = ["Personal", "Work", "Home"];

    test.beforeEach(async ({ page }) => {

        await blockPopups(page);
        loginPage = new LoginPage(page);
        notesPage = new NotesPage(page);

    })

    test("Create a new note", async ({ page }) => {

        await loginPage.navigateToLogin();
        await loginPage.login(email, password);
        await loginPage.confirmNavigationToLandingPage();

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

})