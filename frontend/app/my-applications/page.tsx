'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, Application } from '@/lib/api';

export default function MyApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = api.getCurrentUser();
    const token = api.getToken();

    if (!user || !token) {
      router.push('/login');
      return;
    }

    if (user.role !== 'student') {
      setError('Solo los estudiantes pueden ver esta página.');
      setLoading(false);
      return;
    }

    api
      .getMyApplications()
      .then((data) => {
        setApplications(data.postulaciones);
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
      submitted: { label: 'Enviada', className: 'bg-blue-100 text-blue-800' },
      reviewed: { label: 'En revisión', className: 'bg-yellow-100 text-yellow-800' },
      accepted: { label: 'Aceptada', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rechazada', className: 'bg-red-100 text-red-800' },
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

  function getTypeLabel(type: string) {
    return {
      company_internship: 'Práctica empresa',
      research_project: 'Investigación',
      alumni_opportunity: 'Oportunidad egresado',
    }[type] || type;
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
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mis postulaciones
          </h1>
          <p className="text-gray-600">
            Historial de ofertas a las que has postulado
          </p>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {!error && applications.length === 0 && (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <p className="text-gray-500 mb-4">
              Todavía no has postulado a ninguna oferta.
            </p>
            <Link
              href="/"
              className="text-blue-600 hover:underline font-medium"
            >
              Ver ofertas disponibles →
            </Link>
          </div>
        )}

        {applications.length > 0 && (
          <>
            <p className="text-gray-700 mb-4">
              <strong>{applications.length}</strong>{' '}
              {applications.length === 1 ? 'postulación' : 'postulaciones'}
            </p>

            <div className="grid gap-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <Link
                        href={`/jobs/${app.job_id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {app.title}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">
                        {app.publisher_name}
                        {app.location && ` · ${app.location}`}
                      </p>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>

                  <div className="flex justify-between text-xs text-gray-500 mt-4">
                    <span>
                      <span className="px-2 py-0.5 bg-gray-100 rounded">
                        {getTypeLabel(app.job_type)}
                      </span>
                    </span>
                    <span>
                      Postulaste el{' '}
                      {new Date(app.created_at).toLocaleDateString('es-PE')}
                    </span>
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