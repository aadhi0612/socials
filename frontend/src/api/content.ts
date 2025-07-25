import { ContentCreate, ContentUpdate, ContentOut } from '../types';

const API_BASE = 'http://localhost:8000';

export async function createContent(content: ContentCreate): Promise<ContentOut> {
  const res = await fetch(`${API_BASE}/content/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(content)
  });
  if (!res.ok) throw new Error('Failed to create content');
  return res.json();
}

export async function listContent(author_id?: string): Promise<ContentOut[]> {
  const url = author_id ? `${API_BASE}/content/?author_id=${author_id}` : `${API_BASE}/content/`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch content');
  return res.json();
}

export async function getContent(id: string): Promise<ContentOut> {
  const res = await fetch(`${API_BASE}/content/${id}`);
  if (!res.ok) throw new Error('Content not found');
  return res.json();
}

export async function updateContent(id: string, content: ContentUpdate): Promise<ContentOut> {
  const res = await fetch(`${API_BASE}/content/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(content)
  });
  if (!res.ok) throw new Error('Failed to update content');
  return res.json();
}

export async function deleteContent(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/content/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete content');
} 