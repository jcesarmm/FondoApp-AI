const API_BASE = "http://localhost:3000/api";

// ---------- Token helper ----------
function getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = localStorage.getItem("auth_token");
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
}

// ---------- DTOs ----------
import type { UserDTO, CreateUserDTO, UpdateUserDTO, SignInDTO, SignInResponse } from "../models";
export type { UserDTO, CreateUserDTO, UpdateUserDTO, SignInDTO, SignInResponse } from "../models";

// ---------- Response handler ----------
async function handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
        // Token expired or invalid — clear and redirect to login
        localStorage.removeItem("auth_token");
        window.location.href = "/login";
        throw new Error("Session expired");
    }
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || "Request failed");
    }
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
}

// ---------- Auth service ----------
export const authService = {
    async signIn(data: SignInDTO): Promise<SignInResponse> {
        const res = await fetch(`${API_BASE}/auth/signin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return handleResponse<SignInResponse>(res);
    },
};

// ---------- User service ----------
export const userService = {
    async getAll(): Promise<UserDTO[]> {
        const res = await fetch(`${API_BASE}/users`, {
            headers: getAuthHeaders(),
        });
        return handleResponse<UserDTO[]>(res);
    },

    async getById(id: string): Promise<UserDTO> {
        const res = await fetch(`${API_BASE}/users/${id}`, {
            headers: getAuthHeaders(),
        });
        return handleResponse<UserDTO>(res);
    },

    async create(data: CreateUserDTO): Promise<UserDTO> {
        const res = await fetch(`${API_BASE}/users`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse<UserDTO>(res);
    },

    async update(id: string, data: UpdateUserDTO): Promise<UserDTO> {
        const res = await fetch(`${API_BASE}/users/${id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse<UserDTO>(res);
    },

    async delete(id: string): Promise<void> {
        const res = await fetch(`${API_BASE}/users/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        });
        return handleResponse<void>(res);
    },
};
