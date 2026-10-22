import test, { expect } from "@playwright/test";

test.describe("Login test", () => {

    test("Login with valid credentials", async ({ page }) => {

        await page.goto("https://practice.expandtesting.com/notes/app/login");

        const emailInputBox = page.getByLabel("email");
        const passwordInputBox = page.getByLabel("password");
        const loginButton = page.getByRole("button", { name: "Login" });

        await emailInputBox.fill("eyeofahero@tester.com");
        await passwordInputBox.fill("eyeofaheropassword");
        await loginButton.click();

        await expect(page.getByTestId("home")).toBeVisible();
        expect(await page.title()).toBe("Notes React Application for Automation Testing Practice");
        expect(page.url()).toBe("https://practice.expandtesting.com/notes/app");

    })

})