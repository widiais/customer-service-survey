'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStores } from '@/hooks/useStores';
import { useQuestionGroups } from '@/hooks/useQuestionGroups';
import { useQuestions } from '@/hooks/useQuestions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function SurveyPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;
  
  const { stores } = useStores();
  const { questionGroups } = useQuestionGroups();
  const { questions } = useQuestions();
  
  const [responses, setResponses] = useState<Record<string, string | number>>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showCustomerForm, setShowCustomerForm] = useState(true);
  
  const store = stores.find(s => s.id === storeId);
  // Perbaikan urutan grup - pertahankan urutan sesuai questionGroupIds
  const assignedGroups = store?.questionGroupIds?.map(groupId => 
    questionGroups.find(group => group.id === groupId)
  ).filter(Boolean) || [];
  
  const currentGroup = assignedGroups[currentSection];
  // Perbaikan urutan pertanyaan - pertahankan urutan sesuai questionIds
  const groupQuestions = currentGroup?.questionIds?.map(questionId => 
    questions.find(q => q.id === questionId)
  ).filter(Boolean) || [];
  
  const handleResponse = (questionId: string, answer: string | number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };
  
  const handleNext = () => {
    // Check mandatory questions for current section
    if (currentGroup?.mandatoryQuestionIds) {
      const unansweredMandatory = currentGroup.mandatoryQuestionIds.filter(questionId => {
        const answer = responses[questionId];
        return !answer || (typeof answer === 'string' && answer.trim() === '');
      });
      
      if (unansweredMandatory.length > 0) {
        const unansweredQuestions = unansweredMandatory.map(questionId => {
          const question = questions.find(q => q.id === questionId);
          return question?.text;
        }).filter(Boolean);
        
        alert(`Mohon lengkapi pertanyaan wajib berikut:\n• ${unansweredQuestions.join('\n• ')}`);
        return;
      }
    }
    
    if (currentSection < assignedGroups.length - 1) {
      setCurrentSection(prev => prev + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };
  
  const handleSubmit = async () => {
    // Final validation for all mandatory questions
    const allUnansweredMandatory: { groupName: string; questions: string[] }[] = [];
    
    assignedGroups.forEach(group => {
      if (group?.mandatoryQuestionIds && group.mandatoryQuestionIds.length > 0) {
        const unansweredMandatory = group.mandatoryQuestionIds.filter(questionId => {
          const answer = responses[questionId];
          return !answer || (typeof answer === 'string' && answer.trim() === '');
        });
        
        if (unansweredMandatory.length > 0) {
          const unansweredQuestions = unansweredMandatory.map(questionId => {
            const question = questions.find(q => q.id === questionId);
            return question?.text;
          }).filter(Boolean);
          
          allUnansweredMandatory.push({
            groupName: group.name,
            questions: unansweredQuestions as string[]
          });
        }
      }
    });
    
    if (allUnansweredMandatory.length > 0) {
      let alertMessage = 'Masih ada pertanyaan wajib yang belum dijawab:\n\n';
      allUnansweredMandatory.forEach(({ groupName, questions }) => {
        alertMessage += `${groupName}:\n`;
        questions.forEach(question => {
          alertMessage += `• ${question}\n`;
        });
        alertMessage += '\n';
      });
      alert(alertMessage);
      setIsSubmitting(false);
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Siapkan data answers dengan format yang benar dan urutan yang tepat
      const answersData: Record<string, {
        questionText: string;
        questionType: string;
        answer: string | number;
        sectionName: string;
        categoryName: string;
        sectionOrder: number;
        questionOrder: number;
        groupId: string;
        questionId: string;
      }> = {};
      
      // Iterasi berdasarkan urutan grup dan pertanyaan yang benar
      assignedGroups.forEach((group, groupIndex) => {
        if (group?.questionIds) {
          group.questionIds.forEach((questionId, questionIndex) => {
            if (responses[questionId] !== undefined) {
              const question = questions.find(q => q.id === questionId);
              
              if (question) {
                answersData[questionId] = {
                  questionText: question.text,
                  questionType: question.type,
                  answer: responses[questionId],
                  sectionName: group.name,
                  categoryName: question.categoryId ? 'Kategori' : 'Tanpa Kategori',
                  // Simpan urutan yang benar berdasarkan posisi di grup
                  sectionOrder: groupIndex,
                  questionOrder: questionIndex,
                  // Tambahkan ID untuk referensi
                  groupId: group.id,
                  questionId: questionId
                };
              }
            }
          });
        }
      });
  
      // Simpan ke subcollection stores/{storeId}/responses
      const responseData = {
        storeId,
        storeName: store?.name || '',
        answers: answersData,
        questionGroupNames: assignedGroups.map(g => g?.name || '').filter(Boolean),
        // Simpan struktur grup dengan urutan yang benar
        questionGroupsOrder: assignedGroups.map((g, index) => ({
          groupId: g?.id || '',
          groupName: g?.name || '',
          order: index,
          questionIds: g?.questionIds || []
        })),
        submittedAt: new Date().toISOString(),
        customerInfo: {
          name: customerName || 'Pelanggan',
          phone: customerPhone || '',
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        },
        completionStatus: 'completed' as const,
        metadata: {
          totalQuestions: Object.keys(responses).length,
          completionRate: (Object.keys(responses).length / 
            assignedGroups.reduce((total, group) => total + (group?.questionIds?.length || 0), 0)) * 100
        }
      };
      
      // Simpan ke Firestore subcollection
      await addDoc(collection(db, 'stores', storeId, 'responses'), responseData);
      
      // Redirect ke halaman thank you
      router.push(`/survey/${storeId}/thank-you`);
    } catch (error) {
      console.error('Error saving response:', error);
      alert('Gagal menyimpan response. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!store || assignedGroups.length === 0) {
    return (
      <div className="p-6 text-center">
        <p>Toko tidak ditemukan atau belum memiliki grup pertanyaan.</p>
      </div>
    );
  }

  // Form input pelanggan
  if (showCustomerForm) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pelanggan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nama Lengkap *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Masukkan nama lengkap Anda"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Nomor Telepon (Opsional)</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Masukkan nomor telepon Anda"
              />
            </div>
            <Button 
              onClick={() => {
                if (customerName.trim()) {
                  setShowCustomerForm(false);
                } else {
                  alert('Nama harus diisi');
                }
              }}
              className="w-full"
            >
              Mulai Survey
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{store.name}</h1>
        <p className="text-gray-600">Survey Kepuasan Pelanggan</p>
        
        {/* Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Section {currentSection + 1} dari {assignedGroups.length}</span>
            <span>{currentGroup?.name}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentSection + 1) / assignedGroups.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{currentGroup?.name}</CardTitle>
          {currentGroup?.description && (
            <p className="text-gray-600">{currentGroup.description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {groupQuestions.map((question) => {
            // Perbaikan linter error: pastikan question tidak undefined
            if (!question) return null;
            
            return (
              <div key={question.id} className="space-y-2">
                <label className="block font-medium">
                  {question.text}
                  {currentGroup?.mandatoryQuestionIds?.includes(question.id) && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                
                {question.type === 'text' && (
                  <input
                    type="text"
                    className="w-full p-3 border rounded-md"
                    onChange={(e) => handleResponse(question.id, e.target.value)}
                    value={responses[question.id] || ''}
                    placeholder="Masukkan jawaban Anda..."
                  />
                )}
                
                {question.type === 'rating' && (
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleResponse(question.id, rating)}
                        className={`w-10 h-10 rounded-full border-2 ${
                          responses[question.id] === rating
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                )}
                
                {question.type === 'multiple_choice' && (
                  <div className="space-y-2">
                    {question.options?.map((option, index) => (
                      <label key={index} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          onChange={(e) => handleResponse(question.id, e.target.value)}
                          checked={responses[question.id] === option}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
      
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentSection === 0}
        >
          Sebelumnya
        </Button>
        
        {currentSection === assignedGroups.length - 1 ? (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Mengirim...' : 'Kirim Survey'}
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Selanjutnya
          </Button>
        )}
      </div>
    </div>
  );
}