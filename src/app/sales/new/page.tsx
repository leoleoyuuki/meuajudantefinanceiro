'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCollection, useFirestore, useUser, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { collection, doc, getDoc, increment, updateDoc } from 'firebase/firestore';
import type { Product, Category, Transaction, MonthlySummary } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Loader2, Plus, ShoppingCart, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

type CartItem = {
  product: Product;
  quantity: number; // For 'unit' it's the count, for 'weight_100g' it's grams.
};

export default function NewSalePage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const { user } = useUser();
  const firestore = useFirestore();

  const productsQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'products') : null),
    [firestore, user]
  );
  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsQuery);
  
  const categoriesQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'categories') : null),
    [firestore, user]
  );
  const { data: categories, isLoading: categoriesLoading } = useCollection<Category>(categoriesQuery);


  const addToCart = (product: Product) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.product.id === product.id);
      if (existingItem) {
        if (product.pricingModel === 'unit') {
            return currentCart.map((item) =>
              item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            );
        }
        // For weighted items, just focus the input, don't auto-increment
        return currentCart;
      }
      return [...currentCart, { product, quantity: product.pricingModel === 'unit' ? 1 : 100 }];
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    setCart((currentCart) =>
      currentCart
        .map((item) => {
          if (item.product.id === productId) {
            // Prevent negative numbers
            const quantity = Math.max(0, newQuantity);
            return { ...item, quantity };
          }
          return item;
        })
    );
  };
  
  const removeFromCart = (productId: string) => {
    setCart(cart => cart.filter(item => item.product.id !== productId));
  }

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, searchTerm]);

  const total = useMemo(() => {
    return cart.reduce((acc, item) => {
      let itemPrice = 0;
      if (item.product.pricingModel === 'unit') {
        itemPrice = item.product.salePrice * item.quantity;
      } else if (item.product.pricingModel === 'weight_100g') {
        itemPrice = (item.product.salePrice / 100) * item.quantity; // quantity is in grams
      }
      return acc + itemPrice;
    }, 0);
  }, [cart]);

  const handleRegisterSale = async () => {
    if (cart.length === 0 || !user || !firestore || !categories) return;

    const validCart = cart.filter(item => item.quantity > 0);
    if(validCart.length === 0) {
        toast({
            variant: 'destructive',
            title: 'Carrinho vazio',
            description: 'Adicione uma quantidade aos produtos para registrar a venda.'
        });
        return;
    }

    setIsSubmitting(true);
    
    let salesCategory = categories.find(c => c.name === 'Vendas' && c.type === 'income');
    const now = new Date();

    if (!salesCategory) {
        const categoriesColRef = collection(firestore, 'users', user.uid, 'categories');
        const newCategoryRef = doc(categoriesColRef);
        
        const newCategoryData: Category = {
            id: newCategoryRef.id,
            userId: user.uid,
            name: 'Vendas',
            icon: 'TrendingUp',
            color: '#10B981',
            type: 'income',
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
        };
        
        setDocumentNonBlocking(newCategoryRef, newCategoryData, {});
        salesCategory = newCategoryData;
    }

    const transactionCollectionRef = collection(firestore, 'users', user.uid, 'transactions');
    const transactionDocRef = doc(transactionCollectionRef);

    const saleDescription = validCart.map(item => {
        if (item.product.pricingModel === 'unit') {
            return `${item.quantity}x ${item.product.name}`;
        }
        return `${item.quantity}g ${item.product.name}`;
    }).join(', ');

    const transactionData: Omit<Transaction, 'category'> = {
        id: transactionDocRef.id,
        userId: user.uid,
        amount: total,
        type: 'income',
        description: `Venda: ${saleDescription}`,
        categoryId: salesCategory.id,
        date: now.toISOString(),
        paymentMethod: 'Venda',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
    };
    
    setDocumentNonBlocking(transactionDocRef, transactionData, {});

    // Update monthly summary
    try {
        const summaryId = format(now, 'yyyy-MM');
        const summaryRef = doc(firestore, 'users', user.uid, 'monthlySummaries', summaryId);
        const summarySnap = await getDoc(summaryRef);

        if (summarySnap.exists()) {
            await updateDoc(summaryRef, {
                totalIncome: increment(total),
                netBalance: increment(total),
                updatedAt: now.toISOString(),
            });
        } else {
             const month = parseInt(format(now, 'M'));
             const year = parseInt(format(now, 'yyyy'));
             const newSummary: MonthlySummary = {
                id: summaryId,
                userId: user.uid,
                month,
                year,
                totalIncome: total,
                totalExpense: 0,
                netBalance: total,
                spendingByCategory: [],
                createdAt: now.toISOString(),
                updatedAt: now.toISOString(),
            };
            setDocumentNonBlocking(summaryRef, newSummary, {});
        }
    } catch(error) {
        console.error("Failed to update monthly summary for sale:", error);
    }
    
    toast({
        title: 'Venda registrada!',
        description: `Receita de ${formatCurrency(total)} adicionada.`,
    });

    setIsSubmitting(false);
    router.push('/');
  };

  const isLoading = productsLoading || categoriesLoading;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Registrar Nova Venda" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos</CardTitle>
            <Input 
              placeholder="Buscar produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin" />
                </div>
            ) : (
                <ScrollArea className="h-96">
                    <div className="space-y-2">
                        {filteredProducts.map(product => (
                            <div key={product.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                                <div>
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-sm text-muted-foreground">{formatCurrency(product.salePrice)} / {product.pricingModel === 'unit' ? 'un' : '100g'}</p>
                                </div>
                                <Button size="icon" variant="outline" onClick={() => addToCart(product)}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Cart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <ShoppingCart /> Carrinho
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 text-center text-muted-foreground">
                    <ShoppingCart className="size-12 mb-4"/>
                    <p>Seu carrinho está vazio.</p>
                    <p className="text-sm">Adicione produtos da lista ao lado.</p>
                </div>
            ) : (
                 <ScrollArea className="h-96">
                    <div className="space-y-4">
                        {cart.map(item => (
                            <div key={item.product.id} className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{item.product.name}</p>
                                    <p className="text-sm text-muted-foreground">{formatCurrency(item.product.salePrice)} / {item.product.pricingModel === 'unit' ? 'un' : '100g'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                     <Input 
                                        type="number"
                                        value={item.quantity}
                                        onChange={e => updateQuantity(item.product.id, parseFloat(e.target.value) || 0)}
                                        className="w-24 h-9"
                                        min="0"
                                        step={item.product.pricingModel === 'unit' ? '1' : '10'}
                                     />
                                     <span className="text-sm text-muted-foreground">{item.product.pricingModel === 'unit' ? 'un' : 'g'}</span>
                                     <Button size="icon" variant="ghost" onClick={() => removeFromCart(item.product.id)}>
                                        <X className="h-4 w-4 text-destructive" />
                                     </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                 </ScrollArea>
            )}
          </CardContent>
          {cart.length > 0 && (
            <CardFooter className="flex flex-col gap-4 border-t pt-6 mt-4">
                <div className="flex justify-between w-full font-bold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                </div>
                <Button onClick={handleRegisterSale} className="w-full" disabled={isSubmitting || total <= 0}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Registrar Venda
                </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
