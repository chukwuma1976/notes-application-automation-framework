import { test } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { blockPopups } from "../../utils/blockPopups";
import { generateUserRegistrationData } from "../../data/user-credentials";
import { createNote, deleteNote, deleteUser, loginAndRetrieveToken, registerUser } from "../../utils/apiHelpers";
import { NotesPage } from "../../pages/NotesPage";

test.describe("Profile page tests", () => {

    let loginPage: LoginPage;
    let notesPage: NotesPage;
    let token: string;
    let newNotes: Record<string, any>[] = [];

    test.beforeEach(async ({ browser, request }) => {

        // API generated user data
        const { name, email, password } = generateUserRegistrationData();
        await registerUser(request, name, email, password);

        // API login to retrieve token and create an array of notes for the user
        token = await loginAndRetrieveToken(request, email, password);
        for (const category of ["Personal", "Work", "Home"] as const) {
            const note = await createNote(request, token, category);
            newNotes.push(note);
        }

        // API assisted login to avoid UI login and speed up the test
        const context = await browser.newContext();

        await context.addInitScript((token: string) => {
            localStorage.setItem('token', token);
        }, token);

        const page = await context.newPage();

        await blockPopups(page);
        loginPage = new LoginPage(page);
        notesPage = new NotesPage(page);
    })

    test("Verify notes details", async ({ page, request }) => {
        //Navigate to All notes category and confirm that all created notes exist
        await notesPage.navigateToNotesPage();

        await notesPage.navigateToCategory("All");
        for (const note of newNotes) {
            await notesPage.confirmNoteExists(note.title, note.description);
        }

    })

    test.afterEach(async ({ request }) => {
        // Delete notes after each test
        for (const note of newNotes) {
            await deleteNote(request, token, note.id);
        }
        // Delete registered user after each test
        await deleteUser(request, token);

    })

})