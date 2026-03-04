'use client';

import { PageHeader } from '@/components/page-header';
import { iconMap } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle } from 'lucide-react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Category } from '@/lib/types';

export default function CategoriesPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const categoriesQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'categories') : null),
    [firestore, user]
  );
  const { data: categories, isLoading } = useCollection<Category>(categoriesQuery);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <PageHeader title="Categorias">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </PageHeader>
      {isLoading ? (
        <div className="flex justify-center">
          <Loader2 className="size-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {categories?.map((category) => {
            const Icon = iconMap[category.icon];
            return (
              <div
                key={category.id}
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border bg-card p-6 text-center shadow-sm transition-transform hover:scale-105 hover:shadow-md"
                style={{
                  borderColor: `${category.color}40`,
                  backgroundColor: `${category.color}10`,
                }}
              >
                {Icon && (
                  <Icon className="size-8" style={{ color: category.color }} />
                )}
                <span className="text-sm font-medium">{category.name}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
