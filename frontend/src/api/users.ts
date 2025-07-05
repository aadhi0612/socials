// src/api/users.ts

export const API_BASE = 'http://localhost:8000';

export type LoginResult = { token: string; user_id: string };

export async function getUser(id: string, token?: string) {
  const headers: Record<string, string> = {
    'X-User-Id': id,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/users/${id}`, {
    headers
  });
  if (!res.ok) throw new Error('User not found');
  return res.json();
}

export async function getCurrentUser(id: string, token?: string) {
  const headers: Record<string, string> = {
    'X-User-Id': id,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/users/me`, {
    headers
  });
  if (!res.ok) throw new Error('User not found');
  return res.json();
}

export async function createUser(user: { name: string; email: string; password: string }) {
  const res = await fetch('http://localhost:8000/users/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  });
  if (!res.ok) throw new Error('Failed to create user');
  return res.json();
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const res = await fetch(`${API_BASE}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': email,
    },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error('Invalid credentials');
  return res.json();
}
