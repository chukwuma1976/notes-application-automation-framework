import { expect, Page, Locator } from "@playwright/test";

export class LoginPage {

    private emailInputBox: Locator;
    private passwordInputBox: Locator;
    private loginButton: Locator;
    private notesHeader: Locator;

    private invalidCredentialsAlertMessage: Locator;
    private loginURL = "https://practice.expandtesting.com/notes/app/login"

    constructor(private page: Page) {
        this.page = page;

        this.emailInputBox = page.getByTestId("login-email");
        this.passwordInputBox = page.getByTestId("login-password");
        this.loginButton = page.getByRole("button", { name: "Login" });

        this.notesHeader = page.getByTestId("home").or(page.getByText("MyNotes"));
        this.invalidCredentialsAlertMessage = page.getByTestId("alert-message").or(page.getByText("Incorrect email address or password"));
    }

    async navigateToLogin() {
        await this.page.goto(this.loginURL);
    }

    async login(email: string, password: string) {

        await this.emailInputBox.click();
        await this.emailInputBox.fill(email);

        await this.passwordInputBox.click();
        await this.passwordInputBox.fill(password);

        await this.loginButton.click();
    }

    async confirmNavigationToLandingPage() {
        await expect(this.notesHeader).toBeVisible();
        expect(await this.page.title()).toBe("Notes React Application for Automation Testing Practice");
        expect(this.page.url()).toBe("https://practice.expandtesting.com/notes/app");
    }

    async confirmInvalidCredentialsAlertMessage() {
        await expect(this.invalidCredentialsAlertMessage).toBeVisible();
    }

    async confirmValidationMessage(message: string) {
        await expect(this.page.getByText(message)).toBeVisible();
    }

}