import { Suspense } from 'react';
import Link from 'next/link';
import { api, Job } from '@/lib/api';
import FilterBar from '@/components/FilterBar';

const PAGE_SIZE = 5;

async function JobList({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const currentPage = parseInt(
    typeof params.page === 'string' ? params.page : '1'
  ) || 1;

  let jobs: Job[] = [];
  let totalPages = 1;
  let total = 0;
  let error: string | null = null;

  try {
    const data = await api.getJobs({
      tag: typeof params.tag === 'string' ? params.tag : undefined,
      job_type: typeof params.job_type === 'string' ? params.job_type : undefined,
      paid: typeof params.paid === 'string' ? params.paid : undefined,
      search: typeof params.search === 'string' ? params.search : undefined,
      page: String(currentPage),
      limit: String(PAGE_SIZE),
    });
    jobs = data.ofertas;
    total = data.total;
    totalPages = data.total_pages || 1;
  } catch (e: any) {
    error = e.message;
  }

  // Función auxiliar para construir URL con los filtros actuales
  function buildPageUrl(newPage: number) {
    const urlParams = new URLSearchParams();
    if (params.tag) urlParams.set('tag', String(params.tag));
    if (params.job_type) urlParams.set('job_type', String(params.job_type));
    if (params.paid) urlParams.set('paid', String(params.paid));
    if (params.search) urlParams.set('search', String(params.search));
    if (newPage > 1) urlParams.set('page', String(newPage));
    const qs = urlParams.toString();
    return qs ? `/?${qs}` : '/';
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
        <strong>{total}</strong>{' '}
        {total === 1 ? 'oferta encontrada' : 'ofertas encontradas'}
        {totalPages > 1 && (
          <span className="text-gray-500 ml-2">
            · Página {currentPage} de {totalPages}
          </span>
        )}
      </p>

      <div className="grid gap-4">
        {jobs.map((job) => (
          <Link
            key={job.id}
            href={`/jobs/${job.id}`}
            className="block bg-white p-6 rounded-lg shadow hover:shadow-md transition"
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
          </Link>
        ))}

        {jobs.length === 0 && (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <p className="text-gray-500">
              No se encontraron ofertas con esos filtros.
            </p>
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          {currentPage > 1 ? (
            <Link
              href={buildPageUrl(currentPage - 1)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              ← Anterior
            </Link>
          ) : (
            <span className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-400 cursor-not-allowed">
              ← Anterior
            </span>
          )}

          <span className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </span>

          {currentPage < totalPages ? (
            <Link
              href={buildPageUrl(currentPage + 1)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Siguiente →
            </Link>
          ) : (
            <span className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-400 cursor-not-allowed">
              Siguiente →
            </span>
          )}
        </div>
      )}
    </>
  );
}

function LoadingJobs() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
}

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
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

        <Suspense
          fallback={
            <div className="h-40 bg-gray-100 rounded-lg animate-pulse"></div>
          }
        >
          <FilterBar />
        </Suspense>

        <Suspense fallback={<LoadingJobs />}>
          <JobList searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}