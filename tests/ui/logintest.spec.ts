import test from "@playwright/test";
import { userCredentials } from "../../data/user-credentials";
import { LoginPage } from "../../pages/LoginPage";
import { blockPopups } from "../../utils/blockPopups";

test.describe("Login test", () => {

    test("Login with valid credentials", async ({ page }) => {
        await blockPopups(page);

        const loginPage = new LoginPage(page);
        const { email, password } = userCredentials;

        await loginPage.navigateToLogin();
        await loginPage.login(email, password);
        await loginPage.confirmNavigationToLandingPage();

    })

})