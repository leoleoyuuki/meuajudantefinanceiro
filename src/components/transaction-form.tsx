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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { suggestCategory } from '@/app/actions';
import { useState, useMemo } from 'react';
import {
  useUser,
  useFirestore,
  useCollection,
  setDocumentNonBlocking,
  useMemoFirebase,
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { Category } from '@/lib/types';

const transactionFormSchema = z.object({
  type: z.enum(['income', 'expense'], {
    required_error: 'Tipo é obrigatório.',
  }),
  description: z.string().min(2, {
    message: 'Descrição deve ter pelo menos 2 caracteres.',
  }),
  amount: z.coerce.number().positive({
    message: 'Valor deve ser positivo.',
  }),
  categoryId: z
    .string({ required_error: 'Categoria é obrigatória.' })
    .min(1, { message: 'Categoria é obrigatória.' }),
  date: z.date({
    required_error: 'Data é obrigatória.',
  }),
  paymentMethod: z.string().min(2, {
    message: 'Forma de pagamento é obrigatória.',
  }),
  notes: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

const defaultValues: Partial<TransactionFormValues> = {
  type: 'expense',
  date: new Date(),
};

export function TransactionForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSuggesting, setIsSuggesting] = useState(false);
  const firestore = useFirestore();
  const { user } = useUser();

  const categoriesQuery = useMemoFirebase(
    () =>
      user ? collection(firestore, 'users', user.uid, 'categories') : null,
    [firestore, user]
  );
  const { data: categories, isLoading: categoriesLoading } =
    useCollection<Category>(categoriesQuery);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues,
  });

  const transactionType = form.watch('type');

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    const filtered = categories.filter((c) => c.type === transactionType);
    const selectedCategoryId = form.getValues('categoryId');
    if (
      selectedCategoryId &&
      !filtered.some((c) => c.id === selectedCategoryId)
    ) {
      form.setValue('categoryId', '');
    }
    return filtered;
  }, [categories, transactionType, form]);

  async function onSubmit(data: TransactionFormValues) {
    if (!user || !firestore) return;

    const collectionRef = collection(
      firestore,
      'users',
      user.uid,
      'transactions'
    );
    const docRef = doc(collectionRef);
    const docId = docRef.id;

    const transactionData = {
      ...data,
      id: docId,
      userId: user.uid,
      date: data.date.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: data.notes || '',
    };

    setDocumentNonBlocking(docRef, transactionData, {});

    toast({
      title: 'Transação salva!',
      description: `Sua ${
        data.type === 'income' ? 'receita' : 'despesa'
      } foi registrada.`,
    });
    router.push('/');
  }

  async function handleDescriptionBlur(e: React.FocusEvent<HTMLInputElement>) {
    const description = e.target.value;
    if (description.length > 3 && filteredCategories) {
      setIsSuggesting(true);
      try {
        const availableCategories = filteredCategories.map((c) => c.name);
        const { suggestedCategory } = await suggestCategory({
          description,
          availableCategories,
        });
        if (suggestedCategory) {
          const category = filteredCategories.find(
            (c) => c.name === suggestedCategory
          );
          if (category) {
            form.setValue('categoryId', category.id);
            toast({
              title: 'Categoria sugerida!',
              description: `Sugerimos "${category.name}" para esta transação.`,
            });
          }
        }
      } catch (error) {
        console.error('Error suggesting category:', error);
      } finally {
        setIsSuggesting(false);
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
                  <Button
                    type="button"
                    variant={field.value === 'expense' ? 'default' : 'ghost'}
                    onClick={() => field.onChange('expense')}
                    className={
                      field.value === 'expense'
                        ? 'bg-destructive/80 text-destructive-foreground hover:bg-destructive'
                        : ''
                    }
                  >
                    Despesa
                  </Button>
                  <Button
                    type="button"
                    variant={field.value === 'income' ? 'default' : 'ghost'}
                    onClick={() => field.onChange('income')}
                    className={
                      field.value === 'income'
                        ? 'bg-primary/80 text-primary-foreground hover:bg-primary'
                        : ''
                    }
                  >
                    Receita
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor</FormLabel>
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: iFood, Uber, Salário"
                  {...field}
                  onBlur={handleDescriptionBlur}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <div className="relative">
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={categoriesLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredCategories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(isSuggesting || categoriesLoading) && (
                  <Loader2 className="absolute right-10 top-2.5 size-5 animate-spin text-muted-foreground" />
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
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
                          format(field.value, 'dd/MM/yyyy')
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
                      disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                      }
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
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pagamento</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Forma" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Crédito">Crédito</SelectItem>
                    <SelectItem value="Débito">Débito</SelectItem>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="Boleto">Boleto</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Alguma anotação sobre a transação?"
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
            'Salvar Transação'
          )}
        </Button>
      </form>
    </Form>
  );
}
