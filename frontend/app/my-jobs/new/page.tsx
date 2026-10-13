'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

const AVAILABLE_TAGS = [
  { value: 'lean', label: 'Lean Manufacturing' },
  { value: 'mejora-continua', label: 'Mejora Continua' },
  { value: 'calidad', label: 'Control de Calidad' },
  { value: 'supply-chain', label: 'Cadena de Suministro' },
  { value: 'produccion', label: 'Producción' },
  { value: 'ergonomia', label: 'Ergonomía' },
  { value: 'factores-humanos', label: 'Factores Humanos' },
  { value: 'logistica', label: 'Logística' },
  { value: 'seguridad-industrial', label: 'Seguridad Industrial' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'automatizacion', label: 'Automatización' },
  { value: 'gestion-proyectos', label: 'Gestión de Proyectos' },
  { value: 'data-analytics', label: 'Data Analytics' },
  { value: 'sostenibilidad', label: 'Sostenibilidad' },
];

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alertas, setAlertas] = useState<string[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [jobType, setJobType] = useState<'company_internship' | 'research_project' | 'alumni_opportunity'>('company_internship');
  const [location, setLocation] = useState('');
  const [durationMonths, setDurationMonths] = useState<number>(6);
  const [isPaid, setIsPaid] = useState(true);

  function toggleTag(tag: string) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAlertas([]);
    setLoading(true);

    try {
      const result = await api.createJob({
        title,
        description,
        tags,
        job_type: jobType,
        location: location || undefined,
        duration_months: durationMonths,
        is_paid: isPaid,
      });

      // Si hay alertas (contenido sospechoso), mostrarlas antes de redirigir
      if (result.alertas && result.alertas.length > 0) {
        setAlertas(result.alertas);
        setLoading(false);
        // Redirigir después de 3 segundos
        setTimeout(() => router.push('/my-jobs'), 3000);
        return;
      }

      router.push('/my-jobs');
      router.refresh();
    } catch (e: any) {
      setError(e.message || 'Error al publicar la oferta');
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/my-jobs"
          className="text-blue-600 hover:underline mb-6 inline-block"
        >
          ← Volver a mis ofertas
        </Link>

        <div className="bg-white p-8 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Publicar nueva oferta
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          {alertas.length > 0 && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4">
              <strong>⚠️ Oferta creada pero marcada para revisión</strong>
              <p className="text-sm mt-1">
                Detectamos el siguiente contenido sospechoso que requiere revisión manual:
              </p>
              <ul className="text-sm mt-1 list-disc list-inside">
                {alertas.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
              <p className="text-xs mt-2">Redirigiendo a Mis ofertas...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título de la oferta *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={255}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Practicante de Mejora Continua"
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de oportunidad *
              </label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="company_internship">Práctica empresa</option>
                <option value="research_project">Proyecto de investigación</option>
                <option value="alumni_opportunity">Oportunidad egresado</option>
              </select>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe las actividades, responsabilidades y requisitos del practicante..."
              />
            </div>

            {/* Etiquetas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Áreas relacionadas ({tags.length} seleccionadas)
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.map((tag) => (
                  <button
                    key={tag.value}
                    type="button"
                    onClick={() => toggleTag(tag.value)}
                    className={`text-sm px-3 py-1 rounded transition ${
                      tags.includes(tag.value)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ubicación y duración */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Lima, Perú"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duración (meses)
                </label>
                <input
                  type="number"
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(Number(e.target.value))}
                  min={1}
                  max={24}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Remuneración */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_paid"
                checked={isPaid}
                onChange={(e) => setIsPaid(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="is_paid" className="text-sm text-gray-700">
                Esta práctica es remunerada
              </label>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                {loading ? 'Publicando...' : 'Publicar oferta'}
              </button>
              <Link
                href="/my-jobs"
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}