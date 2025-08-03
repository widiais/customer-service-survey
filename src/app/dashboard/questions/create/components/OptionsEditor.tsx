'use client';

interface OptionsEditorProps {
  options: string[];
  onOptionsChange: (options: string[]) => void;
}

export default function OptionsEditor({ options, onOptionsChange }: OptionsEditorProps) {
  const addOption = () => {
    onOptionsChange([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length > 1) {
      onOptionsChange(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    onOptionsChange(newOptions);
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Opsi Pilihan *
      </label>
      {options.map((option, index) => (
        <div key={index} className="flex items-center mb-2">
          <input
            type="text"
            value={option}
            onChange={(e) => updateOption(index, e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`Opsi ${index + 1}`}
            required
          />
          {options.length > 1 && (
            <button
              type="button"
              onClick={() => removeOption(index)}
              className="ml-2 px-3 py-2 text-red-600 hover:text-red-800"
            >
              Hapus
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addOption}
        className="mt-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
      >
        + Tambah Opsi
      </button>
    </div>
  );
}