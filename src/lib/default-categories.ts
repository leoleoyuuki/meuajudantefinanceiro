import type { Category } from './types';

export const defaultCategories: Omit<Category, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[] = [
    { name: 'Salário', icon: 'Landmark', color: '#22C55E', type: 'income' },
    { name: 'Alimentação', icon: 'Utensils', color: '#F59E0B', type: 'expense' },
    { name: 'Transporte', icon: 'Car', color: '#10B981', type: 'expense' },
    { name: 'Moradia', icon: 'Home', color: '#3B82F6', type: 'expense' },
    { name: 'Lazer', icon: 'Film', color: '#8B5CF6', type: 'expense' },
    { name: 'Saúde', icon: 'HeartPulse', color: '#EF4444', type: 'expense' },
    { name: 'Educação', icon: 'GraduationCap', color: '#EC4899', type: 'expense' },
    { name: 'Compras', icon: 'Gift', color: '#6366F1', type: 'expense' },
    { name: 'Assinaturas', icon: 'Repeat', color: '#0EA5E9', type: 'expense' },
    { name: 'Outros', icon: 'PiggyBank', color: '#14B8A6', type: 'expense' },
];
