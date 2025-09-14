'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Download, ArrowLeft, BarChart3 } from 'lucide-react';
import { useStores } from '@/hooks/useStores';
import { StoreAccessService } from '@/lib/storeAccessService';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { RatingCharts } from '@/components/charts/RatingCharts';
import { ChecklistCharts } from '@/components/charts/ChecklistCharts';
import { MultipleChoiceCharts } from '@/components/charts/MultipleChoiceCharts';
import { RatingAnalyticsService, RatingData } from '@/lib/ratingAnalyticsService';
import { ChecklistAnalyticsService, ChecklistData } from '@/lib/checklistAnalyticsService';
import { MultipleChoiceAnalyticsService, MultipleChoiceData } from '@/lib/multipleChoiceAnalyticsService';

// Interface untuk subject/survey data
interface SurveySubject {
  storeId: string;
  storeName: string;
  responseCount: number;
  creatorName?: string;
  lastSubmission?: string;
}


export default function SurveyGrafikPage() {
  const { user } = useAuth();
  const { stores } = useStores();
  const [searchTerm, setSearchTerm] = useState('');
  const [subjects, setSubjects] = useState<SurveySubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [ratingData, setRatingData] = useState<RatingData[]>([]);
  const [loadingRatingData, setLoadingRatingData] = useState(false);
  const [selectedRatingQuestion, setSelectedRatingQuestion] = useState<string | null>(null);
  const [checklistData, setChecklistData] = useState<ChecklistData[]>([]);
  const [loadingChecklistData, setLoadingChecklistData] = useState(false);
  const [selectedChecklistQuestion, setSelectedChecklistQuestion] = useState<string | null>(null);
  const [multipleChoiceData, setMultipleChoiceData] = useState<MultipleChoiceData[]>([]);
  const [loadingMultipleChoiceData, setLoadingMultipleChoiceData] = useState(false);
  const [selectedMultipleChoiceQuestion, setSelectedMultipleChoiceQuestion] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'rating' | 'checklist' | 'multiple_choice'>('rating');

  // Fetch subjects/surveys from Firestore with optimized queries
  useEffect(() => {
    const fetchSurveySubjects = async () => {
      try {
        setLoading(true);

        // Filter stores based on user access
        const accessibleStores = StoreAccessService.filterAccessibleStores(user, stores);

        // Optimized batch queries - limit to first 10 responses per store for counting
        const batchPromises = accessibleStores.map(async (store) => {
          try {
            const responsesRef = collection(db, `stores/${store.id}/responses`);
            // Use limit to avoid loading all documents
            const limitedQuery = query(responsesRef, orderBy('submittedAt', 'desc'), limit(10));
            const responsesSnapshot = await getDocs(limitedQuery);

            if (!responsesSnapshot.empty) {
              // Get total count using a separate lightweight query
              const countQuery = query(responsesRef);
              const allDocs = await getDocs(countQuery);

              let lastSubmission = '';
              responsesSnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.submittedAt && (!lastSubmission || data.submittedAt > lastSubmission)) {
                  lastSubmission = data.submittedAt;
                }
              });

              return {
                storeId: store.id,
                storeName: store.name,
                responseCount: allDocs.size,
                creatorName: store.manager ? 'Store Manager' : 'Admin',
                lastSubmission
              };
            }
            return null;
          } catch (error) {
            console.error(`Error fetching data for store ${store.id}:`, error);
            return null;
          }
        });

        const results = await Promise.allSettled(batchPromises);
        const validResults = results
          .filter(result => result.status === 'fulfilled' && result.value !== null)
          .map(result => (result as PromiseFulfilledResult<SurveySubject>).value);

        setSubjects(validResults);
      } catch (error) {
        console.error('Error fetching survey subjects:', error);
      } finally {
        setLoading(false);
      }
    };

    if (stores.length > 0) {
      fetchSurveySubjects();
    }
  }, [stores, user]);


  // Fetch rating analytics for selected subject
  const fetchRatingAnalytics = async (storeId: string) => {
    try {
      setLoadingRatingData(true);
      const analytics = await RatingAnalyticsService.getRatingAnalytics(storeId);
      setRatingData(analytics);
      if (analytics.length > 0) {
        setSelectedRatingQuestion(analytics[0].questionId);
      }
    } catch (error) {
      console.error('Error fetching rating analytics:', error);
    } finally {
      setLoadingRatingData(false);
    }
  };

  // Fetch checklist analytics for selected subject
  const fetchChecklistAnalytics = async (storeId: string) => {
    try {
      setLoadingChecklistData(true);
      const analytics = await ChecklistAnalyticsService.getChecklistAnalytics(storeId);
      setChecklistData(analytics);
      if (analytics.length > 0) {
        setSelectedChecklistQuestion(analytics[0].questionId);
      }
    } catch (error) {
      console.error('Error fetching checklist analytics:', error);
    } finally {
      setLoadingChecklistData(false);
    }
  };

  // Fetch multiple choice analytics for selected subject
  const fetchMultipleChoiceAnalytics = async (storeId: string) => {
    try {
      setLoadingMultipleChoiceData(true);
      const analytics = await MultipleChoiceAnalyticsService.getMultipleChoiceAnalytics(storeId);
      setMultipleChoiceData(analytics);
      if (analytics.length > 0) {
        setSelectedMultipleChoiceQuestion(analytics[0].questionId);
      }
    } catch (error) {
      console.error('Error fetching multiple choice analytics:', error);
    } finally {
      setLoadingMultipleChoiceData(false);
    }
  };

  // Handle subject selection
  const handleViewSubject = (storeId: string) => {
    setSelectedSubject(storeId);
    fetchRatingAnalytics(storeId);
    fetchChecklistAnalytics(storeId);
    fetchMultipleChoiceAnalytics(storeId);
  };

  // Handle back to subjects list
  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setRatingData([]);
    setSelectedRatingQuestion(null);
    setChecklistData([]);
    setSelectedChecklistQuestion(null);
    setMultipleChoiceData([]);
    setSelectedMultipleChoiceQuestion(null);
    setActiveTab('rating');
  };


  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.storeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStore = selectedStore === 'all' || subject.storeId === selectedStore;
    return matchesSearch && matchesStore;
  });

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number = 30) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {selectedSubject && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToSubjects}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {selectedSubject ? 'Grafik Survey' : 'Grafik Survey'}
            </h1>
            <p className="text-gray-600">
              {selectedSubject
                ? `Analisis survey untuk ${stores.find(s => s.id === selectedSubject)?.name}`
                : 'Kelola dan lihat grafik survey dari pelanggan'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={selectedSubject ? "Cari berdasarkan nama pelanggan..." : "Cari berdasarkan nama survey..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {!selectedSubject && (
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">Semua Toko</option>
                {StoreAccessService.filterAccessibleStores(user, stores).map(store => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subjects Table */}
      {!selectedSubject && (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
                Daftar Survey ({filteredSubjects.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Nama Survey</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Creator Store</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Jumlah Jawaban</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubjects.map((subject) => (
                    <tr key={subject.storeId} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div title={subject.storeName} className="font-medium text-gray-900">
                          {truncateText(subject.storeName, 40)}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {subject.creatorName || 'Admin'}
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant="secondary" className="font-medium">
                          {subject.responseCount} jawaban
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <Button
                          size="sm"
                          onClick={() => handleViewSubject(subject.storeId)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Lihat Grafik
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredSubjects.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-lg">Belum ada survey yang ditemukan</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts View */}
      {selectedSubject && (
        <div className="space-y-6">
          {/* Tab Navigation */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('rating')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'rating'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Rating Charts
                </button>
                <button
                  onClick={() => setActiveTab('checklist')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'checklist'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Checklist Charts
                </button>
                <button
                  onClick={() => setActiveTab('multiple_choice')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'multiple_choice'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Pilihan Ganda Charts
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Rating Charts */}
          {activeTab === 'rating' && (
            <>
              {loadingRatingData ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Tunggu ya, lagi load data rating...</p>
                  </CardContent>
                </Card>
              ) : (
                <RatingCharts
                  ratingData={ratingData}
                  selectedQuestion={selectedRatingQuestion || undefined}
                  onQuestionSelect={setSelectedRatingQuestion}
                />
              )}
            </>
          )}

          {/* Checklist Charts */}
          {activeTab === 'checklist' && (
            <>
              {loadingChecklistData ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Tunggu ya, lagi load data checklist...</p>
                  </CardContent>
                </Card>
              ) : (
                <ChecklistCharts
                  checklistData={checklistData}
                  selectedQuestion={selectedChecklistQuestion || undefined}
                  onQuestionSelect={setSelectedChecklistQuestion}
                />
              )}
            </>
          )}

          {/* Multiple Choice Charts */}
          {activeTab === 'multiple_choice' && (
            <>
              {loadingMultipleChoiceData ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Tunggu ya, lagi load data pilihan ganda...</p>
                  </CardContent>
                </Card>
              ) : (
                <MultipleChoiceCharts
                  multipleChoiceData={multipleChoiceData}
                  selectedQuestion={selectedMultipleChoiceQuestion || undefined}
                  onQuestionSelect={setSelectedMultipleChoiceQuestion}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
