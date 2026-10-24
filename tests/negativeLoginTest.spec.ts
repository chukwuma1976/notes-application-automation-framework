import test from "@playwright/test";
import { improperFormatCredentials, invalidCredentialCombinations, missingCredentialCombinations, passwordLengthCombinations, userCredentials } from "../data/user-credentials";
import { LoginPage } from "../pages/LoginPage";

test.describe("Negative login test scenarios", () => {

    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.navigateToLogin();
    })

    for (let testScenario of invalidCredentialCombinations) {

        test(`User logs in ${testScenario.scenario}`, async ({ page }) => {

            await loginPage.login(testScenario.email, testScenario.password);
            await loginPage.confirmInvalidCredentialsAlertMessage();

        })

    }

    for (let testScenario of missingCredentialCombinations) {
        test(`User logs in ${testScenario.scenario}`, async ({ page }) => {

            await loginPage.login(testScenario.email, testScenario.password);
            await loginPage.confirmValidationMessage(testScenario.expectedMessage);
        })
    }

    for (let testScenario of improperFormatCredentials) {
        test(`User logs in ${testScenario.scenario}`, async ({ page }) => {
            await loginPage.login(testScenario.email, testScenario.password);
            await loginPage.confirmValidationMessage(testScenario.expectedMessage);
        })
    }

    for (let testScenario of passwordLengthCombinations) {
        test(`User logs in ${testScenario.scenario}`, async ({ page }) => {
            await loginPage.login(testScenario.email, testScenario.password);
            await loginPage.confirmValidationMessage(testScenario.expectedMessage);
        })
    }

})