'use client';

import { PageHeader } from '@/components/page-header';
import { ProductForm } from '@/components/product-form';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Product } from '@/lib/types';
import { Loader2 } from 'lucide-react';

type EditProductPageProps = {
    params: {
        productId: string;
    }
}

export default function EditProductPage({ params }: EditProductPageProps) {
    const { productId } = params;
    const { user } = useUser();
    const firestore = useFirestore();

    const productQuery = useMemoFirebase(
        () => (user && productId ? doc(firestore, `users/${user.uid}/products/${productId}`) : null),
        [user, firestore, productId]
    );

    const { data: product, isLoading } = useDoc<Product>(productQuery);

    return (
        <div className="flex flex-col gap-6">
            <PageHeader title="Editar Produto" />
            {isLoading ? (
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : product ? (
                <ProductForm productToEdit={product} />
            ) : (
                <p>Produto não encontrado.</p>
            )}
        </div>
    );
}
