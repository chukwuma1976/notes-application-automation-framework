export interface TestmailEmail {
    subject?: string;
    text?: string;
    html?: string;
    timestamp?: number;
}

export interface TestmailResponse {
    result: string;
    emails: TestmailEmail[];
}

// Matches the token at the end of: .../notes/app/reset-password/<token>
const RESET_TOKEN_PATTERN = /\/reset-password\/([A-Za-z0-9_-]+)/;

/** Pulls the reset token out of any text containing the reset-password link. */
export function extractResetTokenFromText(body: string): string | null {
    const match = body.match(RESET_TOKEN_PATTERN);
    return match ? match[1] : null;
}

/**
 * Finds the most recent "Reset Password" email in a testmail.app response
 * and returns the token from its reset link.
 */
export function extractResetToken(
    response: TestmailResponse,
    subjectContains = 'Reset Password'
): string {
    const resetEmails = (response.emails ?? [])
        .filter((email) => email.subject?.includes(subjectContains))
        .sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0)); // newest first

    if (resetEmails.length === 0) {
        throw new Error(`No email with a subject containing "${subjectContains}" was found.`);
    }

    const latest = resetEmails[0];
    const token = extractResetTokenFromText(latest.text ?? latest.html ?? '');

    if (!token) {
        throw new Error('A reset password email was found, but it contained no reset link.');
    }
    console.log("Reset forgotten password token extracted");
    return token;
}