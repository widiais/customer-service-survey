'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuestions } from '@/hooks/useQuestions';
import { useCategories } from '@/hooks/useCategories';
import { Question, Category } from '@/lib/types';
import { Trash2, Edit, AlertTriangle } from 'lucide-react';

export default function QuestionCollectionPage() {
  const router = useRouter();
  const { questions, loading: questionsLoading, deleteQuestion } = useQuestions();
  const { categories, loading: categoriesLoading } = useCategories();
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; questionId: string; questionText: string }>({ 
    show: false, 
    questionId: '', 
    questionText: '' 
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let filtered = questions;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(question =>
        question.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(question => question.categoryId === selectedCategory);
    }

    // Filter by type
    if (selectedType) {
      filtered = filtered.filter(question => question.type === selectedType);
    }

    // Filter by status
    if (selectedStatus) {
      const isActive = selectedStatus === 'active';
      filtered = filtered.filter(question => question.isActive === isActive);
    }

    setFilteredQuestions(filtered);
  }, [questions, searchTerm, selectedCategory, selectedType, selectedStatus]);

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
    setSelectedStatus('');
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      setDeleting(true);
      await deleteQuestion(questionId);
      setDeleteConfirm({ show: false, questionId: '', questionText: '' });
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Gagal menghapus pertanyaan. Silakan coba lagi.');
    } finally {
      setDeleting(false);
    }
  };

  const showDeleteConfirm = (questionId: string, questionText: string) => {
    setDeleteConfirm({ show: true, questionId, questionText });
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, questionId: '', questionText: '' });
  };

  if (questionsLoading || categoriesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Koleksi Pertanyaan</h1>
          <p className="text-gray-600 mt-1">Daftar semua pertanyaan yang telah dibuat</p>
        </div>
        <div className="text-sm text-gray-500">
          Total: {filteredQuestions.length} dari {questions.length} pertanyaan
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cari Pertanyaan
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ketik untuk mencari..."
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipe
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Tipe</option>
              <option value="text">Teks</option>
              <option value="rating">Rating</option>
              <option value="multiple_choice">Pilihan Ganda</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Konfirmasi Hapus</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Apakah Anda yakin ingin menghapus pertanyaan ini?
            </p>
            <div className="bg-gray-50 p-3 rounded mb-4">
              <p className="text-sm text-gray-800 font-medium">
                "{deleteConfirm.questionText}"
              </p>
            </div>
            <p className="text-sm text-red-600 mb-6">
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                disabled={deleting}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteQuestion(deleteConfirm.questionId)}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menghapus...
                  </>
                ) : (
                  'Hapus'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions Grid */}
      <div className="grid gap-4">
        {filteredQuestions.map((question) => (
          <div key={question.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: getCategoryColor(question.categoryId) }}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {getCategoryName(question.categoryId)}
                  </span>
                  <span className="mx-2 text-gray-300">•</span>
                  <span className="text-sm text-gray-600">
                    {getTypeLabel(question.type)}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {question.text}
                </h3>
                {question.options && question.options.length > 0 && (
                  <div className="mb-2">
                    <span className="text-sm text-gray-600">Opsi: </span>
                    <span className="text-sm text-gray-800">
                      {question.options.join(', ')}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mb-2 ${
                  question.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {question.isActive ? 'Aktif' : 'Tidak Aktif'}
                </span>
                <span className="text-xs text-gray-500 mb-3">
                  {new Date(question.createdAt).toLocaleDateString('id-ID')}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => router.push(`/dashboard/questions/edit/${question.id}`)}
                    className="flex items-center px-3 py-1 text-blue-600 hover:text-blue-800 text-sm border border-blue-300 rounded hover:bg-blue-50"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => showDeleteConfirm(question.id, question.text)}
                    className="flex items-center px-3 py-1 text-red-600 hover:text-red-800 text-sm border border-red-300 rounded hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredQuestions.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-gray-500">
              <p className="text-lg font-medium">
                {questions.length === 0 ? 'Belum ada pertanyaan' : 'Tidak ada pertanyaan yang sesuai filter'}
              </p>
              <p className="mt-1">
                {questions.length === 0 
                  ? 'Mulai dengan membuat pertanyaan pertama Anda'
                  : 'Coba ubah filter pencarian Anda'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}