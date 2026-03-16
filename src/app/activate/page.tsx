'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { KeyRound, Loader2, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { doc, runTransaction } from 'firebase/firestore';
import { addMonths, format } from 'date-fns';

const activationSchema = z.object({
  code: z
    .string()
    .min(10, { message: 'O código de ativação é muito curto.' }),
});

type ActivationFormValues = z.infer<typeof activationSchema>;

export default function ActivatePage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { auth, firestore } = useFirebase();

  const form = useForm<ActivationFormValues>({
    resolver: zodResolver(activationSchema),
    defaultValues: { code: '' },
  });

  const onSubmit = async (data: ActivationFormValues) => {
    if (!auth?.currentUser || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Erro de Autenticação',
        description: 'Você precisa estar logado para ativar uma assinatura.',
      });
      return;
    }
    setIsLoading(true);

    const userId = auth.currentUser.uid;
    const code = data.code;

    const codeRef = doc(firestore, 'activationCodes', code);
    const userProfileRef = doc(firestore, 'users', userId);

    try {
      const result = await runTransaction(firestore, async (transaction) => {
        const codeDoc = await transaction.get(codeRef);

        if (!codeDoc.exists()) {
          throw new Error('Código de ativação inválido.');
        }

        const codeData = codeDoc.data();
        if (codeData?.isUsed) {
          throw new Error('Este código já foi utilizado.');
        }

        const now = new Date();
        const expiresAt = addMonths(now, codeData?.durationMonths);

        const subscriptionUpdateData = {
          subscriptionStatus: 'active',
          subscriptionExpiresAt: expiresAt.toISOString(),
          subscriptionStartedAt: now.toISOString(),
          subscriptionSourceCode: code,
        };

        transaction.update(userProfileRef, subscriptionUpdateData);

        transaction.update(codeRef, {
          isUsed: true,
          usedBy: userId,
          usedAt: now.toISOString(),
        });

        return {
          success: true,
          message: `Sua assinatura está ativa até ${format(
            expiresAt,
            'dd/MM/yyyy'
          )}.`,
        };
      });

      if (result.success) {
        toast({
          title: 'Assinatura Ativada!',
          description: result.message,
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Falha na Ativação',
        description:
          error.message ||
          'Ocorreu um erro ao ativar a assinatura. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    if (auth) {
      signOut(auth).then(() => {
        window.location.href = '/login';
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="size-8 text-primary" />
          </div>
          <CardTitle className="font-headline text-2xl">
            Ativar Assinatura
          </CardTitle>
          <CardDescription>
            Insira seu código de ativação para liberar o acesso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código de Ativação</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Ativar Agora
              </Button>
            </form>
          </Form>

          <div className="my-6 text-center">
            <p className="text-sm text-muted-foreground">Não tem um código?</p>
            <Button variant="link" asChild className="px-1">
              <Link
                href="https://wa.me/5511957211546"
                target="_blank"
                rel="noopener noreferrer"
              >
                Compre um código de ativação
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="mt-4 text-center">
        <Button
          variant="link"
          size="sm"
          onClick={handleLogout}
          className="text-muted-foreground"
        >
          <LogOut className="mr-2" />
          Sair e usar outra conta
        </Button>
      </div>
    </div>
  );
}
