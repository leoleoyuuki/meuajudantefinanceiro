'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Loader2, Package, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProductsPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const productsQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'products') : null),
    [firestore, user]
  );
  const { data: products, isLoading } = useCollection<Product>(productsQuery);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Produtos">
        <Button asChild>
          <Link href="/products/add">
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Produto
          </Link>
        </Button>
      </PageHeader>
      
      <div className="md:hidden flex flex-col gap-4">
         <h1 className="font-headline text-xl font-bold">Produtos</h1>
         <Button asChild>
          <Link href="/products/add">
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Produto
          </Link>
        </Button>
      </div>


      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="size-8 animate-spin" />
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
                {product.description && (
                  <CardDescription>{product.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between rounded-lg border bg-muted/30 p-3 text-sm">
                  <span className="text-muted-foreground">{product.pricingModel === 'unit' ? 'Custo' : 'Custo / g'}</span>
                  <span className="font-semibold">{formatCurrency(product.costPrice)}</span>
                </div>
                <div className="flex justify-between rounded-lg border bg-muted/30 p-3 text-sm">
                  <span className="text-muted-foreground">{product.pricingModel === 'unit' ? 'Preço de Venda' : 'Preço de Venda / g'}</span>
                  <span className="font-semibold">{formatCurrency(product.salePrice)}</span>
                </div>
                {product.profitMargin !== undefined && (
                     <div className="flex justify-between rounded-lg border bg-muted/30 p-3 text-sm">
                     <span className="text-muted-foreground">Margem de Lucro</span>
                     <span className="font-semibold text-primary">{product.profitMargin.toFixed(2)}%</span>
                   </div>
                )}
              </CardContent>
              <CardFooter>
                 {/* Sell button will be implemented in the next step */}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed bg-muted/50 p-8 text-center min-h-[50vh]">
          <Package className="size-12 text-muted-foreground" />
          <h2 className="font-headline text-xl font-semibold">
            Nenhum produto cadastrado
          </h2>
          <p className="text-muted-foreground">
            Adicione seu primeiro produto para começar a calcular seus preços e margens.
          </p>
          <Button asChild className="mt-4">
            <Link href="/products/add">
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Primeiro Produto
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
