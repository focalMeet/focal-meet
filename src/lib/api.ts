import { getToken, clearToken } from './auth';
import { sha256Hex } from './crypto';

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
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log(`[API] Request to ${path} with token:`, token.substring(0, 20) + '...');
  } else {
    console.log(`[API] Request to ${path} without token`);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  console.log(`[API] Response status: ${res.status} for ${path}`);
  if (res.status === 307 || res.status === 308) {
    console.log(`[API] Redirect detected for ${path}, Location:`, res.headers.get('Location'));
  }
  if (res.status === 401) {
    console.log(`[API] 401 Unauthorized for ${path}, clearing token`);
    clearToken();
  }
  if (res.status === 403) {
    console.log(`[API] 403 Forbidden for ${path}, clearing token (permission error)`);
    clearToken();
  }
  const contentType = res.headers.get('content-type') || '';
  let data: any = null;
  try {
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text || null;
      }
    }
  } catch (e) {
    data = null;
  }
  if (!res.ok) {
    throw new ApiError(`Request failed: ${res.status}`, res.status, data);
  }
  return data as T;
}

// Auth
export async function login(username: string, password: string): Promise<{ access_token: string; token_type: string }>{
  const passwordHashed = await sha256Hex(password);
  const body = new URLSearchParams({ username, password: passwordHashed });
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const json = await res.json();
  if (!res.ok) throw new ApiError('Login failed', res.status, json);
  return json;
}

export async function register(payload: { email: string; password: string; invitation_token?: string | null }): Promise<{ id: string; email: string }> {
  const passwordHashed = await sha256Hex(payload.password);
  const body = { ...payload, password: passwordHashed };
  return apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) });
}

export async function me(): Promise<{ id: string; email: string }>{
  return apiFetch('/auth/users/me');
}

export async function logout(): Promise<{ success: boolean }>{
  return apiFetch('/auth/logout', { method: 'POST' });
}

// Sessions
export type SessionItem = { id: string; title: string; status: string; created_at: string; updated_at: string };
export async function listSessions(): Promise<SessionItem[]> {
  return apiFetch('/sessions/');
}

export type SessionCreated = { sessionId: string; noteId: string; transcriptId: string };
export async function createSession(): Promise<SessionCreated> {
  return apiFetch('/sessions/', { method: 'POST' });
}

export async function getSession(sessionId: string): Promise<SessionItem> {
  return apiFetch(`/sessions/${sessionId}`);
}

export async function getPublicSession(sessionId: string): Promise<SessionItem> {
  return apiFetch(`/sessions/public/${sessionId}`);
}

export async function uploadSessionAudio(sessionId: string, file: File): Promise<{ audioSourceId: string }>{
  const token = getToken();
  if (token) {
    console.log(`[API] Upload audio with token:`, token.substring(0, 20) + '...');
  } else {
    console.log(`[API] Upload audio without token`);
  }
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
  try {
    return await apiFetch('/templates/');
  } catch (err) {
    // Fallback mock data for early UI development
    const mock: TemplateRead[] = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'General Summary',
        prompt: 'Summarize the meeting into concise bullet points, highlighting key decisions and next steps.',
        is_system_template: true,
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Action Items Extractor',
        prompt: 'Extract clear action items with owners and due dates from the conversation.',
        is_system_template: true,
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'Custom: Weekly Sync Focus',
        prompt: 'Summarize our weekly sync focusing on blockers, progress, and priorities for next week.',
        is_system_template: false,
        user_id: 'mock-user-id',
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        name: 'Custom: Sales Call Notes',
        prompt: 'Capture prospect pain points, objections, competitors, budget, and next steps from the sales call.',
        is_system_template: false,
        user_id: 'mock-user-id',
      },
    ];
    return mock;
  }
}
export async function createTemplate(payload: { name: string; prompt: string }): Promise<TemplateRead>{
  return apiFetch('/templates/', { method: 'POST', body: JSON.stringify(payload) });
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
export async function getUsageSummary(): Promise<{
  periodStart: string;
  periodEnd: string;
  maxSessionsPerMonth: number;
  usedSessionsThisMonth: number;
  remainingSessionsThisMonth: number;
  maxSessionDurationMinutes: number;
  maxConcurrentSessions: number;
  currentRunningSessions: number;
  maxConcurrentTasks: number;
  currentRunningTasks: number;
  maxAiTasksPerMonth: number;
  copilotEnabled: boolean;
}>{
  return apiFetch('/users/me/usage/summary');
}
export async function getUsageDaily(params?: { start_date?: string; end_date?: string }): Promise<{ data: Array<{ date: string; usage_seconds: number }> }>{
  const usp = new URLSearchParams();
  if (params?.start_date) usp.set('start_date', params.start_date);
  if (params?.end_date) usp.set('end_date', params.end_date);
  const qs = usp.toString();
  return apiFetch(`/users/me/usage/daily${qs ? `?${qs}` : ''}`);
}

// Enhanced Sessions Management
export type SessionEnhanced = {
  id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  generation_type: string | null;
  enrichment_status: string;
  enrichment_completed_at: string | null;
  template_id: string | null;
  language: string;
  has_transcript: boolean;
  has_user_notes: boolean;
  sections_count: number;
  final_markdown_preview: string | null;
  audio_source_type: string | null;
  audio_duration: number | null;
};

export type SessionsListResponse = {
  sessions: SessionEnhanced[];
  total_count: number;
  page: number;
  page_size: number;
  has_next: boolean;
  statistics: {
    total_sessions: number;
    enriched_sessions: number;
    pending_sessions: number;
    failed_sessions: number;
  };
};

export type SessionSearchRequest = {
  query?: string;
  status?: string[];
  enrichment_status?: string[];
  generation_type?: string;
  date_from?: string;
  date_to?: string;
  has_transcript?: boolean;
  has_user_notes?: boolean;
  page?: number;
  page_size?: number;
};

export async function getEnhancedSessions(params?: {
  page?: number;
  page_size?: number;
  status_filter?: string;
  enrichment_status?: string;
}): Promise<SessionsListResponse> {
  const usp = new URLSearchParams();
  if (params?.page) usp.set('page', params.page.toString());
  if (params?.page_size) usp.set('page_size', params.page_size.toString());
  if (params?.status_filter) usp.set('status_filter', params.status_filter);
  if (params?.enrichment_status) usp.set('enrichment_status', params.enrichment_status);
  const qs = usp.toString();
  return apiFetch(`/sessions/enhanced${qs ? `?${qs}` : ''}`);
}

export async function searchSessions(searchRequest: SessionSearchRequest): Promise<SessionsListResponse> {
  return apiFetch('/sessions/search', { 
    method: 'POST', 
    body: JSON.stringify(searchRequest) 
  });
}

export async function getSessionStatistics(): Promise<{
  basic: { total_sessions: number; enriched_sessions: number; pending_sessions: number; failed_sessions: number };
  monthly: Array<{ month: string; count: number }>;
  generation_types: { [key: string]: number };
  audio_sources: { [key: string]: number };
  generated_at: string;
}> {
  return apiFetch('/sessions/statistics');
}

export async function getSessionSections(sessionId: string): Promise<{
  session_id: string;
  session_title: string;
  session_status: string;
  enrichment_status: string;
  generation_type: string | null;
  sections: Array<{
    id: string;
    title_text: string;
    title_level: number;
    section_order: number;
    points: any;
    created_at: string | null;
    updated_at: string | null;
  }>;
  total_sections: number;
  enrichment_completed_at: string | null;
}> {
  return apiFetch(`/sessions/${sessionId}/sections`);
}

export async function getEnhancedSession(sessionId: string): Promise<SessionEnhanced> {
  return apiFetch(`/sessions/${sessionId}/enhanced`);
}

export async function regenerateSmartNotes(
  sessionId: string, 
  generationType: 'enrich' | 'generate',
  templateId?: string
): Promise<{
  enrichment_id: string;
  session_id: string;
  generation_type: string;
  status: string;
  message: string;
}> {
  const usp = new URLSearchParams();
  usp.set('generation_type', generationType);
  if (templateId) usp.set('template_id', templateId);
  return apiFetch(`/sessions/${sessionId}/regenerate?${usp.toString()}`, { method: 'POST' });
}

// Smart Notes Generation
export type SmartNotesRequest = {
  template_id?: string;
  options?: {
    include_evidence?: boolean;
    language?: string;
    generate_summary?: boolean;
  };
};

export type EnrichmentResponse = {
  enrichment_id: string;
  generation_type: string;
  status: string;
  estimated_time?: number;
};

export type EnrichmentStatusResponse = {
  id: string;
  generation_type: string;
  status: string;
  progress?: number;
  processing_time?: number;
  created_sections_count?: number;
  final_markdown_preview?: string;
  error_message?: string;
};

export type SmartNotesResponse = {
  session_id: string;
  generation_type: string;
  template_id?: string;
  language: string;
  sections: any[];
  notes_alignment: any[];
  final_markdown: string;
  enrichment_completed_at?: string;
};

export async function startEnrichProcess(
  sessionId: string, 
  request: SmartNotesRequest
): Promise<EnrichmentResponse> {
  return apiFetch(`/sessions/${sessionId}/enrich`, {
    method: 'POST',
    body: JSON.stringify(request)
  });
}

export async function startGenerateProcess(
  sessionId: string, 
  request: SmartNotesRequest
): Promise<EnrichmentResponse> {
  return apiFetch(`/sessions/${sessionId}/generate`, {
    method: 'POST',
    body: JSON.stringify(request)
  });
}

export async function getEnrichmentStatus(
  sessionId: string, 
  enrichmentId: string
): Promise<EnrichmentStatusResponse> {
  return apiFetch(`/sessions/${sessionId}/enrichments/${enrichmentId}`);
}

export async function getSmartNotes(sessionId: string): Promise<SmartNotesResponse> {
  return apiFetch(`/sessions/${sessionId}/smart-notes`);
}

export async function getDifyStatus(): Promise<{
  dify_configured: boolean;
  enrich_available: boolean;
  generate_available: boolean;
  api_key_configured: boolean;
}> {
  return apiFetch('/sessions/config/dify-status');
}

// Smart Mode Recommendation
export type ModeRecommendation = {
  recommended_mode: string | null;
  confidence: number;
  reasoning: string[];
  both_available: boolean;
  mode_comparison: {
    enrich: { score: number; pros: string[]; cons: string[] };
    generate: { score: number; pros: string[]; cons: string[] };
  };
  user_notes_analysis: any;
  transcript_analysis: any;
};

export type ModeComparison = {
  session_id: string;
  both_modes_available: boolean;
  recommended_mode: string | null;
  confidence: number;
  reasoning: string[];
  detailed_comparison: any;
  capabilities: {
    enrich: {
      description: string;
      best_for: string[];
      features: string[];
    };
    generate: {
      description: string;
      best_for: string[];
      features: string[];
    };
  };
};

export async function getRecommendedMode(sessionId: string): Promise<ModeRecommendation> {
  return apiFetch(`/sessions/${sessionId}/recommend-mode`);
}

export async function getModeComparison(sessionId: string): Promise<ModeComparison> {
  return apiFetch(`/sessions/${sessionId}/mode-comparison`);
}

// Live Meeting WebSocket (helper for managing connection)
export class LiveMeetingConnection {
  private ws: WebSocket | null = null;
  private sessionId: string;
  private token: string;
  private listeners: { [key: string]: ((data: any) => void)[] } = {};

  constructor(sessionId: string, token: string) {
    this.sessionId = sessionId;
    this.token = token;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = `${API_BASE.replace('http', 'ws')}/live/meetings/${this.sessionId}/stream?token=${this.token}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[WebSocket] Connected to live meeting');
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.emit(message.type, message.data);
        } catch (e) {
          console.error('[WebSocket] Failed to parse message:', e);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Connection error:', error);
        reject(error);
      };

      this.ws.onclose = () => {
        console.log('[WebSocket] Connection closed');
        this.emit('disconnected', {});
      };
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  sendMessage(type: string, data: any = {}) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    }
  }

  startRecording(audioConfig?: any) {
    this.sendMessage('start_recording', { audio_config: audioConfig });
  }

  stopRecording() {
    this.sendMessage('stop_recording');
  }

  sendAudioChunk(audioData: string) {
    this.sendMessage('audio_chunk', { audio_data: audioData });
  }

  on(eventType: string, callback: (data: any) => void) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(callback);
  }

  off(eventType: string, callback: (data: any) => void) {
    if (this.listeners[eventType]) {
      this.listeners[eventType] = this.listeners[eventType].filter(cb => cb !== callback);
    }
  }

  private emit(eventType: string, data: any) {
    if (this.listeners[eventType]) {
      this.listeners[eventType].forEach(callback => callback(data));
    }
  }
}

// Invitations
export async function createInvitation(): Promise<{ invitationUrl: string; token: string }>{
  return apiFetch('/invitations/', { method: 'POST' });
}

export type InvitationUse = { used_by_user_id: string; used_at: string };
export type InvitationRead = { id: string; token: string; created_at: string | null; max_uses: number; used_count: number; remaining_uses: number; uses: InvitationUse[] };
export async function listMyInvitations(): Promise<{ data: InvitationRead[] }> {
  return apiFetch('/invitations/mine');
}


