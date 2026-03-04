'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import {
  collection,
  doc,
  getDoc,
  increment,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

const goalFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Nome deve ter pelo menos 2 caracteres.',
  }),
  targetAmount: z.coerce.number().positive({
    message: 'O valor alvo deve ser positivo.',
  }),
  targetDate: z.date().optional(),
  description: z.string().optional(),
});

type GoalFormValues = z.infer<typeof goalFormSchema>;

export function GoalForm() {
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  async function onSubmit(data: GoalFormValues) {
    if (!user || !firestore) return;

    const collectionRef = collection(
      firestore,
      'users',
      user.uid,
      'financialGoals'
    );
    const docRef = doc(collectionRef);
    const docId = docRef.id;
    const now = new Date();

    const goalData = {
      id: docId,
      userId: user.uid,
      name: data.name,
      targetAmount: data.targetAmount,
      currentAmount: 0,
      startDate: now.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      ...(data.description && { description: data.description }),
      ...(data.targetDate && { targetDate: data.targetDate.toISOString() }),
    };

    setDocumentNonBlocking(docRef, goalData, {});

    try {
      const summaryRef = doc(
        firestore,
        'users',
        user.uid,
        'goalsSummaries',
        'summary'
      );
      const summarySnap = await getDoc(summaryRef);
      const nowStr = now.toISOString();

      if (summarySnap.exists()) {
        await updateDoc(summaryRef, {
          totalTargetAmount: increment(data.targetAmount),
          goalsCount: increment(1),
          updatedAt: nowStr,
        });
      } else {
        await setDoc(summaryRef, {
          id: 'summary',
          userId: user.uid,
          totalTargetAmount: data.targetAmount,
          totalCurrentAmount: 0,
          goalsCount: 1,
          updatedAt: nowStr,
        });
      }
    } catch (error) {
      console.error('Failed to update goals summary:', error);
    }

    toast({
      title: 'Meta salva!',
      description: `Sua meta "${data.name}" foi criada com sucesso.`,
    });
    router.push('/goals');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Meta</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Viagem para a praia, Carro novo"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="targetAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor Alvo</FormLabel>
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
                    className="pl-10 text-lg"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="targetDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data Alvo (Opcional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'dd/MM/yyyy', { locale: ptBR })
                      ) : (
                        <span>Escolha uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Algum detalhe sobre sua meta?"
                  className="resize-none"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <Loader2 className="animate-spin" />
          ) : (
            'Salvar Meta'
          )}
        </Button>
      </form>
    </Form>
  );
}
