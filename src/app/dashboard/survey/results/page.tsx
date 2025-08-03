'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Eye, Search, Filter, Download } from 'lucide-react';
import { useStores } from '@/hooks/useStores';
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
  const { stores } = useStores();
  const [searchTerm, setSearchTerm] = useState('');
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<string>('all');

  // Fetch data dari Firestore
  useEffect(() => {
    const fetchSurveyResponses = async () => {
      try {
        setLoading(true);
        const responsesData: SurveyResponse[] = [];
        
        // Fetch responses dari semua toko
        for (const store of stores) {
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
  }, [stores]);

  const filteredResponses = responses.filter(response => {
    const matchesSearch = response.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         response.storeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStore = selectedStore === 'all' || response.storeId === selectedStore;
    return matchesSearch && matchesStore;
  });

  const handleViewDetail = (responseId: string, storeId: string) => {
    router.push(`/dashboard/survey/results/${storeId}/${responseId}`);
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
              {stores.map(store => (
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
                <Button
                  size="sm"
                  onClick={() => handleViewDetail(response.id, response.storeId)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Lihat Detail
                </Button>
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