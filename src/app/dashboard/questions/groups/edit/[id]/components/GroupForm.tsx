import { Question, Category } from '@/lib/types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableQuestionItem } from './SortableQuestionItem';

interface GroupFormData {
  name: string;
  description: string;
  questionIds: string[];
  mandatoryQuestionIds: string[];
  isActive: boolean;
}

interface Props {
  formData: GroupFormData;
  setFormData: React.Dispatch<React.SetStateAction<GroupFormData>>;
  selectedQuestions: Question[];
  categories: Category[];
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onRemoveQuestion: (questionId: string) => void;
  onToggleMandatory: (questionId: string) => void;
}

export function GroupForm({ formData, setFormData, selectedQuestions, categories, isSubmitting, onSubmit, onCancel, onRemoveQuestion, onToggleMandatory }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setFormData(prev => {
        const oldIndex = prev.questionIds.indexOf(active.id as string);
        const newIndex = prev.questionIds.indexOf(over?.id as string);
        return { ...prev, questionIds: arrayMove(prev.questionIds, oldIndex, newIndex) };
      });
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Informasi Dasar</h2>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Nama Grup *</label>
            <input type="text" id="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Masukkan nama grup" required />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
            <textarea id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Masukkan deskripsi grup (opsional)" />
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Grup aktif</label>
          </div>
        </div>
      </div>

      {/* Selected Questions */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Pertanyaan Terpilih ({selectedQuestions.length})</h2>
        </div>
        
        {selectedQuestions.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={formData.questionIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {selectedQuestions.map((question, index) => (
                  <SortableQuestionItem 
                    key={question.id} 
                    question={question} 
                    index={index} 
                    onRemove={onRemoveQuestion} 
                    categories={categories}
                    isMandatory={formData.mandatoryQuestionIds.includes(question.id)}
                    onToggleMandatory={onToggleMandatory}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Belum ada pertanyaan yang dipilih</p>
            <p className="text-sm mt-1">Pilih pertanyaan dari daftar di bawah</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Batal</button>
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
          {isSubmitting ? 'Menyimpan...' : 'Perbarui Grup'}
        </button>
      </div>
    </form>
  );
}