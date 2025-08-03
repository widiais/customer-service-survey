import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, query, where, orderBy, Query, CollectionReference, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Questionnaire } from '@/lib/types';

export function useQuestionnaires() {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalResponses: 0,
    averageRating: 0,
    membershipRate: 0,
    promoAcceptanceRate: 0
  });

  const fetchQuestionnaires = async (storeId?: string) => {
    try {
      setLoading(true);
      let q: Query<DocumentData> | CollectionReference<DocumentData> = collection(db, 'questionnaires');
      
      if (storeId) {
        q = query(collection(db, 'questionnaires'), where('storeId', '==', storeId));
      }
      
      q = query(q, orderBy('submittedAt', 'desc'));
      
      const querySnapshot = await getDocs(q);
      const questionnairesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Questionnaire[];
      
      setQuestionnaires(questionnairesData);
      calculateStats(questionnairesData);
    } catch (err) {
      setError('Failed to fetch questionnaires');
      console.error('Error fetching questionnaires:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: Questionnaire[]) => {
    if (data.length === 0) {
      setStats({ totalResponses: 0, averageRating: 0, membershipRate: 0, promoAcceptanceRate: 0 });
      return;
    }

    const totalResponses = data.length;
    const membershipCount = data.filter(q => q.customerInfo.agreeToMembership).length;
    const promoCount = data.filter(q => q.customerInfo.agreeToPromo).length;
    
    setStats({
      totalResponses,
      averageRating: 4.2, // Placeholder - implement actual rating calculation
      membershipRate: Math.round((membershipCount / totalResponses) * 100),
      promoAcceptanceRate: Math.round((promoCount / totalResponses) * 100)
    });
  };

  const addQuestionnaire = async (questionnaireData: Omit<Questionnaire, 'id'>) => {
    try {
      await addDoc(collection(db, 'questionnaires'), questionnaireData);
      await fetchQuestionnaires();
    } catch (err) {
      setError('Failed to add questionnaire');
      console.error('Error adding questionnaire:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchQuestionnaires();
  }, []);

  return {
    questionnaires,
    stats,
    loading,
    error,
    addQuestionnaire,
    refetch: fetchQuestionnaires
  };
}