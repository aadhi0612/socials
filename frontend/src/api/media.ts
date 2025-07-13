import { MediaOut, MediaCreate } from '../types';

const API_BASE = 'https://50c83fay16.execute-api.us-east-2.amazonaws.com/prod';

export async function fetchMedia(token: string): Promise<MediaOut[]> {
  const res = await fetch(`${API_BASE}/media/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch media');
  return res.json();
}

export async function addMedia(media: MediaCreate, token: string): Promise<MediaOut> {
  const res = await fetch(`${API_BASE}/media/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(media)
  });
  if (!res.ok) throw new Error('Failed to add media');
  return res.json();
}

export async function deleteMedia(mediaId: string, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/media/${mediaId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete media');
}

export async function getPresignedUploadUrl(postId: string, filename: string, filetype: string): Promise<{ url: string; s3_key: string }> {
  const res = await fetch(`${API_BASE}/content/media/presign-upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ post_id: postId, filename, filetype })
  });
  if (!res.ok) throw new Error('Failed to get presigned upload URL');
  return res.json();
}

export async function generateAIImage(prompt: string): Promise<{ image_url?: string; s3_url?: string; name?: string }> {
  const res = await fetch(`${API_BASE}/ai/generate-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  if (!res.ok) throw new Error('Failed to generate AI image');
  return res.json();
}

export async function updateMedia(id: string, updates: Partial<MediaCreate>, token: string): Promise<MediaOut> {
  const res = await fetch(`${API_BASE}/media/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update media');
  return res.json();
}
