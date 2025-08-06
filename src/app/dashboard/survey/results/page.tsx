'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Eye, Search, Filter, Download, Trash2 } from 'lucide-react';
import { useStores } from '@/hooks/useStores';
import { StoreAccessService } from '@/lib/storeAccessService';
import { SurveyService } from '@/lib/surveyService';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch data dari Firestore
  useEffect(() => {
    const fetchSurveyResponses = async () => {
      try {
        setLoading(true);
        const responsesData: SurveyResponse[] = [];
        
        // Filter stores based on user access
        const accessibleStores = StoreAccessService.filterAccessibleStores(user, stores);
        
        // Fetch responses dari toko yang dapat diakses
        for (const store of accessibleStores) {
          const responsesRef = collection(db, `stores/${store.id}/responses`);
          const responsesQuery = query(responsesRef, orderBy('submittedAt', 'desc'));
          const responsesSnapshot = await getDocs(responsesQuery);
          
          responsesSnapshot.forEach((doc) => {
            const data = doc.data();
            responsesData.push({
              id: doc.id,
              storeId: store.id,
              storeName: store.name,
              customerName: data.customerInfo?.name || 'Unknown',
              submittedAt: data.submittedAt,
              questionGroupNames: data.questionGroupNames || [],
              totalQuestions: data.answers ? Object.keys(data.answers).length : 0,
              completionStatus: data.completionStatus || 'completed'
            });
          });
        }
        
        setResponses(responsesData);
      } catch (error) {
        console.error('Error fetching survey responses:', error);
      } finally {
        setLoading(false);
      }
    };

    if (stores.length > 0) {
      fetchSurveyResponses();
    }
  }, [stores, user, refreshTrigger]);

  const filteredResponses = responses.filter(response => {
    const matchesSearch = response.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         response.storeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStore = selectedStore === 'all' || response.storeId === selectedStore;
    return matchesSearch && matchesStore;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">Hasil Survey</h1>
          <p className="text-gray-600">Kelola dan lihat hasil survey dari pelanggan</p>
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
                  placeholder="Cari berdasarkan nama pelanggan atau toko..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
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
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Hasil Survey ({filteredResponses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredResponses.map((response) => (
              <div
                key={response.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{response.customerName}</h3>
                    <Badge variant={response.completionStatus === 'completed' ? 'default' : 'secondary'}>
                      {response.completionStatus === 'completed' ? 'Selesai' : 'Sebagian'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{response.storeName}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>Tanggal: {new Date(response.submittedAt).toLocaleDateString('id-ID')}</span>
                    <span>Pertanyaan: {response.totalQuestions}</span>
                    <span>Grup: {response.questionGroupNames.join(', ')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleViewDetail(response.id, response.storeId)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Lihat Detail
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
                          Hapus
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {filteredResponses.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Belum ada hasil survey yang ditemukan</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}