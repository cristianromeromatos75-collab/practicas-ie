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
};