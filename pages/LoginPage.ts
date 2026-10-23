import { expect, Page, Locator } from "@playwright/test";

export class LoginPage {

    private emailInputBox: Locator;
    private passwordInputBox: Locator;
    private loginButton: Locator;
    private notesHeader: Locator;

    private loginURL = "https://practice.expandtesting.com/notes/app/login"

    constructor(private page: Page) {
        this.page = page;

        this.emailInputBox = page.getByLabel("email");
        this.passwordInputBox = page.getByLabel("password");
        this.loginButton = page.getByRole("button", { name: "Login" });

        this.notesHeader = this.page.getByTestId("home");
    }

    async navigateToLogin() {
        await this.page.goto(this.loginURL);
    }

    async login(email: string, password: string) {
        await this.emailInputBox.fill(email);
        await this.passwordInputBox.fill(password);
        await this.loginButton.click();
    }

    async confirmNavigationToLandingPage() {
        await expect(this.notesHeader).toBeVisible();
        expect(await this.page.title()).toBe("Notes React Application for Automation Testing Practice");
        expect(this.page.url()).toBe("https://practice.expandtesting.com/notes/app");
    }

}