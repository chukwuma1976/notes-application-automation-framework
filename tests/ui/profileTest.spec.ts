import test from "@playwright/test"
import { LoginPage } from "../../pages/LoginPage"
import { ProfilePage } from "../../pages/ProfilePage";
import { blockPopups } from "../../utils/blockPopups";
import { generateUserRegistrationData } from "../../data/user-credentials";
import { deleteUser, loginAndRetrieveToken, registerUser, retrieveUserProfile, updateUserProfile } from "../../utils/apiHelpers";

test.describe("Profile page tests with API assisted login", () => {

    let loginPage: LoginPage;
    let profilePage: ProfilePage;
    let token: string;

    test.beforeEach(async ({ browser, request }) => {

        // API generated user data
        const { name, email, password } = generateUserRegistrationData();
        await registerUser(request, name, email, password);

        // API generated user token
        token = await loginAndRetrieveToken(request, email, password);

        // API assisted login to avoid UI login and speed up the test
        const context = await browser.newContext();

        await context.addInitScript((token: string) => {
            localStorage.setItem('token', token);
        }, token);

        const page = await context.newPage();

        await blockPopups(page);
        loginPage = new LoginPage(page);
        profilePage = new ProfilePage(page);

    })

    test("check profile details", async ({ page, request }) => {
        // Retrieve user profile details using API
        const userProfile = await retrieveUserProfile(request, token);

        // Navigate to profile page and check that the profile details are correct
        await profilePage.navigateToProfilePage();
        await profilePage.confirmFullNameValue(userProfile.name);
        await profilePage.confirmEmailAddressValue(userProfile.email);
        await profilePage.confirmUserIDValue(userProfile.id);

        await updateUserProfile(request, token, { name: userProfile.name, phone: "5551234567", company: "Example Company" });

        const updatedProfile = await retrieveUserProfile(request, token);

        // Confirm that the updated profile details are correct
        await profilePage.navigateToProfilePage();
        await profilePage.confirmFullNameValue(updatedProfile.name);
        await profilePage.confirmPhoneNumberValue(updatedProfile.phone);
        await profilePage.confirmCompanyNameValue(updatedProfile.company);
    })

    test.afterEach(async ({ request }) => {
        // Delete registered user after each test
        await deleteUser(request, token);
    })
});