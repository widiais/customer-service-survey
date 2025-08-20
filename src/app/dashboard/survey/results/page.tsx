'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Eye, Search, Download, Trash2 } from 'lucide-react';
import { useStores } from '@/hooks/useStores';
import { StoreAccessService } from '@/lib/storeAccessService';
import { SurveyService } from '@/lib/surveyService';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Interface untuk subject/survey data
interface SurveySubject {
  storeId: string;
  storeName: string;
  responseCount: number;
  creatorName?: string;
  lastSubmission?: string;
}

// Interface untuk response data
interface SurveyResponse {
  id: string;
  storeId: string;
  storeName: string;
  customerName: string;
  submittedAt: string;
  questionGroupNames: string[];
  totalQuestions: number;
  completionStatus: 'completed' | 'partial';
}

export default function SurveyResultsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { stores } = useStores();
  const [searchTerm, setSearchTerm] = useState('');
  const [subjects, setSubjects] = useState<SurveySubject[]>([]);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreResponses, setHasMoreResponses] = useState(false);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const responsesPerPage = 20;

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
  }, [stores, user, refreshTrigger]);

  // Fetch responses for selected subject with pagination
  const fetchResponsesForSubject = async (storeId: string, page: number = 1) => {
    try {
      setLoadingResponses(true);
      const responsesData: SurveyResponse[] = [];
      const responsesRef = collection(db, `stores/${storeId}/responses`);

      // Fetch one extra item to check if there are more pages
      const responsesQuery = query(
        responsesRef,
        orderBy('submittedAt', 'desc'),
        limit(responsesPerPage + 1)
      );
      const responsesSnapshot = await getDocs(responsesQuery);

      // Check if there are more pages
      setHasMoreResponses(responsesSnapshot.docs.length > responsesPerPage);

      // Process only the current page items
      const docsToProcess = responsesSnapshot.docs.slice(0, responsesPerPage);
      docsToProcess.forEach((doc) => {
        const data = doc.data();
        responsesData.push({
          id: doc.id,
          storeId,
          storeName: stores.find(s => s.id === storeId)?.name || 'Unknown Store',
          customerName: data.customerInfo?.name || 'Unknown',
          submittedAt: data.submittedAt,
          questionGroupNames: data.questionGroupNames || [],
          totalQuestions: data.answers ? Object.keys(data.answers).length : 0,
          completionStatus: data.completionStatus || 'completed'
        });
      });

      if (page === 1) {
        setResponses(responsesData);
      } else {
        setResponses(prev => [...prev, ...responsesData]);
      }
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching responses for subject:', error);
    } finally {
      setLoadingResponses(false);
    }
  };

  // Handle subject selection
  const handleViewSubject = (storeId: string) => {
    setSelectedSubject(storeId);
    setCurrentPage(1);
    fetchResponsesForSubject(storeId, 1);
  };

  // Handle back to subjects list
  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setResponses([]);
    setCurrentPage(1);
    setHasMoreResponses(false);
  };

  // Handle load more responses
  const handleLoadMoreResponses = () => {
    if (selectedSubject && hasMoreResponses) {
      fetchResponsesForSubject(selectedSubject, currentPage + 1);
    }
  };

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.storeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStore = selectedStore === 'all' || subject.storeId === selectedStore;
    return matchesSearch && matchesStore;
  });

  const filteredResponses = responses.filter(response => {
    const matchesSearch = response.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         response.storeName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number = 30) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleViewDetail = (responseId: string, storeId: string) => {
    router.push(`/dashboard/survey/results/${storeId}/${responseId}`);
  };

  const handleDeleteResponse = async (responseId: string, storeId: string) => {
    // Find the store to check permissions
    const store = stores.find(s => s.id === storeId);
    if (!store || !user) return;

    // Check if user can delete this response
    if (!SurveyService.canDeleteSurveyResponse(user, store)) {
      alert('Anda tidak memiliki izin untuk menghapus hasil survey ini');
      return;
    }

    const confirmed = confirm(
      'Apakah Anda yakin ingin menghapus hasil survey ini?\n\nTindakan ini tidak dapat dibatalkan.'
    );

    if (!confirmed) return;

    try {
      setDeletingId(responseId);
      
      // Delete from the correct collection path
      await SurveyService.deleteSurveyResponse(`stores/${storeId}/responses/${responseId}`);
      
      // Refresh the data
      setRefreshTrigger(prev => prev + 1);
      
      alert('Hasil survey berhasil dihapus');
    } catch (error) {
      console.error('Error deleting survey response:', error);
      alert('Gagal menghapus hasil survey. Silakan coba lagi.');
    } finally {
      setDeletingId(null);
    }
  };

  // Check if user can delete responses for a store
  const canDeleteResponse = (storeId: string): boolean => {
    if (!user) return false;
    const store = stores.find(s => s.id === storeId);
    if (!store) return false;
    return SurveyService.canDeleteSurveyResponse(user, store);
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedSubject ? 'Jawaban Survey' : 'Hasil Survey'}
          </h1>
          <p className="text-gray-600">
            {selectedSubject
              ? `Daftar jawaban untuk ${stores.find(s => s.id === selectedSubject)?.name}`
              : 'Kelola dan lihat hasil survey dari pelanggan'
            }
          </p>
          {selectedSubject && (
            <Button
              variant="outline"
              onClick={handleBackToSubjects}
              className="mt-2"
            >
              ← Kembali ke Daftar Survey
            </Button>
          )}
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
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

      {/* Subjects Table or Responses Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedSubject
              ? `Jawaban Survey (${filteredResponses.length})`
              : `Daftar Survey (${filteredSubjects.length})`
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedSubject ? (
            /* Subjects Table */
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Nama Survey</th>
                    <th className="text-left py-3 px-4 font-medium">Creator Store</th>
                    <th className="text-left py-3 px-4 font-medium">Jumlah Jawaban</th>
                    <th className="text-left py-3 px-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubjects.map((subject) => (
                    <tr key={subject.storeId} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div title={subject.storeName}>
                          {truncateText(subject.storeName, 40)}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {subject.creatorName || 'Admin'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">
                          {subject.responseCount} jawaban
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          onClick={() => handleViewSubject(subject.storeId)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredSubjects.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Belum ada survey yang ditemukan</p>
                </div>
              )}
            </div>
          ) : (
            /* Responses Table */
            <div className="overflow-x-auto">
              {loadingResponses ? (
                /* Loading State */
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 text-lg">Tunggu ya, lagi load datanya...</p>
                </div>
              ) : responses.length === 0 ? (
                /* Empty State */
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📊</div>
                  <p className="text-gray-600 text-lg">Belum ada data masuk nih...</p>
                  <p className="text-gray-500 text-sm mt-2">Survey ini belum memiliki jawaban dari customer</p>
                </div>
              ) : (
                <>
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Nama</th>
                        <th className="text-left py-3 px-4 font-medium">Tanggal Pengisian</th>
                        <th className="text-left py-3 px-4 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResponses.map((response) => (
                        <tr key={response.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-medium">{response.customerName}</div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {new Date(response.submittedAt).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleViewDetail(response.id, response.storeId)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>

                              {canDeleteResponse(response.storeId) && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteResponse(response.id, response.storeId)}
                                  disabled={deletingId === response.id}
                                >
                                  {deletingId === response.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  ) : (
                                    <>
                                      <Trash2 className="h-4 w-4 mr-1" />
                                      Delete
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {hasMoreResponses && filteredResponses.length > 0 && (
                    <div className="flex justify-center mt-4">
                      <Button
                        onClick={handleLoadMoreResponses}
                        variant="outline"
                        className="px-6"
                      >
                        Load More Responses ({responsesPerPage} per page)
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}