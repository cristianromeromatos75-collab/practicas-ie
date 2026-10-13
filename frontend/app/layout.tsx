import type { Metadata } from 'next';
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
        <Header />
        {children}
      </body>
    </html>
  );
}