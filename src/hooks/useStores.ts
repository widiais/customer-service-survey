import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Store } from '@/lib/types';

export function useStores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'stores'));
      const storesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Store[];
      setStores(storesData);
    } catch (err) {
      setError('Failed to fetch stores');
      console.error('Error fetching stores:', err);
    } finally {
      setLoading(false);
    }
  };

  const addStore = async (storeData: Omit<Store, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'stores'), {
        ...storeData,
        createdAt: new Date()
      });
      await fetchStores(); // Refresh the list
      return docRef.id;
    } catch (err) {
      setError('Failed to add store');
      console.error('Error adding store:', err);
      throw err;
    }
  };

  const updateStore = async (id: string, data: Partial<Omit<Store, 'id'>>) => {
    try {
      await updateDoc(doc(db, 'stores', id), {
        ...data,
        updatedAt: new Date().toISOString()
      });
      await fetchStores();
    } catch (error) {
      console.error('Error updating store:', error);
      throw error;
    }
  };

  const deleteStore = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'stores', id));
      await fetchStores(); // Refresh the list
    } catch (err) {
      setError('Failed to delete store');
      console.error('Error deleting store:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  return {
    stores,
    loading,
    error,
    addStore,
    updateStore, // Tambahkan ini
    deleteStore,
    refetch: fetchStores
  };
}