
import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LifeBuoy,
  Smartphone,
  ArrowDownToLine,
  Share,
  PlusSquare,
  MessageCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function HelpPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Ajuda e Suporte" />
      <div className="md:hidden">
        <h1 className="font-headline text-xl font-bold">Ajuda e Suporte</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Smartphone />
            Instale o App no seu Celular (PWA)
          </CardTitle>
          <CardDescription>
            Tenha acesso rápido ao Meu Ajudante Financeiro direto da sua tela
            inicial.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Para iPhone (iOS)</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>
                Abra o site no navegador <strong>Safari</strong>.
              </li>
              <li>
                Toque no ícone de <strong>Compartilhar</strong>{' '}
                <Share className="inline-block size-4" /> na barra inferior.
              </li>
              <li>
                Role para baixo e selecione a opção{' '}
                <strong>"Adicionar à Tela de Início"</strong>{' '}
                <PlusSquare className="inline-block size-4" />.
              </li>
              <li>Confirme o nome do app e toque em "Adicionar".</li>
            </ol>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Para Android</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>
                Abra o site no navegador <strong>Chrome</strong>.
              </li>
              <li>
                Toque nos três pontos no canto superior direito para abrir o
                menu.
              </li>
              <li>
                Selecione a opção <strong>"Instalar aplicativo"</strong> ou{' '}
                <strong>"Adicionar à tela inicial"</strong>{' '}
                <ArrowDownToLine className="inline-block size-4" />.
              </li>
              <li>Siga as instruções na tela para confirmar a instalação.</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <LifeBuoy />
            Suporte
          </CardTitle>
          <CardDescription>
            Precisa de ajuda? Entre em contato conosco.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full sm:w-auto">
            <Link
              href="https://wa.me/5511957211546"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="mr-2 size-4" />
              Entrar em contato via WhatsApp
            </Link>
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            Nosso número para contato é: (11) 95721-1546.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
