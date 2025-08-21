import type { Metadata } from 'next';
import { PatientProvider } from '@/context/PatientContext';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';

export const metadata: Metadata = {
  title: 'CuraTrack - Sistema de Gestión de Pacientes',
  description: 'Un sistema inteligente de gestión de pacientes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <PatientProvider>
          {children}
        </PatientProvider>
        <Toaster />
      </body>
    </html>
  );
}
