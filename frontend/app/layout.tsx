import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Prácticas IE - Plataforma de prácticas para Ingeniería Industrial',
  description:
    'Encuentra prácticas pre profesionales en Ingeniería Industrial',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <Suspense
          fallback={
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
              <div className="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">
                  Prácticas IE
                </span>
                <div className="w-32"></div>
              </div>
            </header>
          }
        >
          <Header />
        </Suspense>
        {children}
      </body>
    </html>
  );
}