const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `Error ${res.status}`);
  }

  return res.json();
}

export interface Job {
  id: number;
  title: string;
  description: string;
  tags: string[];
  job_type: 'company_internship' | 'research_project' | 'alumni_opportunity';
  location: string | null;
  duration_months: number | null;
  is_paid: boolean;
  status: string;
  created_at: string;
  publisher_id: number;
  publisher_name: string;
  publisher_role: string;
  company_name: string | null;
  verification_status: string | null;
}

export interface JobsResponse {
  total: number;
  ofertas: Job[];
}

export interface User {
  id: number;
  email: string;
  role: 'student' | 'company' | 'mentor';
  full_name: string;
  is_verified: boolean;
}

export interface LoginResponse {
  mensaje: string;
  user: User;
  token: string;
}

export interface RegisterResponse {
  mensaje: string;
  user: User;
  token: string;
}

export const api = {
  async getJobs(filters?: {
    tag?: string;
    job_type?: string;
    location?: string;
    paid?: string;
    search?: string;
  }): Promise<JobsResponse> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchAPI<JobsResponse>(`/jobs${query}`);
  },

  async getJob(id: number) {
    return fetchAPI<{ job: Job }>(`/jobs/${id}`);
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    const data = await fetchAPI<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  async register(payload: {
    email: string;
    password: string;
    role: 'student' | 'company' | 'mentor';
    full_name: string;
    company_name?: string;
    ruc?: string;
  }): Promise<RegisterResponse> {
    const data = await fetchAPI<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  },

  async applyToJob(jobId: number, message?: string) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No estás autenticado');
    }
    return fetchAPI<any>(`/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message: message || '' }),
    });
  },
};