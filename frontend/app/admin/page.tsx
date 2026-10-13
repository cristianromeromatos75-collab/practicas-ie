'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, Job } from '@/lib/api';

export default function AdminPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  async function loadPending() {
    try {
      const data = await api.getPendingJobs();
      setJobs(data.ofertas);
    } catch (e: any) {
      setError(e.message);
    }
  }

  useEffect(() => {
    const user = api.getCurrentUser();
    const token = api.getToken();

    if (!user || !token) {
      router.push('/login');
      return;
    }

    if (user.role !== 'admin') {
      setError('Solo los administradores pueden ver esta página.');
      setLoading(false);
      return;
    }

    loadPending().finally(() => setLoading(false));
  }, [router]);

  async function handleApprove(jobId: number) {
    setActionLoading(jobId);
    try {
      await api.approveJob(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(jobId: number) {
    setActionLoading(jobId);
    try {
      await api.rejectJob(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Panel de Administrador
          </h1>
          <p className="text-gray-600">
            Revisa y aprueba ofertas marcadas como sospechosas
          </p>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {!error && jobs.length === 0 && (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <p className="text-gray-500 text-lg mb-2">
              ✅ No hay ofertas pendientes de revisión
            </p>
            <p className="text-sm text-gray-400">
              Todas las ofertas han sido revisadas.
            </p>
          </div>
        )}

        {jobs.length > 0 && (
          <>
            <p className="text-gray-700 mb-4">
              <strong>{jobs.length}</strong>{' '}
              {jobs.length === 1
                ? 'oferta pendiente de revisión'
                : 'ofertas pendientes de revisión'}
            </p>

            <div className="grid gap-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-400"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {job.title}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Publicado por{' '}
                        <strong>{job.company_name || job.publisher_name}</strong>
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium">
                      Pendiente
                    </span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded mb-3">
                    <p className="text-sm text-gray-700">{job.description}</p>
                  </div>

                  {job.tags && job.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-4">
                    <span>
                      Tipo:{' '}
                      <strong>
                        {job.job_type === 'company_internship' && 'Práctica empresa'}
                        {job.job_type === 'research_project' && 'Investigación'}
                        {job.job_type === 'alumni_opportunity' && 'Oportunidad egresado'}
                      </strong>
                    </span>
                    {job.location && (
                      <span>
                        Ubicación: <strong>{job.location}</strong>
                      </span>
                    )}
                    {job.duration_months && (
                      <span>
                        Duración: <strong>{job.duration_months} meses</strong>
                      </span>
                    )}
                    <span>
                      Publicado:{' '}
                      <strong>
                        {new Date(job.created_at).toLocaleDateString('es-PE')}
                      </strong>
                    </span>
                  </div>

                  <div className="flex gap-3 pt-3 border-t">
                    <button
                      onClick={() => handleApprove(job.id)}
                      disabled={actionLoading === job.id}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                      {actionLoading === job.id ? 'Procesando...' : '✅ Aprobar'}
                    </button>
                    <button
                      onClick={() => handleReject(job.id)}
                      disabled={actionLoading === job.id}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                      {actionLoading === job.id ? 'Procesando...' : '❌ Rechazar'}
                    </button>
                    <Link
                      href={`/jobs/${job.id}`}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                    >
                      Ver detalle
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}