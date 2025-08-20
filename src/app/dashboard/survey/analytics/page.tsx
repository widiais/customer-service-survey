'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/ui/multi-select';
import { Badge } from '@/components/ui/badge';
import { Download, Filter, FileSpreadsheet } from 'lucide-react';
import { useStores } from '@/hooks/useStores';
import { useQuestionGroups } from '@/hooks/useQuestionGroups';
import { useQuestions } from '@/hooks/useQuestions';
import { StoreAccessService } from '@/lib/storeAccessService';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import * as XLSX from 'xlsx';

interface SurveyResponse {
  id: string;
  storeId: string;
  storeName: string;
  customerName: string;
  customerPhone: string;
  submittedAt: string;
  questionGroupNames: string[];
  answers: Record<string, {
    questionText: string;
    questionType: string;
    answer: string | number;
    sectionName: string;
    categoryName: string;
  }>;
}

interface AnalyticsData {
  questionId: string;
  questionText: string;
  questionType: string;
  storeName: string;
  storeId: string; // Add this
  groupName: string;
  groupId: string; // Add this
  customerName: string;
  customerPhone: string;
  answer: string | number;
  submittedAt: string;
}

export default function SurveyAnalyticsPage() {
  const { user } = useAuth();
  const { stores } = useStores();
  const { questionGroups } = useQuestionGroups();
  const { questions } = useQuestions();
  
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);

  // Fetch survey responses
  const fetchResponses = useCallback(async () => {
    if (selectedStores.length === 0) return;

    setLoading(true);
    try {
      const allResponses: SurveyResponse[] = [];

      for (const storeId of selectedStores) {
        const responsesRef = collection(db, `stores/${storeId}/responses`);
        const snapshot = await getDocs(responsesRef);

        snapshot.docs.forEach(doc => {
          const data = doc.data();
          allResponses.push({
            id: doc.id,
            storeId: data.storeId,
            storeName: data.storeName,
            customerName: data.customerInfo?.name || 'Unknown',
            customerPhone: data.customerInfo?.phone || '',
            submittedAt: data.submittedAt,
            questionGroupNames: data.questionGroupNames || [],
            answers: data.answers || {}
          });
        });
      }

      setResponses(allResponses);
    } catch (error) {
      console.error('Error fetching responses:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedStores]);

  // Process analytics data
  useEffect(() => {
    const processedData: AnalyticsData[] = [];
    
    responses.forEach(response => {
      Object.entries(response.answers).forEach(([questionId, answerData]) => {
        // Filter by selected groups and questions
        const question = questions.find(q => q.id === questionId);
        if (!question) return;
        
        const isGroupSelected = selectedGroups.length === 0 || 
          selectedGroups.some(groupId => {
            const group = questionGroups.find(g => g.id === groupId);
            return group?.questionIds.includes(questionId);
          });
        
        const isQuestionSelected = selectedQuestions.length === 0 || 
          selectedQuestions.includes(questionId);
        
        if (isGroupSelected && isQuestionSelected) {
          // Find the group for this question
          const questionGroup = questionGroups.find(group => 
            group.questionIds.includes(questionId)
          );
          
          processedData.push({
            questionId,
            questionText: answerData.questionText,
            questionType: answerData.questionType,
            storeName: response.storeName,
            storeId: response.storeId,
            groupName: questionGroup?.name || answerData.sectionName,
            groupId: questionGroup?.id || '',
            customerName: response.customerName,
            customerPhone: response.customerPhone,
            answer: answerData.answer,
            submittedAt: response.submittedAt
          });
        }
      });
    });
    
    // Sort the data - first selected items appear at the top (descending priority)
    const sortedData = processedData.sort((a, b) => {
      // 1. Sort by store selection order - first selected store appears first
      if (selectedStores.length > 0) {
        const storeAIndex = selectedStores.indexOf(a.storeId);
        const storeBIndex = selectedStores.indexOf(b.storeId);
        if (storeAIndex !== storeBIndex) {
          // If one store is selected and other is not, prioritize selected (put at top)
          if (storeAIndex === -1) return 1;  // a goes down
          if (storeBIndex === -1) return -1; // b goes down, a goes up
          return storeAIndex - storeBIndex;   // earlier selection goes up
        }
      } else {
        // If no stores selected, use default store order
        const storeAIndex = stores.findIndex(store => store.id === a.storeId);
        const storeBIndex = stores.findIndex(store => store.id === b.storeId);
        if (storeAIndex !== storeBIndex) {
          return storeAIndex - storeBIndex;
        }
      }
      
      // 2. Sort by group selection order - first selected group appears first
      if (selectedGroups.length > 0) {
        const groupAIndex = selectedGroups.indexOf(a.groupId);
        const groupBIndex = selectedGroups.indexOf(b.groupId);
        if (groupAIndex !== groupBIndex) {
          // If one group is selected and other is not, prioritize selected (put at top)
          if (groupAIndex === -1) return 1;  // a goes down
          if (groupBIndex === -1) return -1; // b goes down, a goes up
          return groupAIndex - groupBIndex;   // earlier selection goes up
        }
      } else {
        // If no groups selected, use default group order
        const groupAIndex = questionGroups.findIndex(group => group.id === a.groupId);
        const groupBIndex = questionGroups.findIndex(group => group.id === b.groupId);
        if (groupAIndex !== groupBIndex) {
          return groupAIndex - groupBIndex;
        }
      }
      
      // 3. Sort by question selection order - first selected question appears first
      if (selectedQuestions.length > 0) {
        const questionAIndex = selectedQuestions.indexOf(a.questionId);
        const questionBIndex = selectedQuestions.indexOf(b.questionId);
        if (questionAIndex !== questionBIndex) {
          // If one question is selected and other is not, prioritize selected (put at top)
          if (questionAIndex === -1) return 1;  // a goes down
          if (questionBIndex === -1) return -1; // b goes down, a goes up
          return questionAIndex - questionBIndex; // earlier selection goes up
        }
      } else {
        // If no questions selected, use question order within group
        const groupA = questionGroups.find(group => group.id === a.groupId);
        const groupB = questionGroups.find(group => group.id === b.groupId);
        
        if (groupA && groupB && groupA.id === groupB.id) {
          const questionAIndex = groupA.questionIds.indexOf(a.questionId);
          const questionBIndex = groupB.questionIds.indexOf(b.questionId);
          if (questionAIndex !== questionBIndex) {
            return questionAIndex - questionBIndex;
          }
        }
      }
      
      // 4. If all else is equal, sort by submission date (newest first)
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });
    
    setAnalyticsData(sortedData);
  }, [responses, selectedGroups, selectedQuestions, questions, questionGroups, stores, selectedStores]);

  // Auto-fetch when stores change
  useEffect(() => {
    if (selectedStores.length > 0) {
      fetchResponses();
    }
  }, [selectedStores, fetchResponses]);

  // Prepare options for multi-select (filter based on access)
  const accessibleStores = StoreAccessService.filterAccessibleStores(user, stores);
  const storeOptions = accessibleStores.map(store => ({
    label: store.name,
    value: store.id
  }));

  const groupOptions = useMemo(() => {
    if (selectedStores.length === 0) return [];
    
    const availableGroups = questionGroups.filter(group => {
      return selectedStores.some(storeId => {
        const store = stores.find(s => s.id === storeId);
        return store?.questionGroupIds?.includes(group.id);
      });
    });
    
    return availableGroups.map(group => ({
      label: group.name,
      value: group.id
    }));
  }, [selectedStores, questionGroups, stores]);

  const questionOptions = useMemo(() => {
    if (selectedGroups.length === 0) return [];
    
    const availableQuestions = questions.filter(question => {
      return selectedGroups.some(groupId => {
        const group = questionGroups.find(g => g.id === groupId);
        return group?.questionIds.includes(question.id);
      });
    });
    
    return availableQuestions.map(question => ({
      label: question.text,
      value: question.id
    }));
  }, [selectedGroups, questions, questionGroups]);

  // Export to Excel (current format)
  const exportToExcel = () => {
    const exportData = analyticsData.map(item => ({
      'Nama Toko': item.storeName,
      'Grup Pertanyaan': item.groupName,
      'Pertanyaan': item.questionText,
      'Jenis Pertanyaan': item.questionType,
      'Nama Pelanggan': item.customerName,
      'No. Telepon': item.customerPhone,
      'Jawaban': item.answer,
      'Tanggal Submit': new Date(item.submittedAt).toLocaleDateString('id-ID')
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Analytics Data');

    const fileName = `survey-analytics-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Export to Excel - Flat format (questions as columns)
  const exportFlatToExcel = () => {
    if (analyticsData.length === 0) return;

    // Group data by customer and store (to create unique rows)
    const customerRows = new Map<string, Record<string, string | number>>();

    analyticsData.forEach(item => {
      const key = `${item.storeName}-${item.customerName}-${item.customerPhone}-${item.submittedAt}`;

      if (!customerRows.has(key)) {
        customerRows.set(key, {
          'Nama': item.customerName,
          'Whatsapp': item.customerPhone,
          'Toko': item.storeName,
          'Tanggal Submit': new Date(item.submittedAt).toLocaleDateString('id-ID'),
          // We'll add question columns dynamically
        });
      }

      // Add the question answer to the row
      const row = customerRows.get(key);
      if (row) {
        row[item.questionText] = item.answer;
      }
    });

    // Get all unique questions for headers (after Nama, Whatsapp, Toko, Tanggal Submit)
    const allQuestions = new Set<string>();
    analyticsData.forEach(item => {
      allQuestions.add(item.questionText);
    });

    // Create headers array
    const headers = ['Nama', 'Whatsapp', 'Toko', 'Tanggal Submit', ...Array.from(allQuestions)];

    // Convert map to array and ensure all columns exist
    const exportData = Array.from(customerRows.values()).map(row => {
      const result: Record<string, string | number> = { ...row };
      // Ensure all question columns exist (fill with empty string if no answer)
      Array.from(allQuestions).forEach(question => {
        if (!(question in result)) {
          result[question] = '';
        }
      });
      return result;
    });

    // Create and download Excel file
    const ws = XLSX.utils.json_to_sheet(exportData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Survey Responses - Flat');

    const fileName = `survey-responses-flat-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };



  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Survey</h1>
        <p className="text-gray-600">Analisis mendalam dari hasil survey pelanggan</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Pilih Toko</label>
              <MultiSelect
                options={storeOptions}
                selected={selectedStores}
                onChange={setSelectedStores}
                placeholder="Pilih toko..."
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Pilih Grup Pertanyaan</label>
              <MultiSelect
                options={groupOptions}
                selected={selectedGroups}
                onChange={setSelectedGroups}
                placeholder="Pilih grup pertanyaan..."
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Pilih Pertanyaan</label>
              <MultiSelect
                options={questionOptions}
                selected={selectedQuestions}
                onChange={setSelectedQuestions}
                placeholder="Pilih pertanyaan..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Hasil Analytics ({analyticsData.length} data)</CardTitle>
            <div className="flex gap-2">
              <Button onClick={exportFlatToExcel} disabled={analyticsData.length === 0}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export Flat Excel
              </Button>
              <Button onClick={exportToExcel} disabled={analyticsData.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : analyticsData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Toko</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Grup</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Pertanyaan</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Jenis</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Pelanggan</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Telepon</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Jawaban</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">{item.storeName}</td>
                      <td className="border border-gray-300 px-4 py-2">{item.groupName}</td>
                      <td className="border border-gray-300 px-4 py-2">{item.questionText}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <Badge variant="outline">{item.questionType}</Badge>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">{item.customerName}</td>
                      <td className="border border-gray-300 px-4 py-2">{item.customerPhone}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.questionType === 'rating' ? (
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`text-sm ${
                                  star <= Number(item.answer) ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                              >
                                ★
                              </span>
                            ))}
                            <span className="ml-1 text-sm">({item.answer})</span>
                          </div>
                        ) : (
                          <span>{item.answer}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(item.submittedAt).toLocaleDateString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {selectedStores.length === 0 
                  ? 'Pilih toko untuk melihat data analytics'
                  : 'Tidak ada data yang sesuai dengan filter yang dipilih'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}