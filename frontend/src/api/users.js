// src/api/users.ts
export const API_BASE = 'https://50c83fay16.execute-api.us-east-2.amazonaws.com/prod';
export async function getUser(id) {
    const res = await fetch(`${API_BASE}/users/${id}`, {
        headers: {
            'X-User-Id': id,
        }
    });
    if (!res.ok)
        throw new Error('User not found');
    return res.json();
}
export async function getCurrentUser(id) {
    const res = await fetch(`${API_BASE}/users/me`, {
        headers: {
            'X-User-Id': id,
        }
    });
    if (!res.ok)
        throw new Error('User not found');
    return res.json();
}
export async function createUser(user) {
    const res = await fetch(`${API_BASE}/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
    if (!res.ok)
        throw new Error('Failed to create user');
    return res.json();
}
export async function login(email, password) {
    const res = await fetch(`${API_BASE}/users/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-User-Id': email,
        },
        body: JSON.stringify({ email, password })
    });
    if (!res.ok)
        throw new Error('Invalid credentials');
    return res.json();
}
