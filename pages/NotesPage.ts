import { expect, Page, Locator } from "@playwright/test";

export class NotesPage {

    private addNoteButton: Locator;
    private noteTitleInput: Locator;
    private noteDescriptionInput: Locator;
    private noteCategoryDropdown: Locator;
    private noteMarkCompleteCheckBox: Locator;
    private noteSubmitButton: Locator;
    private noteCancelButton: Locator;
    private noteCard: Locator;
    private myNotesHeader: Locator;
    private logoutButton: Locator;

    constructor(private page: Page) {
        this.page = page;

        this.addNoteButton = page.getByTestId('add-new-note');
        this.noteTitleInput = page.getByTestId('note-title');
        this.noteDescriptionInput = page.getByTestId('note-description');
        this.noteCategoryDropdown = page.getByTestId('note-category');
        this.noteMarkCompleteCheckBox = page.getByTestId('note-completed');
        this.noteSubmitButton = page.getByTestId('note-submit');
        this.noteCancelButton = page.getByTestId('note-cancel');
        this.noteCard = this.page.getByTestId("note-card")

        this.myNotesHeader = page.getByTestId('home').or(page.getByText('MyNotes'));
        this.logoutButton = page.getByTestId('logout');
    }

    async clickAddNoteButton() {
        await this.addNoteButton.click();
    }

    async enterNoteData(category: string, title: string, description: string) {
        await this.noteCategoryDropdown.selectOption(category);
        await this.noteTitleInput.fill(title);
        await this.noteDescriptionInput.fill(description);
    }

    async submitNote() {
        await this.noteSubmitButton.click();
    }

    async cancelNote() {
        await this.noteCancelButton.click();
    }

    async navigateToCategory(category: string) {
        await this.page.getByTestId(`category-${category.toLowerCase()}`).click();
    }

    async markNoteInProgressAsComplete() {
        await this.noteMarkCompleteCheckBox.check();
    }

    async unMarkNoteInProgressAsComplete() {
        await this.noteMarkCompleteCheckBox.uncheck();
    }

    async clickEditNote(title: string) {
        const editableNoteCard = this.noteCard.filter({ hasText: title });
        await editableNoteCard.getByTestId('note-edit').first().click();
    }

    async clickDeleteNote(title: string) {
        const deletableNoteCard = this.noteCard.filter({ hasText: title });
        await deletableNoteCard.getByTestId('note-delete').first().click();
        await this.page.getByTestId('note-delete-confirm').click();
    }

    async completeNote(title: string) {
        const noteCard = this.noteCard.filter({ hasText: title });
        await noteCard.getByTestId('toggle-note-switch').check();
    }

    async unCompleteNote(title: string) {
        const noteCard = this.noteCard.filter({ hasText: title });
        await noteCard.getByTestId('toggle-note-switch').uncheck();
    }

    async clickNotesHeader() {
        await this.myNotesHeader.click();
    }

    async logout() {
        await this.logoutButton.click();
    }

    async confirmNoteExists(title: string, description: string) {
        const noteCard = this.noteCard.filter({ hasText: title }).filter({ hasText: description });
        await expect(noteCard).toBeVisible();
    }

}