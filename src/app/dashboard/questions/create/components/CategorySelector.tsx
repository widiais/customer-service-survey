'use client';

import { useState, useEffect } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { useRouter } from 'next/navigation';

interface CategorySelectorProps {
  selectedCategoryIds: string[];
  onCategoryChange: (categoryIds: string[]) => void;
}

export default function CategorySelector({ selectedCategoryIds, onCategoryChange }: CategorySelectorProps) {
  const router = useRouter();
  const { categories } = useCategories();
  const [categoryInput, setCategoryInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState(categories);

  useEffect(() => {
    if (categoryInput.trim() === '') {
      setFilteredCategories(categories.filter(cat => cat.isActive));
    } else {
      const filtered = categories.filter(cat => 
        cat.isActive && 
        cat.name.toLowerCase().includes(categoryInput.toLowerCase()) &&
        !selectedCategoryIds.includes(cat.id)
      );
      setFilteredCategories(filtered);
    }
  }, [categoryInput, categories, selectedCategoryIds]);

  const selectCategory = (categoryId: string) => {
    if (!selectedCategoryIds.includes(categoryId)) {
      onCategoryChange([...selectedCategoryIds, categoryId]);
    }
    setCategoryInput('');
    setShowSuggestions(false);
  };

  const removeCategory = (categoryId: string) => {
    onCategoryChange(selectedCategoryIds.filter(id => id !== categoryId));
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || '#3B82F6';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown';
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Kategori Tags * (Ketik untuk mencari)
      </label>
      
      {/* Selected Categories Display */}
      {selectedCategoryIds.length > 0 && (
        <div className="mb-3">
          <p className="text-sm text-gray-600 mb-2">Kategori terpilih:</p>
          <div className="flex flex-wrap gap-2">
            {selectedCategoryIds.map((categoryId) => (
              <span
                key={categoryId}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: getCategoryColor(categoryId) }}
              >
                {getCategoryName(categoryId)}
                <button
                  type="button"
                  onClick={() => removeCategory(categoryId)}
                  className="ml-2 text-white hover:text-gray-200"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Autocomplete Input */}
      <div className="relative">
        <input
          type="text"
          value={categoryInput}
          onChange={(e) => {
            setCategoryInput(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ketik nama kategori..."
        />
        
        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={() => selectCategory(category.id)}
                >
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: category.color || '#3B82F6' }}
                  ></div>
                  <span className="font-medium">{category.name}</span>
                  {category.description && (
                    <span className="text-sm text-gray-500 ml-2">- {category.description}</span>
                  )}
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-gray-500">
                {categoryInput.trim() ? (
                  <div>
                    <p className="font-medium">Kategori &quot;{categoryInput}&quot; tidak ditemukan</p>
                    <p className="text-sm mt-1">Tags masih belum terbuat. Silakan buat kategori terlebih dahulu di menu Kategori.</p>
                    <button
                      type="button"
                      onClick={() => router.push('/dashboard/questions/categories')}
                      className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                      Buat Kategori Baru
                    </button>
                  </div>
                ) : (
                  <p>Mulai ketik untuk mencari kategori...</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Info Message */}
      <p className="text-sm text-gray-500 mt-2">
        Ketik nama kategori untuk mencari dan memilih. Jika kategori belum ada, 
        <button
          type="button"
          onClick={() => router.push('/dashboard/questions/categories')}
          className="text-blue-600 hover:text-blue-800 underline ml-1"
        >
          buat kategori baru
        </button>
      </p>
    </div>
  );
}