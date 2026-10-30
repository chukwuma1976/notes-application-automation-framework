import { Page, Locator, expect } from "@playwright/test";

export class ProfilePage {

    private accountDetailsTab: Locator;
    private userIDValue: Locator;
    private emailAddressValue: Locator;
    private fullNameValue: Locator;
    private phoneNumberValue: Locator;
    private companyNameValue: Locator;

    constructor(private page: Page) {
        this.page = page;

        this.accountDetailsTab = this.page.getByRole("button", { name: "Account details" });
        this.userIDValue = this.page.getByTestId("user-id");
        this.emailAddressValue = this.page.getByTestId("user-email");
        this.fullNameValue = this.page.getByTestId("user-name");
        this.phoneNumberValue = this.page.getByTestId("user-phone");
        this.companyNameValue = this.page.getByTestId("user-company");
    }

    async confirmAccountDetailsTabVisible() {
        await expect(this.accountDetailsTab).toBeVisible();
    }

    async confirmUserIDValue(expectedValue: string) {
        await expect(this.userIDValue).toHaveValue(expectedValue);
    }

    async confirmEmailAddressValue(expectedValue: string) {
        await expect(this.emailAddressValue).toHaveValue(expectedValue);
    }

    async confirmFullNameValue(expectedValue: string) {
        await expect(this.fullNameValue).toHaveValue(expectedValue);
    }

    async confirmPhoneNumberValue(expectedValue: string) {
        await expect(this.phoneNumberValue).toHaveValue(expectedValue);
    }

    async confirmCompanyNameValue(expectedValue: string) {
        await expect(this.companyNameValue).toHaveValue(expectedValue);
    }

}
