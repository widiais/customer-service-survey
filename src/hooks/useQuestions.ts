import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, Query, CollectionReference, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Question } from '@/lib/types';

export function useQuestions(storeId?: string) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      let q: Query<DocumentData> | CollectionReference<DocumentData> = collection(db, 'questions');
      
      if (storeId) {
        q = query(collection(db, 'questions'), where('storeId', '==', storeId));
      }
      
      const querySnapshot = await getDocs(q);
      const questionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Question[];
      setQuestions(questionsData);
    } catch (err) {
      setError('Failed to fetch questions');
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = async (questionData: Omit<Question, 'id'>) => {
    try {
      await addDoc(collection(db, 'questions'), questionData);
      await fetchQuestions();
    } catch (err) {
      setError('Failed to add question');
      console.error('Error adding question:', err);
      throw err;
    }
  };

  const updateQuestion = async (id: string, questionData: Partial<Question>) => {
    try {
      await updateDoc(doc(db, 'questions', id), questionData);
      await fetchQuestions();
    } catch (err) {
      setError('Failed to update question');
      console.error('Error updating question:', err);
      throw err;
    }
  };

  const deleteQuestion = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'questions', id));
      await fetchQuestions();
    } catch (err) {
      setError('Failed to delete question');
      console.error('Error deleting question:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [storeId]);

  return {
    questions,
    loading,
    error,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    refetch: fetchQuestions
  };
}