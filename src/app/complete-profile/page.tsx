'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PiggyBank, Loader2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const profileSchema = z.object({
  whatsapp: z
    .string()
    .min(10, { message: 'Por favor, insira um WhatsApp válido.' }),
  initialBalance: z.coerce.number().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function CompleteProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { whatsapp: '', initialBalance: undefined },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user || !firestore) return;
    setIsLoading(true);

    const userRef = doc(firestore, 'users', user.uid);

    try {
      await updateDoc(userRef, {
        whatsapp: data.whatsapp,
        initialBalance: data.initialBalance || 0,
        updatedAt: new Date().toISOString(),
      });
      toast({
        title: 'Perfil atualizado!',
        description: 'Suas informações foram salvas.',
      });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar perfil',
        description:
          'Não foi possível salvar suas informações. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
            <PiggyBank className="size-8 text-primary" />
          </div>
          <CardTitle className="font-headline text-2xl">Quase lá!</CardTitle>
          <CardDescription>
            Por favor, complete seu perfil para continuar.
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
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="initialBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Saldo Inicial (Opcional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                          R$
                        </span>
                        <Input
                          type="number"
                          placeholder="0,00"
                          {...field}
                          value={field.value ?? ''}
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Seu ponto de partida para o fluxo de caixa do plano
                      empreendedor.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Salvar e continuar
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
