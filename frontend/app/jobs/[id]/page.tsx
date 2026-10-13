import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';

export const instant = false;

// Componente que carga el detalle (con fetch)
async function JobDetail({ id }: { id: string }) {
  let job;
  try {
    const data = await api.getJob(Number(id));
    job = data.job;
  } catch (e: any) {
    notFound();
  }

  const typeLabel =
    {
      company_internship: 'Práctica empresa',
      research_project: 'Investigación',
      alumni_opportunity: 'Oportunidad egresado',
    }[job.job_type] || job.job_type;

  return (
    <article className="bg-white p-8 rounded-lg shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {job.title}
          </h1>
          <p className="text-gray-600">
            {job.company_name || job.publisher_name}
            {job.verification_status === 'verified' && (
              <span className="ml-2 text-green-600">✅ Verificado</span>
            )}
          </p>
        </div>
        <span className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
          {typeLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6 p-4 bg-gray-50 rounded">
        <div>
          <p className="text-xs text-gray-500 uppercase">Ubicación</p>
          <p className="font-medium">{job.location || 'No especificada'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase">Duración</p>
          <p className="font-medium">
            {job.duration_months
              ? `${job.duration_months} meses`
              : 'No especificada'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase">Remuneración</p>
          <p className="font-medium">
            {job.is_paid ? 'Remunerado' : 'No remunerado'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase">Publicado</p>
          <p className="font-medium">
            {new Date(job.created_at).toLocaleDateString('es-PE')}
          </p>
        </div>
      </div>

      {job.tags && job.tags.length > 0 && (
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">Áreas relacionadas:</p>
          <div className="flex flex-wrap gap-2">
            {job.tags.map((tag) => (
              <span
                key={tag}
                className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Descripción
        </h2>
        <p className="text-gray-700 whitespace-pre-line">
          {job.description}
        </p>
      </div>

      <div className="border-t pt-6">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition">
          Postular a esta oferta
        </button>
        <p className="text-sm text-gray-500 mt-2">
          Debes iniciar sesión como estudiante para postular.
        </p>
      </div>
    </article>
  );
}

// Placeholder mientras carga
function LoadingDetail() {
  return (
    <div className="bg-white p-8 rounded-lg shadow animate-pulse">
      <div className="h-10 bg-gray-200 rounded w-2/3 mb-4"></div>
      <div className="h-5 bg-gray-200 rounded w-1/3 mb-6"></div>
      <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
    </div>
  );
}
// Página principal
export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="text-blue-600 hover:underline mb-6 inline-block"
        >
          ← Volver a todas las ofertas
        </Link>

        <Suspense fallback={<LoadingDetail />}>
          <JobDetail id={id} />
        </Suspense>
      </div>
    </main>
  );
}