import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { QuestionGroup } from '@/lib/types';

export function useQuestionGroups() {
  const [questionGroups, setQuestionGroups] = useState<QuestionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestionGroups = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'questionGroups'));
      const groupsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as QuestionGroup[];
      setQuestionGroups(groupsData);
    } catch (err) {
      setError('Failed to fetch question groups');
      console.error('Error fetching question groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const addQuestionGroup = async (groupData: Omit<QuestionGroup, 'id'>) => {
    try {
      await addDoc(collection(db, 'questionGroups'), groupData);
      await fetchQuestionGroups();
    } catch (err) {
      setError('Failed to add question group');
      console.error('Error adding question group:', err);
      throw err;
    }
  };

  const updateQuestionGroup = async (id: string, groupData: Partial<QuestionGroup>) => {
    try {
      await updateDoc(doc(db, 'questionGroups', id), {
        ...groupData,
        updatedAt: new Date().toISOString()
      });
      await fetchQuestionGroups();
    } catch (err) {
      setError('Failed to update question group');
      console.error('Error updating question group:', err);
      throw err;
    }
  };

  const deleteQuestionGroup = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'questionGroups', id));
      await fetchQuestionGroups();
    } catch (err) {
      setError('Failed to delete question group');
      console.error('Error deleting question group:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchQuestionGroups();
  }, []);

  return {
    questionGroups,
    loading,
    error,
    addQuestionGroup,
    updateQuestionGroup,
    deleteQuestionGroup,
    refetch: fetchQuestionGroups
  };
}