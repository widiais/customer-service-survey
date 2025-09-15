'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuestionGroups } from '@/hooks/useQuestionGroups';
import { useStores } from '@/hooks/useStores';
import { QuestionGroup } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { SelectedGroups } from './SelectedGroups';
import { SearchGroups } from './SearchGroups';

export default function AssignGroupsPage() {
  const router = useRouter();
  const params = useParams();
  const storeId = params.id as string;
  
  const { questionGroups, loading: groupsLoading } = useQuestionGroups();
  const { stores, updateStore } = useStores();
  const [selectedGroups, setSelectedGroups] = useState<QuestionGroup[]>([]);
  
  const currentStore = stores.find(store => store.id === storeId);
  
  useEffect(() => {
    if (currentStore?.questionGroupIds) {
      const assignedGroups = questionGroups.filter(group => 
        currentStore.questionGroupIds?.includes(group.id)
      );
      // Pertahankan urutan sesuai dengan questionGroupIds
      const orderedGroups = currentStore.questionGroupIds.map(id => 
        assignedGroups.find(group => group.id === id)
      ).filter(Boolean) as QuestionGroup[];
      setSelectedGroups(orderedGroups);
    }
  }, [currentStore, questionGroups]);
  
  const handleAddGroup = (group: QuestionGroup) => {
    setSelectedGroups(prev => [...prev, group]);
  };
  
  const handleRemoveGroup = (groupId: string) => {
    setSelectedGroups(prev => prev.filter(group => group.id !== groupId));
  };
  
  const handleReorderGroups = (reorderedGroups: QuestionGroup[]) => {
    setSelectedGroups(reorderedGroups);
  };
  
  const handleSave = async () => {
    try {
      await updateStore(storeId, {
        questionGroupIds: selectedGroups.map(group => group.id)
      });
      router.push('/dashboard/stores');
    } catch {
      alert('Gagal menyimpan grup pertanyaan');
    }
  };
  
  if (groupsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pilih Grup Pertanyaan</h1>
          <p className="text-gray-600">Subject Form: {currentStore?.name}</p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => router.back()}>Batal</Button>
          <Button onClick={handleSave}>Simpan</Button>
        </div>
      </div>
      
      <SelectedGroups 
        selectedGroups={selectedGroups} 
        onReorder={handleReorderGroups} 
        onRemove={handleRemoveGroup} 
      />
      
      <SearchGroups 
        questionGroups={questionGroups} 
        selectedGroups={selectedGroups} 
        onAddGroup={handleAddGroup} 
      />
    </div>
  );
}