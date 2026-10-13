'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface ApplyButtonProps {
  jobId: number;
}

export default function ApplyButton({ jobId }: ApplyButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function handleClick() {
    const user = api.getCurrentUser();
    const token = api.getToken();

    // No autenticado → redirige a login
    if (!user || !token) {
      router.push('/login');
      return;
    }

    // No es estudiante → error
    if (user.role !== 'student') {
      setStatus('error');
      setErrorMsg(
        'Solo los estudiantes pueden postular a ofertas. Tu cuenta es de tipo ' +
          (user.role === 'company' ? 'empresa' : 'mentor') +
          '.'
      );
      return;
    }

    // Es estudiante → mostrar formulario de postulación
    setStatus('idle');
    setErrorMsg('');
    // Aquí podría abrirse un modal, pero para simplificar usamos un prompt
    const msg = prompt(
      'Opcional: escribe un mensaje para el publicador de la oferta'
    );
    submitApplication(msg || '');
  }

  async function submitApplication(msg: string) {
    setLoading(true);
    setStatus('idle');
    setErrorMsg('');

    try {
      await api.applyToJob(jobId, msg);
      setStatus('success');
      setMessage('¡Postulación enviada exitosamente!');
    } catch (e: any) {
      setStatus('error');
      setErrorMsg(e.message || 'Error al enviar la postulación');
    } finally {
      setLoading(false);
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        <strong>✅ {message}</strong>
        <p className="text-sm mt-1">
          El publicador de la oferta podrá ver tu postulación.
        </p>
      </div>
    );
  }

  return (
    <div>
      {status === 'error' && (
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
    </div>
  );
}