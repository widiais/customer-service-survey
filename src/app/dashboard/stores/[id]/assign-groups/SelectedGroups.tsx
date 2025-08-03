'use client';

import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { QuestionGroup } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SortableGroupItem } from './SortableGroupItem';

interface SelectedGroupsProps {
  selectedGroups: QuestionGroup[];
  onReorder: (groups: QuestionGroup[]) => void;
  onRemove: (groupId: string) => void;
}

export function SelectedGroups({ selectedGroups, onReorder, onRemove }: SelectedGroupsProps) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = selectedGroups.findIndex(group => group.id === active.id);
      const newIndex = selectedGroups.findIndex(group => group.id === over?.id);
      onReorder(arrayMove(selectedGroups, oldIndex, newIndex));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grup Pertanyaan Terpilih ({selectedGroups.length})</CardTitle>
        <p className="text-sm text-gray-600">Seret untuk mengubah urutan</p>
      </CardHeader>
      <CardContent>
        {selectedGroups.length === 0 ? (
          <p className="text-gray-500">Belum ada grup pertanyaan yang dipilih</p>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={selectedGroups.map(g => g.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {selectedGroups.map(group => (
                  <SortableGroupItem key={group.id} group={group} onRemove={onRemove} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
}