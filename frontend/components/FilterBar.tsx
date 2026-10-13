'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const AVAILABLE_TAGS = [
  { value: 'lean', label: 'Lean' },
  { value: 'mejora-continua', label: 'Mejora Continua' },
  { value: 'calidad', label: 'Calidad' },
  { value: 'supply-chain', label: 'Supply Chain' },
  { value: 'produccion', label: 'Producción' },
  { value: 'ergonomia', label: 'Ergonomía' },
  { value: 'logistica', label: 'Logística' },
  { value: 'seguridad-industrial', label: 'Seguridad' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'automatizacion', label: 'Automatización' },
];

const JOB_TYPES = [
  { value: 'company_internship', label: 'Práctica empresa' },
  { value: 'research_project', label: 'Investigación' },
  { value: 'alumni_opportunity', label: 'Oportunidad egresado' },
];

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentTag = searchParams.get('tag') || '';
  const currentType = searchParams.get('job_type') || '';
  const currentPaid = searchParams.get('paid') || '';
  const currentSearch = searchParams.get('search') || '';

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/?${params.toString()}`);
  }

  function clearFilters() {
    router.push('/');
  }

  const hasFilters = currentTag || currentType || currentPaid || currentSearch;

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      {/* Barra de búsqueda */}
      <div className="mb-4">
        <input
          type="text"
          defaultValue={currentSearch}
          placeholder="Buscar por título o descripción..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              updateFilter('search', e.currentTarget.value);
            }
          }}
          onBlur={(e) => {
            if (e.currentTarget.value !== currentSearch) {
              updateFilter('search', e.currentTarget.value);
            }
          }}
        />
      </div>

      {/* Etiquetas */}
      <div className="mb-4">
        <p className="text-xs font-medium text-gray-500 uppercase mb-2">
          Áreas
        </p>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_TAGS.map((tag) => (
            <button
              key={tag.value}
              onClick={() =>
                updateFilter('tag', currentTag === tag.value ? '' : tag.value)
              }
              className={`text-sm px-3 py-1 rounded transition ${
                currentTag === tag.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tipo y remuneración */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500 uppercase">
            Tipo:
          </label>
          <select
            value={currentType}
            onChange={(e) => updateFilter('job_type', e.target.value)}
            className="text-sm px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos</option>
            {JOB_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500 uppercase">
            Remuneración:
          </label>
          <select
            value={currentPaid}
            onChange={(e) => updateFilter('paid', e.target.value)}
            className="text-sm px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas</option>
            <option value="true">Remuneradas</option>
            <option value="false">No remuneradas</option>
          </select>
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="ml-auto text-sm text-red-600 hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}