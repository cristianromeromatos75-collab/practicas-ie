'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { api, User } from '@/lib/api';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(api.getCurrentUser());
  }, []);

  // Re-leer el usuario cada vez que cambie la ruta
  useEffect(() => {
    setUser(api.getCurrentUser());
  }, [pathname]);

  // Escuchar el evento personalizado 'auth-change'
  useEffect(() => {
    function handleAuthChange() {
      setUser(api.getCurrentUser());
    }
    window.addEventListener('auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  function handleLogout() {
    api.logout();
    setUser(null);
    router.push('/');
    router.refresh();
  }

  if (!mounted) {
    return (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Prácticas IE
          </Link>
          <div className="w-32"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-gray-900">
          Prácticas IE
        </Link>

        <nav className="flex items-center gap-4">
      {user ? (
  <>
    {user.role === 'student' && (
      <Link
        href="/my-applications"
        className="text-sm text-gray-700 hover:text-blue-600 transition"
      >
        Mis postulaciones
      </Link>
    )}
    <span className="text-sm text-gray-600">
      Hola, <strong>{user.full_name}</strong>
      <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 rounded">
        {user.role === 'student' && 'Estudiante'}
        {user.role === 'company' && 'Empresa'}
        {user.role === 'mentor' && 'Mentor'}
      </span>
    </span>
    <button
      onClick={handleLogout}
      className="text-sm text-gray-600 hover:text-red-600 transition"
    >
      Cerrar sesión
    </button>
  </>
) : (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-700 hover:text-blue-600 transition"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}