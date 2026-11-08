import { APIRequestContext, expect } from "@playwright/test";
import { API_BASE_URL } from "../config/configurations";
import { generateNotesData } from "../data/notes-data";

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

export async function registerUser(
    request: APIRequestContext,
    name: string,
    email: string,
    password: string
): Promise<void> {
    const response = await request.post(`${baseUrl}/users/register`, {
        data: {
            name,
            email,
            password
        }
    });

    const result = await response.json();
    expect(response.status()).toBe(201);
    expect(result.message, { message: `${name} could not be registered.` }).toBe("User account created successfully")
    console.log(`${name} has been registered.`)
}

export async function deleteUser(request: APIRequestContext, token: string): Promise<void> {
    // Delete registered user
    const deleteResponse = await request.delete(`${baseUrl}/users/delete-account`, {
        headers: {
            "x-auth-token": token
        }
    });

    expect(deleteResponse.status()).toBe(200);
    console.log("User deleted");
}

export async function logoutUser(request: APIRequestContext, token: string): Promise<void> {
    const response = await request.delete(`${baseUrl}/users/logout`, { headers: { "x-auth-token": token } });
    const result = await response.json();

    expect(response.status()).toBe(200);
    expect(result.message).toBe("User has been successfully logged out");
    console.log("User logged out");
}

export async function createNote(
    request: APIRequestContext,
    token: string,
    category: "Work" | "Home" | "Personal"
): Promise<Record<string, any>> {
    const createNotePayload = generateNotesData(category);
    const response = await request.post(`${API_BASE_URL}/notes`, {
        headers: { "x-auth-token": token },
        data: createNotePayload
    });

    expect(response.status()).toBe(200);
    const createdNote = await response.json();
    console.log(`Note created with id: ${createdNote.data.id}`);
    return createdNote.data;
}

export async function retrieveNotes(request: APIRequestContext, token: string): Promise<Record<string, any>[]> {
    const response = await request.get(`${API_BASE_URL}/notes`, {
        headers: { "x-auth-token": token }
    });
    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(Array.isArray(result.data)).toBeTruthy();
    return result.data
}

export async function retrieveNoteById(request: APIRequestContext, token: string, noteId: string): Promise<Record<string, any>> {
    const response = await request.get(`${API_BASE_URL}/notes/${noteId}`, {
        headers: { "x-auth-token": token }
    });
    expect(response.status()).toBe(200);
    const result = await response.json();
    return result.data;
}

export async function updateNote(request: APIRequestContext, token: string, noteId: string, updatedData: Record<string, any>): Promise<Record<string, any>> {
    const response = await request.put(`${API_BASE_URL}/notes/${noteId}`, {
        headers: { "x-auth-token": token },
        data: updatedData
    });
    expect(response.status()).toBe(200);
    const result = await response.json();
    console.log(`Note updated with id: ${result.data.id}`);
    return result.data;
}

export async function deleteNote(request: APIRequestContext, token: string, noteId: string): Promise<void> {
    const deleteNoteResponse = await request.delete(`${API_BASE_URL}/notes/${noteId}`, {
        headers: { "x-auth-token": token }
    });
    expect(deleteNoteResponse.status()).toBe(200);
    console.log(`Note deleted with id: ${noteId}`);
}