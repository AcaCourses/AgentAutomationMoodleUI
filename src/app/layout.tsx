import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agente Moodle SEA Acatlán - Dashboard',
  description: 'Front-end para el backend de automatización y publicación de recursos en Moodle FES Acatlán UNAM.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
