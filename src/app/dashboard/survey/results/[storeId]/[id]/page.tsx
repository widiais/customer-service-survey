'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, User, Store, Calendar, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { SurveyService } from '@/lib/surveyService';
import { useStores } from '@/hooks/useStores';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';

interface QuestionAnswer {
  questionId: string;
  questionText: string;
  questionType: 'text' | 'rating' | 'multiple_choice';
  answer: string | number;
  sectionName: string;
  categoryName: string;
  sectionOrder?: number;
  questionOrder?: number;
  groupId?: string;
}

interface SurveySection {
  sectionName: string;
  answers: QuestionAnswer[];
}

interface SurveyDetail {
  id: string;
  storeId: string;
  storeName: string;
  customerName: string;
  customerPhone: string;
  submittedAt: string;
  questionGroupNames: string[];
  sections: SurveySection[];
  completionStatus: 'completed' | 'partial';
}

interface GroupOrderInfo {
  groupId: string;
  groupName: string;
  order: number;
  questionIds: string[];
}

interface AnswerData {
  questionText: string;
  questionType: 'text' | 'rating' | 'multiple_choice';
  answer: string | number;
  sectionName?: string;
  categoryName?: string;
  sectionOrder?: number;
  questionOrder?: number;
}

export default function SurveyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const responseId = params.id as string;
  const storeId = params.storeId as string;
  const { user } = useAuth();
  const { stores } = useStores();
  
  const [surveyDetail, setSurveyDetail] = useState<SurveyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchSurveyDetail = async () => {
      try {
        setLoading(true);
        
        const responseRef = doc(db, `stores/${storeId}/responses`, responseId);
        const responseDoc = await getDoc(responseRef);
        
        if (responseDoc.exists()) {
          const data = responseDoc.data();
          
          // Gunakan questionGroupsOrder untuk mengurutkan dengan benar
          let orderedSections: SurveySection[] = [];
          
          if (data.questionGroupsOrder && data.answers) {
            // Urutkan berdasarkan questionGroupsOrder yang tersimpan
            const sortedGroups = data.questionGroupsOrder.sort((a: GroupOrderInfo, b: GroupOrderInfo) => a.order - b.order);
            
            sortedGroups.forEach((groupInfo: GroupOrderInfo) => {
              const sectionAnswers: QuestionAnswer[] = [];
              
              // Urutkan pertanyaan berdasarkan questionIds yang tersimpan di grup
              if (groupInfo.questionIds) {
                groupInfo.questionIds.forEach((questionId: string, questionIndex: number) => {
                  if (data.answers[questionId]) {
                    const answerData = data.answers[questionId];
                    sectionAnswers.push({
                      questionId,
                      questionText: answerData.questionText,
                      questionType: answerData.questionType,
                      answer: answerData.answer,
                      sectionName: answerData.sectionName || groupInfo.groupName,
                      categoryName: answerData.categoryName || 'Umum',
                      sectionOrder: groupInfo.order,
                      questionOrder: questionIndex,
                      groupId: groupInfo.groupId
                    });
                  }
                });
              }
              
              if (sectionAnswers.length > 0) {
                orderedSections.push({
                  sectionName: groupInfo.groupName,
                  answers: sectionAnswers
                });
              }
            });
          } else {
            // Fallback ke metode lama jika tidak ada questionGroupsOrder
            const sectionsMap = new Map<string, QuestionAnswer[]>();
            
            if (data.answers) {
              Object.entries(data.answers).forEach(([questionId, answerData]) => {
                const typedAnswerData = answerData as AnswerData;
                const sectionName = typedAnswerData.sectionName || 'Umum';
                
                if (!sectionsMap.has(sectionName)) {
                  sectionsMap.set(sectionName, []);
                }
                
                sectionsMap.get(sectionName)!.push({
                  questionId,
                  questionText: typedAnswerData.questionText,
                  questionType: typedAnswerData.questionType,
                  answer: typedAnswerData.answer,
                  sectionName,
                  categoryName: typedAnswerData.categoryName || 'Umum',
                  sectionOrder: typedAnswerData.sectionOrder || 0,
                  questionOrder: typedAnswerData.questionOrder || 0
                });
              });
            }
            
            orderedSections = Array.from(sectionsMap.entries())
              .map(([sectionName, answers]) => ({
                sectionName,
                answers: answers.sort((a, b) => (a.questionOrder || 0) - (b.questionOrder || 0))
              }))
              .sort((a, b) => {
                const aOrder = a.answers[0]?.sectionOrder || 0;
                const bOrder = b.answers[0]?.sectionOrder || 0;
                return aOrder - bOrder;
              });
          }
          
          // Urutkan questionGroupNames berdasarkan order
          let orderedGroupNames = data.questionGroupNames || [];
          if (data.questionGroupsOrder) {
            orderedGroupNames = data.questionGroupsOrder
              .sort((a: GroupOrderInfo, b: GroupOrderInfo) => a.order - b.order)
              .map((group: GroupOrderInfo) => group.groupName);
          }
          
          setSurveyDetail({
            id: responseDoc.id,
            storeId: data.storeId,
            storeName: data.storeName,
            customerName: data.customerInfo?.name || 'Unknown',
            customerPhone: data.customerInfo?.phone || '',
            submittedAt: data.submittedAt,
            questionGroupNames: orderedGroupNames,
            sections: orderedSections,
            completionStatus: data.completionStatus || 'completed'
          });
        }
      } catch (error) {
        console.error('Error fetching survey detail:', error);
      } finally {
        setLoading(false);
      }
    };

    if (storeId && responseId) {
      fetchSurveyDetail();
    }
  }, [responseId, storeId]);

  const handleDeleteResponse = async () => {
    // Find the store to check permissions
    const store = stores.find(s => s.id === storeId);
    if (!store || !user) return;

    // Check if user can delete this response
    if (!SurveyService.canDeleteSurveyResponse(user, store)) {
      alert('Anda tidak memiliki izin untuk menghapus hasil survey ini');
      return;
    }

    const confirmed = confirm(
      'Apakah Anda yakin ingin menghapus hasil survey ini?\n\nTindakan ini tidak dapat dibatalkan dan Anda akan diarahkan kembali ke daftar hasil survey.'
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      
      // Delete from the correct collection path
      await SurveyService.deleteSurveyResponse(`stores/${storeId}/responses/${responseId}`);
      
      alert('Hasil survey berhasil dihapus');
      router.push('/dashboard/survey/results');
    } catch (error) {
      console.error('Error deleting survey response:', error);
      alert('Gagal menghapus hasil survey. Silakan coba lagi.');
    } finally {
      setDeleting(false);
    }
  };

  // Check if user can delete this response
  const canDelete = (): boolean => {
    if (!user) return false;
    const store = stores.find(s => s.id === storeId);
    if (!store) return false;
    return SurveyService.canDeleteSurveyResponse(user, store);
  };

  const renderAnswer = (answer: QuestionAnswer) => {
    switch (answer.questionType) {
      case 'rating':
        return (
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-lg ${
                  star <= (answer.answer as number) ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                ★
              </span>
            ))}
            <span className="ml-2 text-sm text-gray-600">({answer.answer}/5)</span>
          </div>
        );
      case 'multiple_choice':
        return (
          <Badge variant="outline" className="text-sm">
            {answer.answer}
          </Badge>
        );
      case 'text':
      default:
        return (
          <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
            {answer.answer}
          </p>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!surveyDetail) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Data survey tidak ditemukan</p>
        <Link href="/dashboard/survey/results">
          <Button className="mt-4">Kembali ke Hasil Survey</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/survey/results">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Detail Hasil Survey</h1>
          <p className="text-gray-600">ID: {surveyDetail.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          
          {canDelete() && (
            <Button
              variant="destructive"
              onClick={handleDeleteResponse}
              disabled={deleting}
            >
              {deleting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus Survey
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Customer & Store Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Pelanggan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div><strong>Nama:</strong> {surveyDetail.customerName}</div>
              <div><strong>Telepon:</strong> {surveyDetail.customerPhone}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Informasi Toko
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div><strong>Nama Toko:</strong> {surveyDetail.storeName}</div>
              <div><strong>Grup Survey:</strong> {surveyDetail.questionGroupNames.join(', ')}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informasi Survey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div><strong>Tanggal:</strong> {new Date(surveyDetail.submittedAt).toLocaleDateString('id-ID')}</div>
              <div className="flex items-center gap-2">
                <strong>Status:</strong>
                <Badge 
                  variant={surveyDetail.completionStatus === 'completed' ? 'default' : 'secondary'}
                >
                  {surveyDetail.completionStatus === 'completed' ? 'Selesai' : 'Sebagian'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Survey Answers */}
      <div className="space-y-6">
        {surveyDetail.sections.map((section, sectionIndex) => (
          <Card key={sectionIndex}>
            <CardHeader>
              <CardTitle>{section.sectionName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {section.answers.map((answer, answerIndex) => (
                  <div key={answer.questionId} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {answerIndex + 1}. {answer.questionText}
                        </div>
                        <Badge variant="secondary" className="mt-1">
                          {answer.categoryName}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-3">
                      {renderAnswer(answer)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {surveyDetail?.sections.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Belum ada jawaban survey yang tersedia</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}