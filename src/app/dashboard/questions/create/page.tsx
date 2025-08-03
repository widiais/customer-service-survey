'use client';

import { useState } from 'react';
import { useQuestions } from '@/hooks/useQuestions';
import { useCategories } from '@/hooks/useCategories';
import { Question } from '@/lib/types';
import { useRouter } from 'next/navigation';
import QuestionTypeSelector from '@/app/dashboard/questions/create/components/QuestionTypeSelector';
import OptionsEditor from '@/app/dashboard/questions/create/components/OptionsEditor';
import CategorySelector from '@/app/dashboard/questions/create/components/CategorySelector';

type QuestionType = 'text' | 'rating' | 'multiple_choice';

interface QuestionFormData {
  text: string;
  type: QuestionType;
  options: string[];
  categoryIds: string[];
  isActive: boolean;
}

const initialFormData: QuestionFormData = {
  text: '',
  type: 'text',
  options: [''],
  categoryIds: [],
  isActive: true
};

export default function CreateQuestionPage() {
  const router = useRouter();
  const { addQuestion } = useQuestions();
  const { loading: categoriesLoading } = useCategories();
  const [formData, setFormData] = useState<QuestionFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.text.trim() || formData.categoryIds.length === 0) {
      alert('Mohon lengkapi semua field yang wajib diisi dan pilih minimal satu kategori');
      return;
    }

    setIsSubmitting(true);
    try {
      const questionData: Omit<Question, 'id'> = {
        text: formData.text.trim(),
        type: formData.type,
        categoryId: formData.categoryIds[0],
        isActive: formData.isActive,
        createdAt: new Date().toISOString(),
        ...(formData.type === 'multiple_choice' && {
          options: formData.options.filter(option => option.trim() !== '')
        })
      };

      await addQuestion(questionData);
      alert('Pertanyaan berhasil dibuat!');
      
      // Reset form instead of navigating
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error creating question:', error);
      alert('Gagal membuat pertanyaan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTypeChange = (type: QuestionType) => {
    setFormData({
      ...formData,
      type,
      options: type === 'multiple_choice' ? ['', ''] : ['']
    });
  };

  if (categoriesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Buat Pertanyaan Baru</h1>
        <p className="text-gray-600 mt-1">Tambahkan pertanyaan baru untuk survei pelanggan</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          {/* Teks Pertanyaan */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teks Pertanyaan *
            </label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Masukkan pertanyaan Anda..."
              required
            />
          </div>

          <QuestionTypeSelector 
            selectedType={formData.type} 
            onTypeChange={handleTypeChange} 
          />

          {formData.type === 'multiple_choice' && (
            <OptionsEditor 
              options={formData.options} 
              onOptionsChange={(options) => setFormData({ ...formData, options })} 
            />
          )}

          <CategorySelector 
            selectedCategoryIds={formData.categoryIds} 
            onCategoryChange={(categoryIds) => setFormData({ ...formData, categoryIds })} 
          />

          {/* Status Aktif */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Aktif</span>
            </label>
            <p className="text-sm text-gray-500 mt-1">
              Pertanyaan aktif akan ditampilkan dalam survei
            </p>
          </div>

          {/* Tombol Submit */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Pertanyaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}