// src/api/users.ts

export const API_BASE = 'https://50c83fay16.execute-api.us-east-2.amazonaws.com/prod';

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

export interface RegisterUser {
  name: string;
  email: string;
  password: string;
  aws_community?: string;
  profile_pic_url?: string;
}

export async function createUser(user: RegisterUser) {
  const res = await fetch(`${API_BASE}/users/`, {
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
