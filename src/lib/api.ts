import { getToken, clearToken } from './auth';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };

  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (res.status === 401) {
    clearToken();
  }
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new ApiError(`Request failed: ${res.status}`, res.status, data);
  }
  return data as T;
}

// Auth
export async function login(username: string, password: string): Promise<{ access_token: string; token_type: string }>{
  const body = new URLSearchParams({ username, password });
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const json = await res.json();
  if (!res.ok) throw new ApiError('Login failed', res.status, json);
  return json;
}

export async function me(): Promise<{ id: string; email: string }>{
  return apiFetch('/auth/users/me');
}

// Sessions
export type SessionItem = { id: string; title: string; status: string; created_at: string; updated_at: string };
export async function listSessions(): Promise<SessionItem[]> {
  return apiFetch('/sessions');
}

export type SessionCreated = { sessionId: string; noteId: string; transcriptId: string };
export async function createSession(): Promise<SessionCreated> {
  return apiFetch('/sessions', { method: 'POST' });
}

export async function getSession(sessionId: string): Promise<SessionItem> {
  return apiFetch(`/sessions/${sessionId}`);
}

export async function getPublicSession(sessionId: string): Promise<SessionItem> {
  return apiFetch(`/sessions/public/${sessionId}`);
}

export async function uploadSessionAudio(sessionId: string, file: File): Promise<{ audioSourceId: string }>{
  const token = getToken();
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/audio/upload`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });
  const json = await res.json();
  if (!res.ok) throw new ApiError('Upload failed', res.status, json);
  return json;
}

export async function shareSession(sessionId: string): Promise<{ shareUrl: string; isPublic: boolean }>{
  return apiFetch(`/sessions/${sessionId}/share`, { method: 'POST' });
}

export async function uploadSessionAudioFromUrl(sessionId: string, url: string): Promise<{ audioSourceId: string }>{
  return apiFetch(`/sessions/${sessionId}/audio/from-url`, { method: 'POST', body: JSON.stringify({ url }) });
}

// Notes
export type NoteRead = { id: string; session_id: string; user_id: string; title: string; content?: Record<string, unknown> | null; created_at: string; updated_at: string };
export async function listNotes(): Promise<NoteRead[]>{
  return apiFetch('/notes');
}
export async function getNote(noteId: string): Promise<NoteRead>{
  return apiFetch(`/notes/${noteId}`);
}
export async function createNote(payload: { sessionId: string; title?: string }): Promise<NoteRead>{
  return apiFetch('/notes', { method: 'POST', body: JSON.stringify(payload) });
}
export async function updateNote(noteId: string, payload: { title?: string; content?: Record<string, unknown> | null }): Promise<NoteRead>{
  return apiFetch(`/notes/${noteId}`, { method: 'PUT', body: JSON.stringify(payload) });
}
export async function deleteNote(noteId: string): Promise<void>{
  await apiFetch(`/notes/${noteId}`, { method: 'DELETE' });
}
export async function enrichNote(payload: { sessionId: string; templateId?: string | null }): Promise<{ taskId: string }>{
  return apiFetch('/notes/enrich', { method: 'POST', body: JSON.stringify(payload) });
}
export async function generateNote(payload: { sessionId: string; templateId?: string | null }): Promise<{ taskId: string }>{
  return apiFetch('/notes/generate', { method: 'POST', body: JSON.stringify(payload) });
}

// Tasks
export type TaskStatus = { taskId: string; status: string; result_content?: Record<string, unknown> | null };
export async function getTask(taskId: string): Promise<TaskStatus>{
  return apiFetch(`/tasks/${taskId}`);
}

// Templates
export type TemplateRead = { id: string; name: string; prompt: string; is_system_template: boolean; user_id?: string | null };
export async function listTemplates(): Promise<TemplateRead[]>{
  return apiFetch('/templates');
}
export async function createTemplate(payload: { name: string; prompt: string }): Promise<TemplateRead>{
  return apiFetch('/templates', { method: 'POST', body: JSON.stringify(payload) });
}
export async function updateTemplate(templateId: string, payload: { name?: string; prompt?: string }): Promise<TemplateRead>{
  return apiFetch(`/templates/${templateId}`, { method: 'PUT', body: JSON.stringify(payload) });
}
export async function deleteTemplate(templateId: string): Promise<void>{
  await apiFetch(`/templates/${templateId}`, { method: 'DELETE' });
}

// Feedback
export async function submitFeedback(payload: { noteId: string; blockId?: string; originalText?: string; correctedText?: string; feedbackType: string }): Promise<{ feedbackId: string; traceId?: string; scored: boolean }>{
  return apiFetch('/feedback', { method: 'POST', body: JSON.stringify(payload) });
}

// Users usage
export async function getUsageSummary(): Promise<{ periodStart: string; periodEnd: string; maxAudioMinutesPerMonth: number; usedAudioMinutes: number; remainingAudioMinutes: number }>{
  return apiFetch('/users/me/usage/summary');
}
export async function getUsageDaily(params?: { start_date?: string; end_date?: string }): Promise<{ data: Array<{ date: string; usage_seconds: number }> }>{
  const usp = new URLSearchParams();
  if (params?.start_date) usp.set('start_date', params.start_date);
  if (params?.end_date) usp.set('end_date', params.end_date);
  const qs = usp.toString();
  return apiFetch(`/users/me/usage/daily${qs ? `?${qs}` : ''}`);
}

// Invitations
export async function createInvitation(): Promise<{ invitationUrl: string; token: string }>{
  return apiFetch('/invitations', { method: 'POST' });
}


