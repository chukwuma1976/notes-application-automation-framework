export const userCredentials = {
    email: process.env.EMAIL || '',
    password: process.env.PASSWORD || '',
};


const validEmail = process.env.EMAIL || '';
const validPassword = process.env.PASSWORD || '';

export const invalidCredentialCombinations = [
    {
        email: validEmail,
        password: "WrongPassword123!",
        scenario: "valid email with invalid password",
    },
    {
        email: "unknown@example.com",
        password: validPassword,
        scenario: "unregistered email with otherwise valid password",
    },
    {
        email: "unknown@example.com",
        password: "WrongPassword123!",
        scenario: "invalid email and invalid password",
    },
];

export const missingCredentialCombinations = [
    {
        email: "",
        password: validPassword,
        scenario: "missing email with password provided",
        expectedMessage: "Email address is required",
    },
    {
        email: validEmail,
        password: "",
        scenario: "email provided with missing password",
        expectedMessage: "Password is required",
    },
    {
        email: "",
        password: "",
        scenario: "both email and password are missing",
        expectedMessage: "Email address is required",
    },
];

export const improperFormatCredentials = [
    {
        email: "invalid-email",
        password: validPassword,
        scenario: "email has no at sign or domain",
        expectedMessage: "Email address is invalid",
    },
    {
        email: "user@",
        password: validPassword,
        scenario: "email has no domain",
        expectedMessage: "Email address is invalid",
    },
    {
        email: "@example.com",
        password: validPassword,
        scenario: "email has no local part",
        expectedMessage: "Email address is invalid",
    }
];

export const passwordLengthCombinations = [
    {
        email: validEmail,
        password: "Ab123", // 5 characters
        scenario: "password below minimum length",
        expectedMessage: "Password should be between 6 and 30 characters",
    },
    {
        email: validEmail,
        password: "Abcdefghijklmnopqrstuvwxyz12345", // 31 characters
        scenario: "password above maximum length",
        expectedMessage: "Password should be between 6 and 30 characters",
    },
];

export function generateUserRegistrationData() {
    const timestamp = Date.now();
    return {
        name: `User ${timestamp}`,
        email: `user${timestamp}@example.com`,
        password: "ValidPassword${timestamp}",
    }
}