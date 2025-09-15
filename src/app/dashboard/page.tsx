'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, FileText, Users, TrendingUp } from 'lucide-react';
import { useStores } from '@/hooks/useStores';
import { useQuestionnaires } from '@/hooks/useQuestionnaires';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface RecentSurvey {
  id: string;
  storeName: string;
  submittedAt: string;
  status: string;
}

interface RegionalPerformance {
  region: string;
  rating: string;
}

interface SurveyAnswer {
  questionType: string;
  answer: string | number;
}

export default function DashboardPage() {
  const { stores, loading: storesLoading } = useStores();
  const { stats, loading: statsLoading } = useQuestionnaires();
  const [recentSurveys, setRecentSurveys] = useState<RecentSurvey[]>([]);
  const [regionalPerformance, setRegionalPerformance] = useState<RegionalPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch recent surveys
  useEffect(() => {
    const fetchRecentSurveys = async () => {
      try {
        const recentData: RecentSurvey[] = [];
        
        // Fetch recent responses from all stores
        for (const store of stores.slice(0, 5)) { // Limit to first 5 stores for performance
          const responsesRef = collection(db, `stores/${store.id}/responses`);
          const recentQuery = query(responsesRef, orderBy('submittedAt', 'desc'), limit(2));
          const snapshot = await getDocs(recentQuery);
          
          snapshot.docs.forEach(doc => {
            const data = doc.data();
            recentData.push({
              id: doc.id,
              storeName: store.name,
              submittedAt: data.submittedAt,
              status: 'Selesai'
            });
          });
        }
        
        // Sort by submission time and take latest 4
        const sortedRecent = recentData
          .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
          .slice(0, 4);
        
        setRecentSurveys(sortedRecent);
      } catch (error) {
        console.error('Error fetching recent surveys:', error);
      }
    };

    if (stores.length > 0) {
      fetchRecentSurveys();
    }
  }, [stores]);

  // Calculate regional performance
  useEffect(() => {
    const calculateRegionalPerformance = async () => {
      try {
        const regionMap = new Map<string, { total: number; count: number }>();
        
        // Group stores by region and calculate average ratings
        for (const store of stores) {
          const region = 'Regional 1'; // Default region since Store interface doesn't have region property
          const responsesRef = collection(db, `stores/${store.id}/responses`);
          const snapshot = await getDocs(responsesRef);
          
          let storeRatingSum = 0;
          let storeRatingCount = 0;
          
          snapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.answers) {
              Object.values(data.answers).forEach((answer: unknown) => {
                if (typeof answer === 'object' && answer !== null && 'questionType' in answer && 'answer' in answer) {
                  const surveyAnswer = answer as SurveyAnswer;
                  if (surveyAnswer.questionType === 'rating' && typeof surveyAnswer.answer === 'number') {
                    storeRatingSum += surveyAnswer.answer;
                    storeRatingCount++;
                  }
                }
              });
            }
          });
          
          if (storeRatingCount > 0) {
            const storeAvg = storeRatingSum / storeRatingCount;
            const existing = regionMap.get(region) || { total: 0, count: 0 };
            regionMap.set(region, {
              total: existing.total + storeAvg,
              count: existing.count + 1
            });
          }
        }
        
        // Convert to array and calculate averages
        const performance = Array.from(regionMap.entries()).map(([region, data]) => ({
          region,
          rating: data.count > 0 ? (data.total / data.count).toFixed(1) : '0.0'
        }));
        
        // Add default regions if no data
        if (performance.length === 0) {
          performance.push(
            { region: 'Regional 1', rating: '0.0' },
            { region: 'Regional 2', rating: '0.0' },
            { region: 'Regional 3', rating: '0.0' }
          );
        }
        
        setRegionalPerformance(performance.slice(0, 3)); // Show top 3
      } catch (error) {
        console.error('Error calculating regional performance:', error);
      } finally {
        setLoading(false);
      }
    };

    if (stores.length > 0) {
      calculateRegionalPerformance();
    }
  }, [stores]);

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Baru saja';
    if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} hari yang lalu`;
  };

  const statsData = [
    { 
      title: 'Total Toko', 
      value: storesLoading ? '...' : stores.length.toString(), 
      icon: Store, 
      color: 'text-blue-600' 
    },
    { 
      title: 'Survei Bulan Ini', 
      value: statsLoading ? '...' : stats.totalResponses.toString(), 
      icon: FileText, 
      color: 'text-green-600' 
    },
    { 
      title: 'Responden Aktif', 
      value: statsLoading ? '...' : Math.floor(stats.totalResponses * 0.8).toString(), 
      icon: Users, 
      color: 'text-purple-600' 
    },
    { 
      title: 'Tingkat Kepuasan', 
      value: statsLoading ? '...' : `${stats.averageRating}/5`, 
      icon: TrendingUp, 
      color: 'text-orange-600' 
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Selamat datang di sistem manajemen pelanggan Labbaik Chicken</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Survei Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300 mx-auto"></div>
                </div>
              ) : recentSurveys.length > 0 ? (
                recentSurveys.map((survey) => (
                  <div key={survey.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{survey.storeName}</p>
                      <p className="text-sm text-gray-500">{formatTimeAgo(survey.submittedAt)}</p>
                    </div>
                    <span className="text-green-600 text-sm">{survey.status}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Belum ada survei terbaru
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Performa Regional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300 mx-auto"></div>
                </div>
              ) : regionalPerformance.length > 0 ? (
                regionalPerformance.map((region) => (
                  <div key={region.region} className="flex items-center justify-between">
                    <span>{region.region}</span>
                    <span className="font-medium">{region.rating}/5</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Belum ada data performa
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}