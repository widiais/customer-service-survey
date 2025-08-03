import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import { Question, Category } from '@/lib/types';
import { getTypeLabel, getCategoryName, getCategoryColor } from './helpers';

interface Props {
  question: Question;
  index: number;
  onRemove: (id: string) => void;
  categories: Category[];
}

export function SortableQuestionItem({ question, index, onRemove, categories }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: question.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  
  const categoryBadge = question.categoryId ? (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: getCategoryColor(categories, question.categoryId) }}>
      {getCategoryName(categories, question.categoryId)}
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
      Tanpa Kategori
    </span>
  );

  return (
    <div ref={setNodeRef} style={style} className={`bg-white border rounded-lg p-4 ${isDragging ? 'shadow-lg' : 'shadow-sm'}`}>
      <div className="grid grid-cols-12 gap-4 items-center">
        <div className="col-span-1 flex justify-center">
          <div {...attributes} {...listeners} className="cursor-grab hover:cursor-grabbing p-1 rounded hover:bg-gray-100">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
        </div>
        <div className="col-span-1"><span className="text-sm font-medium text-gray-600">#{index + 1}</span></div>
        <div className="col-span-9">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900">{question.text}</p>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {getTypeLabel(question.type)}
              </span>
              {categoryBadge}
            </div>
          </div>
        </div>
        <div className="col-span-1 flex justify-center">
          <button type="button" onClick={() => onRemove(question.id)} className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors" title="Hapus pertanyaan">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}