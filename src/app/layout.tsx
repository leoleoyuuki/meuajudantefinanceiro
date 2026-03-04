import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { BottomNav } from '@/components/bottom-nav';

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
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={cn('font-body antialiased', fontBody.variable, fontHeadline.variable)}>
        <div className="relative flex min-h-screen w-full flex-col bg-secondary/50">
          <div className="container mx-auto max-w-lg flex-1 bg-background shadow-lg">
            <main className="pb-28">{children}</main>
          </div>
          <BottomNav />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
