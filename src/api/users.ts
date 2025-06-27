// src/api/users.ts

export const API_BASE = 'http://localhost:8000';

export async function getUser(id: string) {
  const res = await fetch(`${API_BASE}/users/${id}`);
  if (!res.ok) throw new Error('User not found');
  return res.json();
}

export async function createUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  lastActive?: string;
}) {
  const res = await fetch(`${API_BASE}/users/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  });
  if (!res.ok) throw new Error('Failed to create user');
  return res.json();
} 