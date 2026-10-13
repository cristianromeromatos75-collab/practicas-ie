'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, Applicant } from '@/lib/api';

function ApplicantsContent({ jobId }: { jobId: number }) {
  const router = useRouter();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
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
      .getJobApplicants(jobId)
      .then((data) => {
        setApplicants(data.postulantes);
      })
      .catch((e) => {
        setError(e.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [jobId, router]);

  function getStatusBadge(status: string) {
    const config: Record<string, { label: string; className: string }> = {
      submitted: { label: 'Nueva', className: 'bg-blue-100 text-blue-800' },
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

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {!error && applicants.length === 0 && (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <p className="text-gray-500">
            Todavía no hay postulantes para esta oferta.
          </p>
        </div>
      )}

      {applicants.length > 0 && (
        <>
          <p className="text-gray-700 mb-4">
            <strong>{applicants.length}</strong>{' '}
            {applicants.length === 1 ? 'postulante' : 'postulantes'}
          </p>

          <div className="grid gap-4">
            {applicants.map((app) => (
              <div
                key={app.id}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {app.full_name}
                    </h2>
                    <a
                      href={`mailto:${app.email}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {app.email}
                    </a>
                  </div>
                  {getStatusBadge(app.status)}
                </div>

                {app.message && (
                  <div className="bg-gray-50 p-4 rounded mt-3 mb-3">
                    <p className="text-xs text-gray-500 uppercase mb-1">
                      Mensaje del estudiante:
                    </p>
                    <p className="text-sm text-gray-700 italic">
                      "{app.message}"
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs text-gray-500 mt-3">
                  <span>
                    Postuló el{' '}
                    {new Date(app.created_at).toLocaleDateString('es-PE')}
                  </span>
                  <a
                    href={`mailto:${app.email}?subject=Postulación a tu práctica`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Contactar por email →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

export default function ApplicantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [jobId, setJobId] = useState<number | null>(null);

  useEffect(() => {
    params.then((p) => setJobId(Number(p.id)));
  }, [params]);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/my-jobs"
          className="text-blue-600 hover:underline mb-6 inline-block"
        >
          ← Volver a mis ofertas
        </Link>

        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Postulantes
          </h1>
          <p className="text-gray-600">
            Estudiantes que han postulado a esta oferta
          </p>
        </header>

        {jobId !== null && <ApplicantsContent jobId={jobId} />}
      </div>
    </main>
  );
}