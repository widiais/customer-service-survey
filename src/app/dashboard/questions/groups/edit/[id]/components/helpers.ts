import { Category } from '@/lib/types';

export const getTypeLabel = (type: string) => {
  switch (type) {
    case 'text': return 'Teks';
    case 'rating': return 'Rating';
    case 'multiple_choice': return 'Pilihan Ganda';
    default: return type;
  }
};

export const getCategoryName = (categories: Category[], categoryId: string) => {
  const category = categories.find(cat => cat.id === categoryId);
  return category ? category.name : 'Tidak ada kategori';
};

export const getCategoryColor = (categories: Category[], categoryId: string) => {
  const category = categories.find(cat => cat.id === categoryId);
  return category?.color || '#3B82F6';
};