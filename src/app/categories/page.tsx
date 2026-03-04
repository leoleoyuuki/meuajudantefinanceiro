import { PageHeader } from '@/components/page-header';
import { categories } from '@/lib/data';
import { iconMap } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function CategoriesPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <PageHeader title="Categorias">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </PageHeader>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {categories.map((category) => {
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
                <Icon
                  className="size-8"
                  style={{ color: category.color }}
                />
              )}
              <span className="text-sm font-medium">{category.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
