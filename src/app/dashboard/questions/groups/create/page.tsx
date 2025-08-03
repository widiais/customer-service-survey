'use client';

import { useState, useEffect } from 'react';
import { useQuestionGroups } from '@/hooks/useQuestionGroups';
import { useQuestions } from '@/hooks/useQuestions';
import { useCategories } from '@/hooks/useCategories';
import { Question } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface GroupFormData {
  name: string;
  description: string;
  questionIds: string[];
  isActive: boolean;
}

export default function CreateQuestionGroupPage() {
  const router = useRouter();
  const { addQuestionGroup } = useQuestionGroups();
  const { questions, loading: questionsLoading } = useQuestions();
  const { categories, loading: categoriesLoading } = useCategories();
  const [formData, setFormData] = useState<GroupFormData>({
    name: '',
    description: '',
    questionIds: [],
    isActive: true
  });
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let filtered = questions.filter(q => q.isActive);

    if (searchTerm) {
      filtered = filtered.filter(question =>
        question.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(question => question.categoryId === selectedCategory);
    }

    if (selectedType) {
      filtered = filtered.filter(question => question.type === selectedType);
    }

    setFilteredQuestions(filtered);
  }, [questions, searchTerm, selectedCategory, selectedType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nama grup wajib diisi');
      return;
    }
    if (selectedQuestions.length === 0) {
      alert('Pilih minimal satu pertanyaan');
      return;
    }

    setIsSubmitting(true);
    try {
      await addQuestionGroup({
        ...formData,
        questionIds: selectedQuestions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      alert('Grup pertanyaan berhasil dibuat!');
      router.push('/dashboard/questions/groups');
    } catch (error) {
      console.error('Error creating question group:', error);
      alert('Gagal membuat grup pertanyaan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Tidak ada kategori';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || '#3B82F6';
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'text': return 'Teks';
      case 'rating': return 'Rating';
      case 'multiple_choice': return 'Pilihan Ganda';
      default: return type;
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedType('');
  };

  if (questionsLoading || categoriesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Buat Grup Pertanyaan Baru</h1>
        <p className="text-gray-600 mt-1">Buat grup pertanyaan untuk mengorganisir survei</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Informasi Grup</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Grup *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan nama grup..."
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Deskripsi grup (opsional)..."
              />
            </div>

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
                Grup aktif dapat digunakan untuk survei
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                Pertanyaan Terpilih: {selectedQuestions.length}
              </h3>
              {selectedQuestions.length > 0 && (
                <div className="space-y-1">
                  {selectedQuestions.slice(0, 3).map((questionId, index) => {
                    const question = questions.find(q => q.id === questionId);
                    return (
                      <div key={questionId} className="text-sm text-blue-800">
                        {index + 1}. {question?.text.substring(0, 50)}...
                      </div>
                    );
                  })}
                  {selectedQuestions.length > 3 && (
                    <div className="text-sm text-blue-600">
                      +{selectedQuestions.length - 3} pertanyaan lainnya
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Questions Selection Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Pilih Pertanyaan</h2>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Cari pertanyaan..."
              />
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Tipe</option>
                <option value="text">Teks</option>
                <option value="rating">Rating</option>
                <option value="multiple_choice">Pilihan Ganda</option>
              </select>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 mb-4"
            >
              Reset Filter
            </button>

            {/* Questions List */}
            <div className="border border-gray-300 rounded-md max-h-96 overflow-y-auto">
              {filteredQuestions.map((question) => (
                <div key={question.id} className="p-3 border-b border-gray-200 last:border-b-0">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedQuestions.includes(question.id)}
                      onChange={() => toggleQuestionSelection(question.id)}
                      className="mr-3 mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <div
                          className="w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: getCategoryColor(question.categoryId) }}
                        ></div>
                        <span className="text-xs text-gray-500">
                          {getCategoryName(question.categoryId)} • {getTypeLabel(question.type)}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {question.text}
                      </div>
                      {question.options && question.options.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Opsi: {question.options.join(', ')}
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              ))}
              
              {filteredQuestions.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  Tidak ada pertanyaan yang sesuai filter
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting || selectedQuestions.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Grup'}
          </button>
        </div>
      </form>
    </div>
  );
}