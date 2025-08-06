'use client';

import { useState, useEffect } from 'react';
import { useQuestionGroups } from '@/hooks/useQuestionGroups';
import { useQuestions } from '@/hooks/useQuestions';
import { useCategories } from '@/hooks/useCategories';
import { QuestionGroup, Question } from '@/lib/types';
import { useRouter, useParams } from 'next/navigation';
import { GroupForm } from './components/GroupForm';
import { AvailableQuestions } from './components/AvailableQuestions';

interface GroupFormData {
  name: string;
  description: string;
  questionIds: string[];
  mandatoryQuestionIds: string[];
  isActive: boolean;
}

export default function EditQuestionGroupPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  const { questionGroups, updateQuestionGroup, loading: groupsLoading } = useQuestionGroups();
  const { questions, loading: questionsLoading } = useQuestions();
  const { categories, loading: categoriesLoading } = useCategories();
  const [formData, setFormData] = useState<GroupFormData>({ name: '', description: '', questionIds: [], mandatoryQuestionIds: [], isActive: true });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [groupFound, setGroupFound] = useState(false);

  useEffect(() => {
    if (!groupsLoading && questionGroups.length > 0) {
      const group = questionGroups.find(g => g.id === groupId);
      if (group) {
        setFormData({ 
          name: group.name, 
          description: group.description || '', 
          questionIds: group.questionIds, 
          mandatoryQuestionIds: group.mandatoryQuestionIds || [],
          isActive: group.isActive 
        });
        setGroupFound(true);
      }
    }
  }, [questionGroups, groupId, groupsLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { alert('Mohon masukkan nama grup'); return; }
    setIsSubmitting(true);
    try {
      const groupData: Partial<QuestionGroup> = { 
        name: formData.name.trim(), 
        description: formData.description.trim(), 
        questionIds: formData.questionIds, 
        mandatoryQuestionIds: formData.mandatoryQuestionIds,
        isActive: formData.isActive 
      };
      await updateQuestionGroup(groupId, groupData);
      alert('Grup pertanyaan berhasil diperbarui!');
      router.push('/dashboard/questions/groups');
    } catch (error) {
      console.error('Error updating question group:', error);
      alert('Gagal memperbarui grup pertanyaan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addQuestion = (questionId: string) => {
    if (!formData.questionIds.includes(questionId)) {
      setFormData(prev => ({ ...prev, questionIds: [...prev.questionIds, questionId] }));
    }
  };

  const removeQuestion = (questionId: string) => {
    setFormData(prev => ({ 
      ...prev, 
      questionIds: prev.questionIds.filter(id => id !== questionId),
      mandatoryQuestionIds: prev.mandatoryQuestionIds.filter(id => id !== questionId)
    }));
  };

  const toggleMandatory = (questionId: string) => {
    setFormData(prev => ({
      ...prev,
      mandatoryQuestionIds: prev.mandatoryQuestionIds.includes(questionId)
        ? prev.mandatoryQuestionIds.filter(id => id !== questionId)
        : [...prev.mandatoryQuestionIds, questionId]
    }));
  };

  const getQuestionById = (questionId: string) => questions.find(q => q.id === questionId);
  const selectedQuestions = formData.questionIds.map(id => getQuestionById(id)).filter(Boolean) as Question[];

  if (groupsLoading || questionsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!groupFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Grup Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-6">Grup pertanyaan yang Anda cari tidak ditemukan.</p>
          <button onClick={() => router.push('/dashboard/questions/groups')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Kembali ke Daftar Grup</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Grup Pertanyaan</h1>
          <p className="mt-2 text-gray-600">Perbarui informasi grup dan atur ulang pertanyaan</p>
        </div>

        <GroupForm
          formData={formData}
          setFormData={setFormData}
          selectedQuestions={selectedQuestions}
          categories={categories}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/dashboard/questions/groups')}
          onRemoveQuestion={removeQuestion}
          onToggleMandatory={toggleMandatory}
        />

        <AvailableQuestions
          questions={questions}
          categories={categories}
          selectedQuestionIds={formData.questionIds}
          onAddQuestion={addQuestion}
        />
      </div>
    </div>
  );
}