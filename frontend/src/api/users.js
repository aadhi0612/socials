// src/api/users.ts
export const API_BASE = 'http://localhost:8000';
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
    const res = await fetch('http://localhost:8000/users/', {
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
