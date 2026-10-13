import { Suspense } from 'react';
import { api, Job } from '@/lib/api';

// Componente que carga las ofertas (con fetch)
async function JobList() {
  let jobs: Job[] = [];
  let error: string | null = null;

  try {
    const data = await api.getJobs();
    jobs = data.ofertas;
  } catch (e: any) {
    error = e.message;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        <strong>Error al cargar ofertas:</strong> {error}
        <p className="text-sm mt-1">
          Verifica que el backend esté corriendo en http://localhost:3000
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="text-gray-700 mb-6">
        <strong>{jobs.length}</strong> ofertas activas
      </p>

      <div className="grid gap-4">
        {jobs.map((job) => (
          <article
            key={job.id}
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
          >
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-xl font-semibold text-gray-900">
                {job.title}
              </h2>
              <span className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                {job.job_type === 'company_internship' && 'Práctica empresa'}
                {job.job_type === 'research_project' && 'Investigación'}
                {job.job_type === 'alumni_opportunity' && 'Oportunidad egresado'}
              </span>
            </div>

            <p className="text-gray-700 mb-3 line-clamp-2">
              {job.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              {job.tags?.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex justify-between text-sm text-gray-500">
              <span>
                {job.company_name || job.publisher_name}
                {job.verification_status === 'verified' && (
                  <span className="ml-2 text-green-600">✅ Verificado</span>
                )}
              </span>
              <span>
                {job.location} · {job.duration_months} meses
                {job.is_paid && ' · Remunerado'}
              </span>
            </div>
          </article>
        ))}

        {jobs.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No hay ofertas disponibles por ahora.
          </p>
        )}
      </div>
    </>
  );
}

// Placeholder mientras carga
function LoadingJobs() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white p-6 rounded-lg shadow animate-pulse"
        >
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
}

// Página principal
export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Prácticas IE
          </h1>
          <p className="text-lg text-gray-600">
            Plataforma de prácticas pre profesionales para Ingeniería Industrial
          </p>
        </header>

        <Suspense fallback={<LoadingJobs />}>
          <JobList />
        </Suspense>
      </div>
    </main>
  );
}