const API_BASE = 'https://wi6uxcbvs9.execute-api.us-east-2.amazonaws.com/prod';
export async function createContent(content) {
    const res = await fetch(`${API_BASE}/content/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
    });
    if (!res.ok)
        throw new Error('Failed to create content');
    return res.json();
}
export async function listContent(author_id) {
    const url = author_id ? `${API_BASE}/content/?author_id=${author_id}` : `${API_BASE}/content/`;
    const res = await fetch(url);
    if (!res.ok)
        throw new Error('Failed to fetch content');
    return res.json();
}
export async function getContent(id) {
    const res = await fetch(`${API_BASE}/content/${id}`);
    if (!res.ok)
        throw new Error('Content not found');
    return res.json();
}
export async function updateContent(id, content) {
    const res = await fetch(`${API_BASE}/content/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
    });
    if (!res.ok)
        throw new Error('Failed to update content');
    return res.json();
}
export async function deleteContent(id) {
    const res = await fetch(`${API_BASE}/content/${id}`, { method: 'DELETE' });
    if (!res.ok)
        throw new Error('Failed to delete content');
}
