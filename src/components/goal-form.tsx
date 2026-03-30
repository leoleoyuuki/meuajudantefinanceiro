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
  writeBatch
} from 'firebase/firestore';
import { FinancialGoal } from '@/lib/types';
import { useEffect } from 'react';

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

type GoalFormProps = {
    goalToEdit?: FinancialGoal;
}

export function GoalForm({ goalToEdit }: GoalFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const isEditMode = !!goalToEdit;

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });
  
  useEffect(() => {
    if (goalToEdit) {
      form.reset({
        name: goalToEdit.name,
        targetAmount: goalToEdit.targetAmount,
        description: goalToEdit.description || '',
        targetDate: goalToEdit.targetDate ? new Date(goalToEdit.targetDate) : undefined,
      });
    }
  }, [goalToEdit, form]);

  async function onSubmit(data: GoalFormValues) {
    if (!user || !firestore) return;
    
    const batch = writeBatch(firestore);
    const now = new Date();

    if (isEditMode) {
        // Edit logic
        const goalRef = doc(firestore, 'users', user.uid, 'financialGoals', goalToEdit.id);
        const amountDifference = data.targetAmount - goalToEdit.targetAmount;
        
        batch.update(goalRef, {
            name: data.name,
            targetAmount: data.targetAmount,
            description: data.description || '',
            targetDate: data.targetDate ? data.targetDate.toISOString() : null,
            updatedAt: now.toISOString(),
        });
        
        const summaryRef = doc(firestore, 'users', user.uid, 'goalsSummaries', 'summary');
        batch.update(summaryRef, {
            totalTargetAmount: increment(amountDifference),
            updatedAt: now.toISOString(),
        });

        try {
            await batch.commit();
            toast({
              title: 'Meta atualizada!',
              description: `Sua meta "${data.name}" foi alterada com sucesso.`,
            });
            router.push('/goals');
        } catch(error) {
            console.error("Error updating goal:", error);
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível atualizar a meta."});
        }

    } else {
        // Create logic
        const collectionRef = collection(firestore, 'users', user.uid, 'financialGoals');
        const docRef = doc(collectionRef);
        const docId = docRef.id;

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

        batch.set(docRef, goalData);

        const summaryRef = doc(firestore, 'users', user.uid, 'goalsSummaries', 'summary');
        
        try {
            const summarySnap = await getDoc(summaryRef);
            if (summarySnap.exists()) {
              batch.update(summaryRef, {
                totalTargetAmount: increment(data.targetAmount),
                goalsCount: increment(1),
                updatedAt: now.toISOString(),
              });
            } else {
              batch.set(summaryRef, {
                id: 'summary',
                userId: user.uid,
                totalTargetAmount: data.targetAmount,
                totalCurrentAmount: 0,
                goalsCount: 1,
                updatedAt: now.toISOString(),
              });
            }
            await batch.commit();
            toast({
              title: 'Meta salva!',
              description: `Sua meta "${data.name}" foi criada com sucesso.`,
            });
            router.push('/goals');
        } catch (error) {
            console.error('Failed to create goal and update summary:', error);
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível criar a meta."});
        }
    }
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
            isEditMode ? 'Salvar Alterações' : 'Salvar Meta'
          )}
        </Button>
      </form>
    </Form>
  );
}
