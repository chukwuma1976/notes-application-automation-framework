import test from "@playwright/test";
import { userCredentials } from "../data/user-credentials";
import { LoginPage } from "../pages/LoginPage";

test.describe("Login test", () => {

    test("Login with valid credentials", async ({ page }) => {

        const loginPage = new LoginPage(page);
        const { email, password } = userCredentials;

        await loginPage.navigateToLogin();
        await loginPage.login(email, password);
        await loginPage.confirmNavigationToLandingPage();

    })

})