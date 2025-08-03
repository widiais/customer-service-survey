'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuestionGroup } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus } from 'lucide-react';

interface SearchGroupsProps {
  questionGroups: QuestionGroup[];
  selectedGroups: QuestionGroup[];
  onAddGroup: (group: QuestionGroup) => void;
}

export function SearchGroups({ questionGroups, selectedGroups, onAddGroup }: SearchGroupsProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredGroups = searchTerm.trim() 
    ? questionGroups.filter(group => 
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedGroups.some(selected => selected.id === group.id)
      )
    : [];

  const handleAddGroup = (group: QuestionGroup) => {
    onAddGroup(group);
    setSearchTerm('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tambah Grup Pertanyaan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Ketik untuk mencari grup pertanyaan..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          
          {searchTerm.trim() ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredGroups.map(group => (
                <div key={group.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div>
                    <h3 className="font-medium">{group.name}</h3>
                    <p className="text-sm text-gray-600">{group.description}</p>
                    <p className="text-xs text-gray-500">{group.questionIds?.length || 0} pertanyaan</p>
                  </div>
                  <Button size="sm" onClick={() => handleAddGroup(group)}>
                    <Plus className="h-4 w-4 mr-1" />Tambah
                  </Button>
                </div>
              ))}
              {filteredGroups.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Grup pertanyaan "{searchTerm}" tidak ditemukan</p>
                  <Button variant="outline" className="mt-2" onClick={() => router.push('/dashboard/questions/groups/create')}>Buat Grup Baru</Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Mulai ketik untuk mencari grup pertanyaan</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}