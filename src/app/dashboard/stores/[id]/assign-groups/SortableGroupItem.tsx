'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { QuestionGroup } from '@/lib/types';
import { X, GripVertical } from 'lucide-react';

interface SortableGroupItemProps {
  group: QuestionGroup;
  onRemove: (groupId: string) => void;
}

export function SortableGroupItem({ group, onRemove }: SortableGroupItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: group.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} className={`flex items-center bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm ${isDragging ? 'opacity-50' : ''}`}>
      <div {...listeners} className="cursor-grab hover:cursor-grabbing mr-2"><GripVertical className="h-4 w-4" /></div>
      <span className="flex-1">{group.name}</span>
      <button onClick={() => onRemove(group.id)} className="ml-2 hover:bg-blue-200 rounded-full p-1"><X className="h-3 w-3" /></button>
    </div>
  );
}