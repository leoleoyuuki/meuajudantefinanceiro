import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import AuthWrapper from '@/components/auth-wrapper';

const fontBody = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const fontHeadline = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-headline',
});

export const metadata: Metadata = {
  title: 'Meu Ajudante Financeiro',
  description: 'Seu assistente pessoal para uma vida financeira organizada.',
  manifest: '/manifest.json',
  icons: {
    apple: '/icon.png',
  },
  themeColor: '#6D28D9',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={cn(
          'font-body antialiased',
          fontBody.variable,
          fontHeadline.variable
        )}
      >
        <FirebaseClientProvider>
          <AuthWrapper>{children}</AuthWrapper>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
