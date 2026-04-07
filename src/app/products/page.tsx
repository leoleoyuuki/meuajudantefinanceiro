'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useFirestore, useUser } from '@/firebase';
import { collection, doc, deleteDoc, getDocs, query } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import {
  Loader2,
  Package,
  PlusCircle,
  MoreVertical,
  Pencil,
  Trash,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

export default function ProductsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [products, setProducts] = useState<Product[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !firestore) {
      setIsLoading(false);
      return;
    }

    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const productsQuery = query(
          collection(firestore, 'users', user.uid, 'products')
        );
        const querySnapshot = await getDocs(productsQuery);
        const fetchedProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({ variant: 'destructive', title: 'Erro ao buscar produtos' });
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [user, firestore, toast]);

  const handleDeleteProduct = async () => {
    if (!productToDelete || !user || !firestore) return;
    setIsDeleting(true);

    try {
      const productRef = doc(
        firestore,
        'users',
        user.uid,
        'products',
        productToDelete.id
      );
      await deleteDoc(productRef);

      setProducts(
        (prevProducts) =>
          prevProducts?.filter((p) => p.id !== productToDelete.id) || null
      );

      toast({
        title: 'Produto excluído!',
        description: `O produto "${productToDelete.name}" foi removido.`,
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir',
        description: 'Não foi possível remover o produto.',
      });
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };

  return (
    <>
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
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle>{product.name}</CardTitle>
                    {product.description && (
                      <CardDescription>{product.description}</CardDescription>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/products/edit/${product.id}`}
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <Pencil className="h-4 w-4" /> Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setProductToDelete(product)}
                        className="flex cursor-pointer items-center gap-2 text-destructive focus:text-destructive"
                      >
                        <Trash className="h-4 w-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between rounded-lg border bg-muted/30 p-3 text-sm">
                    <span className="text-muted-foreground">
                      {product.pricingModel === 'unit'
                        ? 'Custo'
                        : 'Custo / 100g'}
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(product.costPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between rounded-lg border bg-muted/30 p-3 text-sm">
                    <span className="text-muted-foreground">
                      {product.pricingModel === 'unit'
                        ? 'Preço de Venda'
                        : 'Preço de Venda / 100g'}
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(product.salePrice)}
                    </span>
                  </div>
                  {product.profitMargin !== undefined && (
                    <div className="flex justify-between rounded-lg border bg-muted/30 p-3 text-sm">
                      <span className="text-muted-foreground">
                        Margem de Lucro
                      </span>
                      <span className="font-semibold text-primary">
                        {product.profitMargin.toFixed(2)}%
                      </span>
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
              Adicione seu primeiro produto para começar a calcular seus preços
              e margens.
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

      <AlertDialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o
              produto "{productToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
