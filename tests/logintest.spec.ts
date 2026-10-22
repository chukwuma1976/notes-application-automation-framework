import test, { expect } from "@playwright/test";
import { userCredentials } from "../data/user-credentials";

test.describe("Login test", () => {

    test("Login with valid credentials", async ({ page }) => {

        await page.goto("https://practice.expandtesting.com/notes/app/login");

        const emailInputBox = page.getByLabel("email");
        const passwordInputBox = page.getByLabel("password");
        const loginButton = page.getByRole("button", { name: "Login" });

        await emailInputBox.fill(userCredentials.email);
        await passwordInputBox.fill(userCredentials.password);
        await loginButton.click();

        await expect(page.getByTestId("home")).toBeVisible();
        expect(await page.title()).toBe("Notes React Application for Automation Testing Practice");
        expect(page.url()).toBe("https://practice.expandtesting.com/notes/app");

    })

})