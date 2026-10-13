'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, Job } from '@/lib/api';

export default function MyJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = api.getCurrentUser();
    const token = api.getToken();

    if (!user || !token) {
      router.push('/login');
      return;
    }

    if (user.role !== 'company' && user.role !== 'mentor') {
      setError('Solo empresas y mentores pueden ver esta página.');
      setLoading(false);
      return;
    }

    api
      .getMyJobs()
      .then((data) => {
        setJobs(data.ofertas);
      })
      .catch((e) => {
        setError(e.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  function getStatusBadge(status: string) {
    const config: Record<string, { label: string; className: string }> = {
      active: { label: 'Activa', className: 'bg-green-100 text-green-800' },
      pending: { label: 'Pendiente de revisión', className: 'bg-yellow-100 text-yellow-800' },
      rejected: { label: 'Rechazada', className: 'bg-red-100 text-red-800' },
      closed: { label: 'Cerrada', className: 'bg-gray-100 text-gray-700' },
    };
    const c = config[status] || {
      label: status,
      className: 'bg-gray-100 text-gray-700',
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.className}`}>
        {c.label}
      </span>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mis ofertas
            </h1>
            <p className="text-gray-600">
              Ofertas que has publicado
            </p>
          </div>
          <Link
            href="/my-jobs/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            + Publicar nueva oferta
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {!error && jobs.length === 0 && (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <p className="text-gray-500 mb-4">
              Todavía no has publicado ninguna oferta.
            </p>
            <Link
              href="/my-jobs/new"
              className="text-blue-600 hover:underline font-medium"
            >
              Publicar mi primera oferta →
            </Link>
          </div>
        )}

        {jobs.length > 0 && (
          <>
            <p className="text-gray-700 mb-4">
              <strong>{jobs.length}</strong>{' '}
              {jobs.length === 1 ? 'oferta' : 'ofertas'}
            </p>

            <div className="grid gap-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {job.title}
                    </Link>
                    {getStatusBadge(job.status)}
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {job.description}
                  </p>

                  <div className="flex justify-between items-center text-sm">
                    <div className="flex flex-wrap gap-2">
                      {job.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/my-jobs/${job.id}/applicants`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Ver postulantes →
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