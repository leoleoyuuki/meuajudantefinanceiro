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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const productFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Nome deve ter pelo menos 2 caracteres.',
  }),
  description: z.string().optional(),
  pricingModel: z.enum(['unit', 'weight']),
  costPrice: z.coerce.number().positive({
    message: 'O custo deve ser um número positivo.',
  }),
  salePrice: z.coerce.number().positive({
    message: 'O preço de venda deve ser um número positivo.',
  }),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export function ProductForm() {
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      pricingModel: 'unit',
    },
  });

  const pricingModel = form.watch('pricingModel');

  async function onSubmit(data: ProductFormValues) {
    if (!user || !firestore) return;

    const collectionRef = collection(firestore, 'users', user.uid, 'products');
    const docRef = doc(collectionRef);
    const docId = docRef.id;

    const profitMargin =
      data.salePrice > 0
        ? ((data.salePrice - data.costPrice) / data.salePrice) * 100
        : 0;

    const productData = {
      id: docId,
      userId: user.uid,
      name: data.name,
      description: data.description || '',
      pricingModel: data.pricingModel,
      costPrice: data.costPrice,
      salePrice: data.salePrice,
      profitMargin: profitMargin,
    };

    setDocumentNonBlocking(docRef, productData, {});

    toast({
      title: 'Produto salvo!',
      description: `O produto "${data.name}" foi adicionado com sucesso.`,
    });
    router.push('/products');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Produto</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Bolo de Chocolate" {...field} />
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
              <FormLabel>Descrição (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detalhes do produto, ingredientes, etc."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pricingModel"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Modelo de Precificação</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex items-center gap-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="unit" id="unit" />
                    </FormControl>
                    <FormLabel
                      htmlFor="unit"
                      className="cursor-pointer font-normal"
                    >
                      Por Unidade
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="weight" id="weight" />
                    </FormControl>
                    <FormLabel
                      htmlFor="weight"
                      className="cursor-pointer font-normal"
                    >
                      Por Peso (g)
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="costPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {pricingModel === 'unit'
                    ? 'Custo de Produção'
                    : 'Custo por Grama'}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                      R$
                    </span>
                    <Input
                      type="number"
                      placeholder="0,00"
                      step="0.01"
                      {...field}
                      className="pl-10"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="salePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {pricingModel === 'unit'
                    ? 'Preço de Venda'
                    : 'Preço de Venda por Grama'}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                      R$
                    </span>
                    <Input
                      type="number"
                      placeholder="0,00"
                      step="0.01"
                      {...field}
                      className="pl-10"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <Loader2 className="animate-spin" />
          ) : (
            'Salvar Produto'
          )}
        </Button>
      </form>
    </Form>
  );
}
