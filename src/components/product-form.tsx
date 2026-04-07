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
import { useUser, useFirestore } from '@/firebase';
import { collection, doc, setDoc, updateDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useEffect } from 'react';
import { Product } from '@/lib/types';

const productFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Nome deve ter pelo menos 2 caracteres.',
  }),
  description: z.string().optional(),
  pricingModel: z.enum(['unit', 'weight_100g']),
  costPrice: z.coerce.number().positive({
    message: 'O custo deve ser um número positivo.',
  }),
  salePrice: z.coerce.number().positive({
    message: 'O preço de venda deve ser um número positivo.',
  }),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

type ProductFormProps = {
  productToEdit?: Product;
};

export function ProductForm({ productToEdit }: ProductFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const isEditMode = !!productToEdit;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: isEditMode
      ? {}
      : {
          name: '',
          description: '',
          pricingModel: 'unit',
        },
  });

  useEffect(() => {
    if (isEditMode && productToEdit) {
      form.reset({
        name: productToEdit.name,
        description: productToEdit.description || '',
        pricingModel: productToEdit.pricingModel,
        costPrice: productToEdit.costPrice,
        salePrice: productToEdit.salePrice,
      });
    }
  }, [isEditMode, productToEdit, form]);

  const pricingModel = form.watch('pricingModel');

  async function onSubmit(data: ProductFormValues) {
    if (!user || !firestore) return;

    const profitMargin =
      data.salePrice > 0
        ? ((data.salePrice - data.costPrice) / data.salePrice) * 100
        : 0;

    const productData = {
      ...data,
      userId: user.uid,
      profitMargin: profitMargin,
      description: data.description || '',
    };
    
    try {
      if (isEditMode && productToEdit) {
        const docRef = doc(firestore, 'users', user.uid, 'products', productToEdit.id);
        await updateDoc(docRef, productData);
        toast({
          title: 'Produto atualizado!',
          description: `O produto "${data.name}" foi salvo.`,
        });
      } else {
        const collectionRef = collection(firestore, 'users', user.uid, 'products');
        const docRef = doc(collectionRef);
        await setDoc(docRef, { ...productData, id: docRef.id });
        toast({
          title: 'Produto salvo!',
          description: `O produto "${data.name}" foi adicionado com sucesso.`,
        });
      }
      router.push('/products');
    } catch (error) {
       console.error("Error saving product: ", error);
       toast({
           variant: 'destructive',
           title: "Erro ao salvar",
           description: "Não foi possível salvar o produto.",
       })
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
                  value={field.value ?? ''}
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
                      <RadioGroupItem value="weight_100g" id="weight_100g" />
                    </FormControl>
                    <FormLabel
                      htmlFor="weight_100g"
                      className="cursor-pointer font-normal"
                    >
                      Por Peso (100g)
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
                    : 'Custo a cada 100g'}
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
                      value={field.value ?? ''}
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
                    : 'Preço de Venda a cada 100g'}
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
                      value={field.value ?? ''}
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
            isEditMode ? 'Salvar Alterações' : 'Salvar Produto'
          )}
        </Button>
      </form>
    </Form>
  );
}
