import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Question } from '@/lib/types';
import { getTypeLabel, getCategoryName, getCategoryColor } from './helpers';

interface Props {
  questions: Question[];
  categories: any[];
  selectedQuestionIds: string[];
  onAddQuestion: (questionId: string) => void;
}

export function AvailableQuestions({ questions, categories, selectedQuestionIds, onAddQuestion }: Props) {
  const [showAvailableQuestions, setShowAvailableQuestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const availableQuestions = questions.filter(question => {
    const matchesSearch = question.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || question.categoryId === selectedCategory;
    const isActive = question.isActive;
    const notSelected = !selectedQuestionIds.includes(question.id);
    return matchesSearch && matchesCategory && isActive && notSelected;
  });

  return (
    <div className="mt-8 bg-white shadow rounded-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Pilih Pertanyaan</h2>
          <button type="button" onClick={() => setShowAvailableQuestions(!showAvailableQuestions)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors">
            {showAvailableQuestions ? 'Sembunyikan' : 'Tampilkan'} Daftar Pertanyaan
            <svg className={`w-4 h-4 transition-transform ${showAvailableQuestions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
      
      {showAvailableQuestions && (
        <div className="p-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">Cari Pertanyaan</label>
              <input type="text" id="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ketik untuk mencari..." />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Filter Kategori</label>
              <select id="category" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Semua Kategori</option>
                {categories.map(category => (<option key={category.id} value={category.id}>{category.name}</option>))}
              </select>
            </div>
          </div>

          {/* Questions List */}
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            <div className="space-y-1 p-2">
              {availableQuestions.length > 0 ? (
                availableQuestions.map(question => (
                  <div key={question.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">{question.text}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{getTypeLabel(question.type)}</span>
                          {question.categoryId ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: getCategoryColor(categories, question.categoryId) }}>{getCategoryName(categories, question.categoryId)}</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Tanpa Kategori</span>
                          )}
                        </div>
                      </div>
                      <button type="button" onClick={() => onAddQuestion(question.id)} className="flex-shrink-0 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors" title="Tambah pertanyaan">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Tidak ada pertanyaan yang tersedia</p>
                  {searchTerm && <p className="text-sm mt-1">Coba ubah kata kunci pencarian</p>}
                  {selectedCategory && <p className="text-sm mt-1">atau pilih kategori lain</p>}
                </div>
              )}
            </div>
          </div>
          
          {availableQuestions.length > 0 && (
            <div className="mt-4 text-sm text-gray-600 text-center">Menampilkan {availableQuestions.length} pertanyaan</div>
          )}
        </div>
      )}
    </div>
  );
}