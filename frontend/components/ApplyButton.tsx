'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import ApplyModal from './ApplyModal';

interface ApplyButtonProps {
  jobId: number;
  jobTitle: string;
}

export default function ApplyButton({ jobId, jobTitle }: ApplyButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  function handleClick() {
    const user = api.getCurrentUser();
    const token = api.getToken();

    if (!user || !token) {
      router.push('/login');
      return;
    }

    if (user.role !== 'student') {
      setErrorMsg(
        'Solo los estudiantes pueden postular a ofertas. Tu cuenta es de tipo ' +
          (user.role === 'company' ? 'empresa' : 'mentor') +
          '.'
      );
      return;
    }

    setErrorMsg('');
    setShowModal(true);
  }

  async function handleSubmit(message: string) {
    setLoading(true);
    try {
      await api.applyToJob(jobId, message);
      setShowModal(false);
      setSuccess(true);
    } catch (e: any) {
      // El error lo maneja el modal
      throw e;
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        <strong>✅ ¡Postulación enviada exitosamente!</strong>
        <p className="text-sm mt-1">
          El publicador de la oferta podrá ver tu postulación.
        </p>
      </div>
    );
  }

  return (
    <div>
      {errorMsg && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-3 text-sm">
          {errorMsg}
        </div>
      )}

      <button
        onClick={handleClick}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-6 rounded-lg transition"
      >
        {loading ? 'Enviando postulación...' : 'Postular a esta oferta'}
      </button>

      <p className="text-sm text-gray-500 mt-2">
        Debes iniciar sesión como estudiante para postular.
      </p>

      {showModal && (
        <ApplyModal
          jobTitle={jobTitle}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}