import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ticketing Trans Hamana - Sistem Manajemen Tiket Berbasis AI',
  description: 'Aplikasi manajemen tiket helpdesk modern dengan klasifikasi otomatis berbasis AI, dashboard operator, dan penanganan teknisi.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
