'use client';

import { QuestionType } from '@/lib/types';

interface QuestionTypeSelectorProps {
  selectedType: QuestionType;
  onTypeChange: (type: QuestionType) => void;
}

export default function QuestionTypeSelector({ selectedType, onTypeChange }: QuestionTypeSelectorProps) {
  const types = [
    { value: 'text' as QuestionType, label: 'Teks', description: 'Jawaban berupa teks bebas' },
    { value: 'rating' as QuestionType, label: 'Rating', description: 'Skala rating 1-5' },
    { value: 'multiple_choice' as QuestionType, label: 'Pilihan Ganda', description: 'Beberapa opsi pilihan' },
    { value: 'checklist' as QuestionType, label: 'Checklist', description: 'Pilih 1 atau lebih dari opsi yang tersedia' },
    { value: 'slider' as QuestionType, label: 'Slider', description: 'Geser dari merah (rendah) ke hijau (tinggi), 1-10' }
  ];

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Tipe Pertanyaan *
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {types.map((type) => (
          <div
            key={type.value}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              selectedType === type.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onTypeChange(type.value)}
          >
            <div className="flex items-center mb-2">
              <input
                type="radio"
                name="type"
                value={type.value}
                checked={selectedType === type.value}
                onChange={() => onTypeChange(type.value)}
                className="mr-2"
              />
              <span className="font-medium">{type.label}</span>
            </div>
            <p className="text-sm text-gray-600">{type.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}