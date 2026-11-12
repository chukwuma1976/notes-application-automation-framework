import { test } from "@playwright/test";
import { ProfilePage } from "../../pages/ProfilePage";
import { LoginPage } from "../../pages/LoginPage";
import { blockPopups } from "../../utils/blockPopups";
import { generateUserRegistrationData } from "../../data/user-credentials";
import { createNote, deleteNote, deleteUser, loginAndRetrieveToken, registerUser } from "../../utils/apiHelpers";
import { NotesPage } from "../../pages/NotesPage";

test.describe("Profile page tests", () => {

    let loginPage: LoginPage;
    let notesPage: NotesPage;
    let profilePage: ProfilePage;
    let token: string;
    let newNotes: Record<string, any>[] = [];

    test.beforeEach(async ({ page, request }) => {

        await blockPopups(page);
        loginPage = new LoginPage(page);
        notesPage = new NotesPage(page);
        profilePage = new ProfilePage(page);

        // API generated user data
        const { name, email, password } = generateUserRegistrationData();
        await registerUser(request, name, email, password);

        // API assisted login to retrieve token and create an array of notes for the user
        token = await loginAndRetrieveToken(request, email, password);
        for (const category of ["Personal", "Work", "Home"] as const) {
            const note = await createNote(request, token, category);
            newNotes.push(note);
        }

        await loginPage.navigateToLogin();
        await loginPage.login(email, password);
        await loginPage.confirmNavigationToLandingPage();

    })

    test("Verify user profile details", async ({ page, request }) => {
        //Navigate to All notes category and confirm that all created notes exist
        await notesPage.navigateToCategory("All");
        for (const note of newNotes) {
            await notesPage.confirmNoteExists(note.title, note.description);
        }

        await page.waitForTimeout(5000); // Wait for 5 seconds to ensure the page is fully loaded for demo purposes

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