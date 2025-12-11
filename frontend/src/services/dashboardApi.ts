/**
 * Dashboard API Service
 * Backend ile iletişim için tüm API çağrıları
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Helper function to handle responses
async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }));
    throw new Error(error.error || error.detail || 'Request failed');
  }
  return response.json();
}

// ===== AUTHENTICATION =====

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  company_name: string;
  website?: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface Profile {
  id: number;
  email: string;
  full_name: string;
  company_name: string;
  website: string;
  phone: string;
  logo: string | null;
  api_key: string;
  api_key_created_at: string;
  api_key_last_used: string | null;
  plan: 'free' | 'starter' | 'growth' | 'enterprise';
  credits_total: number;
  credits_used: number;
  credits_remaining: number;
  credits_percentage: number;
  // Backward compatibility (deprecated)
  quota_monthly?: number;
  quota_used_this_month?: number;
  quota_remaining?: number;
  quota_percentage?: number;
  quota_reset_date?: string;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

// Backward compatibility alias
export type Company = Profile;

export async function register(data: RegisterData): Promise<{ message: string; company: Company }> {
  const response = await fetch(`${API_BASE_URL}/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Important for session cookies
    body: JSON.stringify(data),
  });
  const result = await handleResponse(response);
  // Map profile to company for backward compatibility
  return { ...result, company: result.profile || result.company };
}

export async function login(data: LoginData): Promise<{ message: string; company: Company }> {
  const response = await fetch(`${API_BASE_URL}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Important for session cookies
    body: JSON.stringify(data),
  });
  const result = await handleResponse(response);
  // Map profile to company for backward compatibility
  return { ...result, company: result.profile || result.company };
}

export async function logout(): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/logout/`, {
    method: 'POST',
    credentials: 'include',
  });
  return handleResponse(response);
}

export async function getMe(): Promise<Company> {
  const response = await fetch(`${API_BASE_URL}/auth/me/`, {
    credentials: 'include',
  });
  return handleResponse(response);
}

export async function updateProfile(data: Partial<Profile>): Promise<{ message: string; profile: Profile }> {
  const response = await fetch(`${API_BASE_URL}/auth/update/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const result = await handleResponse(response);
  // Map profile to company for backward compatibility
  return { ...result, company: result.profile };
}

export async function uploadLogo(file: File): Promise<{ message: string; profile: Profile }> {
  const formData = new FormData();
  formData.append('logo', file);
  
  const response = await fetch(`${API_BASE_URL}/auth/upload-logo/`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const result = await handleResponse(response);
  // Map profile to company for backward compatibility
  return { ...result, company: result.profile };
}

export async function regenerateApiKey(): Promise<{ message: string; api_key: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/regenerate-key/`, {
    method: 'POST',
    credentials: 'include',
  });
  return handleResponse(response);
}

// ===== DASHBOARD =====

export interface DashboardStats {
  total_sessions: number;
  completed_sessions: number;
  active_sessions: number;
  total_duration_minutes: number;
  average_duration_minutes: number;
  sessions_today: number;
  sessions_this_week: number;
  sessions_this_month: number;
}

export interface DailyUsage {
  date: string;
  count: number;
  total_duration_minutes: number;
}

export interface Session {
  token: string;
  external_id: string;
  status: 'pending' | 'active' | 'completed' | 'expired';
  duration_seconds: number;
  duration_minutes: number;
  created_at: string;
  completed_at: string | null;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${API_BASE_URL}/dashboard/stats/`, {
    credentials: 'include',
  });
  return handleResponse(response);
}

export async function getUsageChart(period: 'week' | 'month' = 'week'): Promise<DailyUsage[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/usage-chart/?period=${period}`, {
    credentials: 'include',
  });
  return handleResponse(response);
}

export async function getSessions(limit = 20): Promise<{ count: number; sessions: Session[] }> {
  const response = await fetch(`${API_BASE_URL}/dashboard/sessions/?limit=${limit}`, {
    credentials: 'include',
  });
  return handleResponse(response);
}

export interface SessionDetail {
  token: string;
  external_id: string;
  status: 'pending' | 'active' | 'completed' | 'expired';
  duration_seconds: number;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
  accessed_at: string | null;
  completed_at: string | null;
  expires_at: string;
  is_expired: boolean;
  is_accessible: boolean;
  interview_link: string;
  ats_data_endpoint: string;
  ats_webhook_url: string;
  ats_api_token_masked: string | null;
  webhook_retry_count: number;
  last_webhook_attempt: string | null;
  webhook_last_error: string;
  has_temp_report: boolean;
  temp_report_expires_at: string | null;
}

export async function getSessionDetail(token: string): Promise<SessionDetail> {
  const response = await fetch(`${API_BASE_URL}/dashboard/sessions/${token}/`, {
    credentials: 'include',
  });
  return handleResponse(response);
}

