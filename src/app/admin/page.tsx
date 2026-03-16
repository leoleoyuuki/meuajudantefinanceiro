'use client';

import { PageHeader } from '@/components/page-header';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Copy, Shield, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateActivationCode } from '@/app/actions';

const ADMIN_EMAIL = 'leo.yuuki@icloud.com';

export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [duration, setDuration] = useState(1);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (!isUserLoading && user?.email !== ADMIN_EMAIL) {
      router.replace('/');
    }
  }, [user, isUserLoading, router]);

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    setGeneratedCode(null);
    setHasCopied(false);
    
    const result = await generateActivationCode(duration);
    
    if (result.success && result.code) {
      setGeneratedCode(result.code);
      toast({
        title: 'Código Gerado!',
        description: 'O novo código de ativação está pronto.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Erro ao gerar código',
        description: result.error || 'Ocorreu um erro inesperado.',
      });
    }
    setIsGenerating(false);
  };

  const handleCopyToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
      toast({
        title: 'Código Copiado!',
      });
    }
  };

  if (isUserLoading || user?.email !== ADMIN_EMAIL) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Painel do Administrador" />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="text-primary" />
            Gerador de Códigos de Ativação
          </CardTitle>
          <CardDescription>
            Crie novos códigos de ativação para os usuários.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="duration" className="text-sm font-medium">
                Duração da Assinatura (em meses)
              </label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min="1"
                className="mt-2"
              />
            </div>
            <Button onClick={handleGenerateCode} disabled={isGenerating}>
              {isGenerating && <Loader2 className="mr-2 animate-spin" />}
              Gerar Código
            </Button>
          </div>

          {generatedCode && (
            <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
              <p className="text-sm font-medium text-muted-foreground">Seu novo código:</p>
              <div className="flex items-center gap-4">
                <p className="flex-1 select-all break-all rounded-md bg-background p-2 font-mono text-sm">
                  {generatedCode}
                </p>
                <Button variant="outline" size="icon" onClick={handleCopyToClipboard}>
                  {hasCopied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
