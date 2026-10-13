'use client';

import { useState } from 'react';

interface ApplyModalProps {
  jobTitle: string;
  onClose: () => void;
  onSubmit: (message: string) => Promise<void>;
}

export default function ApplyModal({
  jobTitle,
  onClose,
  onSubmit,
}: ApplyModalProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit(message);
    } catch (e: any) {
      setError(e.message || 'Error al enviar la postulación');
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Postular a esta oferta
            </h2>
            <p className="text-sm text-gray-600 mt-1">{jobTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mensaje para el publicador (opcional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Cuéntale al publicador por qué te interesa esta oportunidad, tu experiencia relevante, etc."
            maxLength={1000}
          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            {message.length}/1000
          </p>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              {loading ? 'Enviando...' : 'Enviar postulación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}