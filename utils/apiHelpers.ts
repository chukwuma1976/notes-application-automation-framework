import { APIRequestContext, expect } from "@playwright/test";
import { API_BASE_URL } from "../config/configurations";

const baseUrl = API_BASE_URL;

export async function loginAndRetrieveToken(
    request: APIRequestContext,
    email: string,
    password: string
): Promise<string> {
    const response = await request.post(`${baseUrl}/users/login`, {
        data: { email, password }
    });

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    return responseBody.data.token;
}